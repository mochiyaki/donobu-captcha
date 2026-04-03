export interface CaptchaData {
  type: 'text' | 'image_grid' | 'arrows' | 'slider';
  question: string;
  answer: string | string[] | number | number[];
  data: any;
  id?: number;
  startTime?: number;
  endTime?: number;
  errors?: number;
}

export interface ImageGridData {
  images: {
    emoji: string;
    correct: boolean;
    id: number;
  }[];
  categoryName: string;
}

export interface TextData {
  text: string;
}

export interface ArrowData {
  sequence: string[];
}

export interface SliderData {
  targetPosition: number;
  tolerance: number;
}

export interface Stats {
  totalTime: number;
  totalErrors: number;
  accuracy: string;
  finalScore: number;
  speedRating: string;
  humanScore: number;
  avgTimePerChallenge: number;
}
