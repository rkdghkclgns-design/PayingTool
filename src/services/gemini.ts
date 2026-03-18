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

// ─── Supabase Edge Function proxy (API key is server-side only) ───
const PROXY_URL = 'https://pkwbqbxuujpcvndpacsc.supabase.co/functions/v1/gemini-proxy';
const MODEL = 'gemini-2.5-flash';

// ─── Gemini API response types ───
interface GeminiResponse {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly { readonly text?: string }[];
    };
  }[];
  readonly error?: { readonly message?: string };
}

/**
 * Call Gemini API via Supabase Edge Function proxy.
 * The API key never touches the client.
 */
const callGemini = async (
  contents: readonly unknown[],
  generationConfig?: Record<string, unknown>,
): Promise<string> => {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      contents,
      ...(generationConfig ? { generationConfig } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API 오류 (${response.status}): ${errorBody}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message ?? 'Gemini API 오류');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('AI 응답이 비어있습니다.');
  }

  return text;
};

// ─── JSON parsing ───
const parseJsonResponse = <T>(text: string): T => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
};

// ─── Error handling ───
const toUserFriendlyError = (error: unknown): Error => {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('leaked') || msg.includes('disabled')) {
    return new Error('API 키가 비활성화되었습니다. 관리자에게 문의해주세요.');
  }
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return new Error('API 키가 비활성화되었습니다. 관리자에게 문의해주세요.\n(Google AI Studio에서 새 키를 발급받아 Supabase Secrets에 등록이 필요합니다)');
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return new Error('API 요청 한도를 초과했습니다. 1~2분 후 다시 시도해주세요.');
  }

  return error instanceof Error ? error : new Error(msg);
};

const isNonRetryableError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('leaked') ||
    msg.includes('disabled') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('403');
};

const is429Error = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
};

// ─── Client-side request throttling ───
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

const throttleRequest = async (): Promise<void> => {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> => {
  await throttleRequest();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (isNonRetryableError(error)) {
        throw toUserFriendlyError(error);
      }
      if (attempt === maxRetries - 1) {
        throw toUserFriendlyError(error);
      }
      const delay = is429Error(error)
        ? Math.pow(2, attempt) * 5000
        : Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('최대 재시도 횟수를 초과했습니다.');
};

// ─── Public API functions ───

export const analyzeMindmapImage = async (imageBase64: string): Promise<GameStructure> => {
  return retryWithBackoff(async () => {
    const text = await callGemini([
      {
        role: 'user',
        parts: [
          { text: MINDMAP_ANALYSIS_PROMPT },
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
        ],
      },
    ]);
    return parseJsonResponse<GameStructure>(text);
  });
};

export const analyzeMindmapText = async (textContent: string): Promise<GameStructure> => {
  return retryWithBackoff(async () => {
    const prompt = `${MINDMAP_ANALYSIS_PROMPT}\n\n다음은 게임 구조를 설명하는 텍스트입니다:\n\n${textContent}`;
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    return parseJsonResponse<GameStructure>(text);
  });
};

export const recommendProducts = async (structure: GameStructure): Promise<Product[]> => {
  return retryWithBackoff(async () => {
    const prompt = PRODUCT_RECOMMENDATION_PROMPT.replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2));
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    return parseJsonResponse<Product[]>(text);
  });
};

export const generateSchemas = async (
  products: Product[],
  genre?: string,
): Promise<DataSchema[]> => {
  return retryWithBackoff(async () => {
    const prompt = SCHEMA_GENERATION_PROMPT
      .replace('{{PRODUCTS}}', JSON.stringify(products, null, 2))
      .replace('{{GENRE}}', genre ?? 'other');
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
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
  structure: GameStructure,
  userRequirements?: string,
): Promise<readonly ProductMixRecommendation[]> => {
  return retryWithBackoff(async () => {
    let prompt = PRODUCT_MIX_PROMPT.replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2));

    if (userRequirements && userRequirements.trim().length > 0) {
      prompt += `\n\n[사용자 필수 요구사항]\n다음 요구사항을 반드시 반영하세요:\n${userRequirements.trim()}`;
    }

    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    const parsed = parseJsonResponse<ProductMixResponse>(text);
    return parsed.mix;
  });
};

export const suggestFunnelStrategies = async (
  structure: GameStructure,
  products?: readonly Product[],
): Promise<FunnelStage[]> => {
  return retryWithBackoff(async () => {
    const productsSummary = products && products.length > 0
      ? JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, priceUSD: p.priceUSD })), null, 2)
      : '[]';
    const prompt = FUNNEL_STRATEGY_PROMPT
      .replace('{{GAME_STRUCTURE}}', JSON.stringify(structure, null, 2))
      .replace('{{PRODUCTS}}', productsSummary);
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    return parseJsonResponse<FunnelStage[]>(text);
  });
};
