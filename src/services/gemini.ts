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
} from './gemini-prompts';

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env.local 파일에 VITE_GEMINI_API_KEY를 설정하세요.');
  }
  return key;
};

const createClient = () => {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

const parseJsonResponse = <T>(text: string): T => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
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

export const generateSchemas = async (products: Product[]): Promise<DataSchema[]> => {
  return retryWithBackoff(async () => {
    const model = createClient();
    const prompt = SCHEMA_GENERATION_PROMPT.replace('{{PRODUCTS}}', JSON.stringify(products, null, 2));
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse<DataSchema[]>(text);
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
