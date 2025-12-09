
export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export enum CalendarType {
  GREGORIAN = '國曆',
  LUNAR = '農曆',
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

export interface AnalysisResponse {
  chart: BaZiChart;
  classical: string; // 徐樂吾風格古文
  modern: string;    // 白話文解釋
  summary: string;   // 一語道破總結
}

export interface UserInput {
  birthDate: string;
  birthTime: string;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth: boolean; // 是否為閏月 (農曆用)
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
