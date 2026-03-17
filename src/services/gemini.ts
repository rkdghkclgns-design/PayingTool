import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GameStructure } from '../models/game-structure';
import type { Product } from '../models/product';
import type { DataSchema } from '../models/schema';
import type { FunnelStage } from '../models/funnel';
import {
  MINDMAP_ANALYSIS_PROMPT,
  PRODUCT_RECOMMENDATION_PROMPT,
  SCHEMA_GENERATION_PROMPT,
  FUNNEL_STRATEGY_PROMPT,
  PRODUCT_MIX_PROMPT,
} from './gemini-prompts';

const STORAGE_KEY = 'paying_tool_gemini_api_key';

export const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  const key = getApiKey();
  return key !== null && key.trim().length > 0;
};

export interface ApiKeyTestResult {
  readonly success: boolean;
  readonly message: string;
  readonly errorType?: 'leaked' | 'invalid' | 'quota' | 'network' | 'unknown';
}

/**
 * 주어진 API 키가 실제로 동작하는지 Gemini API에 간단한 요청을 보내 테스트합니다.
 */
export const testApiKey = async (key: string): Promise<ApiKeyTestResult> => {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say "OK" in one word.');
    const text = result.response.text();
    if (text) {
      return { success: true, message: 'API 키가 정상적으로 작동합니다!' };
    }
    return { success: false, message: '응답이 비어있습니다.', errorType: 'unknown' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('leaked') || msg.includes('disabled')) {
      return {
        success: false,
        errorType: 'leaked',
        message:
          '이 API 키는 Google에 의해 "유출됨(leaked)"으로 감지되어 영구 비활성화되었습니다.\n\n' +
          '원인: 이 키가 공개 GitHub 저장소의 코드에 포함되어 Google의 자동 보안 스캐너가 감지했습니다.\n\n' +
          '해결 방법: Google AI Studio에서 새 API 키를 발급받으세요 (무료, 30초 소요).\n' +
          '같은 Google 계정으로 로그인하면 됩니다.',
      };
    }

    if (msg.includes('API_KEY_INVALID') || msg.includes('invalid')) {
      return {
        success: false,
        errorType: 'invalid',
        message: 'API 키가 유효하지 않습니다. 키를 다시 확인해주세요.',
      };
    }

    if (msg.includes('quota') || msg.includes('429')) {
      return {
        success: false,
        errorType: 'quota',
        message: 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    return {
      success: false,
      errorType: 'network',
      message: `연결 오류: ${msg}`,
    };
  }
};

const createClient = () => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 상단의 설정 버튼에서 API 키를 입력하세요.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const parseJsonResponse = <T>(text: string): T => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
};

/**
 * Google API 에러 메시지를 사용자 친화적 한글 메시지로 변환합니다.
 */
const toUserFriendlyError = (error: unknown): Error => {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('leaked') || msg.includes('disabled')) {
    return new Error(
      'API 키가 Google에 의해 비활성화되었습니다.\n' +
      '사이드바 하단의 "API 키 설정"에서 새 키를 입력해주세요.\n' +
      '새 키는 Google AI Studio(aistudio.google.com/apikey)에서 무료로 발급받을 수 있습니다.'
    );
  }

  if (msg.includes('API_KEY_INVALID') || msg.includes('invalid')) {
    return new Error(
      'API 키가 유효하지 않습니다. 사이드바 하단의 "API 키 설정"에서 올바른 키를 입력해주세요.'
    );
  }

  return error instanceof Error ? error : new Error(msg);
};

const isNonRetryableError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('leaked') ||
    msg.includes('disabled') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('invalid') ||
    msg.includes('403');
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // API 키 관련 에러는 재시도 없이 즉시 종료
      if (isNonRetryableError(error)) {
        throw toUserFriendlyError(error);
      }
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('최대 재시도 횟수를 초과했습니다.');
};

export const analyzeMindmapImage = async (imageBase64: string): Promise<GameStructure> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const result = await model.generateContent([
      MINDMAP_ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);
    const text = result.response.text();
    return parseJsonResponse<GameStructure>(text);
  });
};

export const analyzeMindmapText = async (textContent: string): Promise<GameStructure> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const result = await model.generateContent([
      MINDMAP_ANALYSIS_PROMPT,
      `\n\n다음은 게임 구조를 설명하는 텍스트입니다:\n\n${textContent}`,
    ]);
    const text = result.response.text();
    return parseJsonResponse<GameStructure>(text);
  });
};

export const recommendProducts = async (structure: GameStructure): Promise<Product[]> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const prompt = PRODUCT_RECOMMENDATION_PROMPT.replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2));
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<Product[]>(text);
  });
};

export const generateSchemas = async (
  products: Product[],
  genre?: string,
): Promise<DataSchema[]> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const prompt = SCHEMA_GENERATION_PROMPT
      .replace('{{PRODUCTS}}', JSON.stringify(products, null, 2))
      .replace('{{GENRE}}', genre ?? 'other');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<DataSchema[]>(text);
  });
};

export interface ProductMixRecommendation {
  readonly type: string;
  readonly label: string;
  readonly percentage: number;
  readonly rationale: string;
}

interface ProductMixResponse {
  readonly mix: readonly ProductMixRecommendation[];
}

export const recommendProductMix = async (
  structure: GameStructure
): Promise<readonly ProductMixRecommendation[]> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const prompt = PRODUCT_MIX_PROMPT.replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2));
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse<ProductMixResponse>(text);
    return parsed.mix;
  });
};

export const suggestFunnelStrategies = async (structure: GameStructure): Promise<FunnelStage[]> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const prompt = FUNNEL_STRATEGY_PROMPT.replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2));
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<FunnelStage[]>(text);
  });
};
