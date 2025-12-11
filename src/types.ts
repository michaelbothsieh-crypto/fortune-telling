
export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export enum CalendarType {
  GREGORIAN = '國曆',
  LUNAR = '農曆',
}

export enum AnalysisMode {
  BASIC = '八字正宗',
  YEARLY = '流年運勢',
  SCHOLARLY = '古籍考據',
  COMPATIBILITY = '雙人合盤',
}

export interface Pillar {
  stem: string;
  branch: string;
  element?: string;
}

export interface BaZiChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  currentDaYun: string;
  me: string;
}

export interface RadarData {
  career: number;   // 事業
  wealth: number;   // 財運
  love: number;     // 感情
  health: number;   // 健康
  social: number;   // 人際
  family: number;   // 家庭
}

export interface AnalysisResponse {
  chart: BaZiChart;
  chart2?: BaZiChart; // Second person's chart for comparison
  classical: string; // 徐樂吾風格古文
  modern: string;    // 白話文解釋
  summary: string;   // 一語道破總結
  score: number;     // 整體運勢評分 (0-100)
  radar: RadarData;  // 六維雷達圖數據
  usedModel?: string; // 使用的模型名稱
}

export interface UserInput {
  birthDate: string;
  birthTime: string;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth: boolean;
  isTimeUnknown?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DailyFortune {
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  quote: string;
  advice: string;
}
