import { GoogleGenerativeAI } from '@google/generative-ai';
import { FlavorProfile, SakeBrand, MenuAnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export const GeminiService = {
  async analyzeSakeBrand(brandName: string): Promise<{
    identifiedName: string;
    brewery?: string;
    region?: string;
    flavorProfile: FlavorProfile;
  }> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `あなたは日本酒の専門家です。以下の日本酒の銘柄について、正確な情報を提供してください。

銘柄名: ${brandName}

以下のJSON形式で回答してください：
{
  "identifiedName": "正確な銘柄名",
  "brewery": "蔵元名（わかる場合）",
  "region": "産地（わかる場合）",
  "flavorProfile": {
    "sweetness": 0-10の数値（甘口度）,
    "acidity": 0-10の数値（酸味）,
    "umami": 0-10の数値（旨味）,
    "richness": 0-10の数値（濃醇度）,
    "fragrance": 0-10の数値（香りの強さ）
  }
}

※該当する銘柄が見つからない場合は、入力された名前をそのまま使用し、一般的な日本酒の特徴を設定してください。`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing sake brand:', error);
      return {
        identifiedName: brandName,
        flavorProfile: {
          sweetness: 5,
          acidity: 5,
          umami: 5,
          richness: 5,
          fragrance: 5
        }
      };
    }
  },

  async analyzeMenuAndRecommend(
    imageBase64: string,
    userBrands: SakeBrand[]
  ): Promise<MenuAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const userPreferences = userBrands.map(brand => {
      const fp = brand.flavorProfile;
      return `- ${brand.name}: 甘口度${fp.sweetness}, 酸味${fp.acidity}, 旨味${fp.umami}, 濃醇度${fp.richness}, 香り${fp.fragrance}`;
    }).join('\n');

    const prompt = `あなたは日本酒の専門家です。画像内の日本酒メニューを分析し、ユーザーの好みに合った日本酒をおすすめしてください。

【ユーザーが好きな日本酒】
${userPreferences}

【タスク】
1. 画像内に記載されている日本酒の銘柄をすべて抽出してください
2. 各銘柄の味の特徴を分析してください
3. ユーザーの好みに合う銘柄を3つ選び、理由を説明してください

以下のJSON形式で回答してください：
{
  "detectedSakes": ["銘柄1", "銘柄2", ...],
  "recommendations": [
    {
      "name": "銘柄名",
      "brewery": "蔵元名（わかる場合）",
      "matchScore": 0-100の数値（マッチ度）,
      "reason": "おすすめの理由",
      "flavorProfile": {
        "sweetness": 0-10,
        "acidity": 0-10,
        "umami": 0-10,
        "richness": 0-10,
        "fragrance": 0-10
      },
      "characteristics": ["特徴1", "特徴2", "特徴3"]
    }
  ],
  "analysisText": "メニュー全体の傾向と分析"
}`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        }
      ]);

      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing menu:', error);
      throw error;
    }
  }
};
