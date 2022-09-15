export const canvasWidth = 700;
export const canvasHeight = 700;

export const center = [canvasWidth / 2, canvasHeight / 2];

export const maimaiR = 350;
export const maimaiScreenR = maimaiR * 0.8;
export const maimaiJudgeLineR = maimaiScreenR * 0.885;
export const maimaiSummonLineR = maimaiScreenR * 0.22;
export const maimaiTapR = (maimaiScreenR / 9) * 0.8;
export const maimaiBR = maimaiScreenR * 0.418;
export const maimaiER = maimaiScreenR * 0.574;

export const touchMaxDistance = maimaiTapR * 0.8;

export const timerPeriod: number = 15;

export const trackItemGap: number = 25;
export const trackItemWidth: number = maimaiTapR * 1.5;
export const trackItemHeight: number = maimaiTapR * 2;

/** 在判定线停留的时间 ms */
export const judgeLineRemainTime: number = 100;
