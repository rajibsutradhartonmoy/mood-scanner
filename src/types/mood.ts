export interface MoodData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

export interface FacialExpression {
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  neutral: number;
  fearful: number;
  disgusted: number;
}

export interface MoodAnalysis {
  primaryEmotion: string;
  confidence: number;
  expressions: FacialExpression;
  aiSummary?: string;
}

export type EmotionType = keyof FacialExpression;
