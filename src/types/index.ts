export interface User {
  id: string;
  name: string;
  createdAt: number;
}

export interface FlavorProfile {
  sweetness: number; // 甘口度 0-10
  acidity: number; // 酸味 0-10
  umami: number; // 旨味 0-10
  richness: number; // 濃醇度 0-10
  fragrance: number; // 香り 0-10
}

export interface SakeBrand {
  userId: string; // ユーザーID
  id: string;
  name: string;
  brewery?: string;
  region?: string;
  flavorProfile: FlavorProfile;
  createdAt: number;
}

export interface RecommendedSake {
  name: string;
  brewery?: string;
  matchScore: number; // 0-100
  reason: string;
  flavorProfile: FlavorProfile;
  characteristics: string[];
}

export interface MenuAnalysisResult {
  detectedSakes: string[];
  recommendations: RecommendedSake[];
  analysisText: string;
}
