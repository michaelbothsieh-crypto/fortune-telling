import { Solar, Lunar } from 'lunar-javascript';
import { UserInput, Gender, CalendarType } from '../types';

const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

/// 依據出生資料，計算精確的八字四柱干支與日元
export function calculateBaZi(input: UserInput) {
  const { birthDate, birthTime, gender, calendarType, isLeapMonth, isTimeUnknown } = input;
  const [year, month, day] = birthDate.split('-').map(Number);
  
  const timeStr = isTimeUnknown ? '12:00' : birthTime;
  const [hour, minute] = timeStr.split(':').map(Number);

  let lunar: any;
  
  if (calendarType === CalendarType.LUNAR) {
    const m = isLeapMonth ? -month : month;
    lunar = Lunar.fromYmdHms(year, m, day, hour, minute, 0);
  } else {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    lunar = solar.getLunar();
  }

  const eightChar = lunar.getEightChar();
  
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  
  const hourGan = isTimeUnknown ? '?' : eightChar.getTimeGan();
  const hourZhi = isTimeUnknown ? '?' : eightChar.getTimeZhi();

  const genderNum = gender === Gender.MALE ? 1 : 0;
  const yun = eightChar.getYun(genderNum);
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  let currentDaYun = '未知';
  try {
    const daYunList = yun.getDaYun();
    for (let i = 0; i < daYunList.length; i++) {
      const dy = daYunList[i];
      if (age >= dy.getStartAge() && age <= dy.getEndAge()) {
        currentDaYun = dy.getGanZhi();
        break;
      }
    }
  } catch (e) {
    console.warn('計算大運出錯', e);
  }

  return {
    year: {
      stem: yearGan,
      branch: yearZhi,
      element: `${GAN_WUXING[yearGan] || ''}${ZHI_WUXING[yearZhi] || ''}`,
      shenSha: [] as string[]
    },
    month: {
      stem: monthGan,
      branch: monthZhi,
      element: `${GAN_WUXING[monthGan] || ''}${ZHI_WUXING[monthZhi] || ''}`,
      shenSha: [] as string[]
    },
    day: {
      stem: dayGan,
      branch: dayZhi,
      element: `${GAN_WUXING[dayGan] || ''}${ZHI_WUXING[dayZhi] || ''}`,
      shenSha: [] as string[]
    },
    hour: {
      stem: hourGan,
      branch: hourZhi,
      element: isTimeUnknown ? '未知' : `${GAN_WUXING[hourGan] || ''}${ZHI_WUXING[hourZhi] || ''}`,
      shenSha: [] as string[]
    },
    me: dayGan,
    currentDaYun,
  };
}
