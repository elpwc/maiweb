import { π } from './utils/math';

export let canvasWidth = 800;
export let canvasHeight = 800;
export const setCanvasSize = (w: number, h: number) => {
  canvasWidth = w;
  canvasHeight = h;
  center = [canvasWidth / 2, canvasHeight / 2];
  maimaiR = canvasWidth / 2;
  maimaiScreenR = maimaiR * 0.78;
  maimaiJudgeLineR = maimaiScreenR * 0.885;
  maimaiSummonLineR = maimaiScreenR * 0.22;
  maimaiTapR = (maimaiScreenR / 9) * 0.8;
  maimaiBR = maimaiScreenR * 0.418;
  maimaiER = maimaiScreenR * 0.574;
  touchMaxDistance = maimaiTapR * 0.6;

  maimaiADTouchR = maimaiJudgeLineR * 0.875;

  fireworkInnerCircleR = maimaiJudgeLineR * 0.4138;

  trackItemGap = (25 * maimaiR) / 350;
  trackItemWidth = maimaiTapR * 1.5;
  trackItemHeight = maimaiTapR * 2;

  keyOuterR = maimaiR;
  keyInnerR = maimaiR * 0.8;
  keyPressOffset = maimaiR * 0.02;
  keySideDotR = maimaiR * 0.005;

  keySideDotRtoCenter = (maimaiR + maimaiScreenR) / 2;

  judgeDistance = maimaiTapR * 1.5;
};

export let center: [number, number] = [canvasWidth / 2, canvasHeight / 2];

// 屏幕
export let maimaiR = canvasWidth / 2;
export let maimaiScreenR = maimaiR * 0.78;
export let maimaiJudgeLineR = maimaiScreenR * 0.885;
export let maimaiSummonLineR = maimaiScreenR * 0.22;
export let maimaiTapR = (maimaiScreenR / 9) * 0.8;
export let maimaiBR = maimaiScreenR * 0.418;
export let maimaiER = maimaiScreenR * 0.574;

export let touchMaxDistance = maimaiTapR * 0.6;

/** AD区的TOUCH的位置 */
export let maimaiADTouchR = maimaiJudgeLineR * 0.875;

/** 1帧的时长 ms */ 
export const timerPeriod: number = 16.6666666666667;

/** Firework持续时长 ms */
export const fireworkLength: number = 1000;
export let fireworkInnerCircleR: number = maimaiJudgeLineR * 0.4138;

// 轨迹
export let trackItemGap: number = (25 * maimaiR) / 350;
export let trackItemWidth: number = maimaiTapR * 1.5;
export let trackItemHeight: number = maimaiTapR * 2;

// HOLD头部高度
// 准确地说是头像顶端到头部中心点(?)的距离
export const holdHeadHeight: number = 70;

// 判定相关
/** HOLD 在判定等待判定的最大时间 ms */
export const judgeLineRemainTimeHold: number = timerPeriod * 10;
/** TOUCH 在判定等待判定的最大时间 ms */
export const judgeLineRemainTimeTouch: number = timerPeriod * 18;

/** 判定结果显示的时间 */
export const judgeResultShowTime: number = timerPeriod * 35;
/** 判定结果淡出动画的时长 */
export const judgeResultFadeOutDuration: number = timerPeriod * 12;
/** 判定显示标准距离 */
export let judgeDistance: number = maimaiTapR * 1.5;
/** 判定特效显示时长 */
export const judgeEffectDuration: number = timerPeriod * 15;

// 外键
export const keyWidth: number = 1 / 20;
export let keyOuterR: number = maimaiR;
export let keyInnerR: number = maimaiR * 0.8;
export let keyPressOffset: number = maimaiR * 0.02;
export const keySideLineDistance: number = (keyWidth / 8) * π;
/** 螺丝孔与按钮侧面的差度 */
export const keySideDotDistance: number = ((keyWidth * 2) / 5) * π;
/** 螺丝孔半径 */
export let keySideDotR: number = maimaiR * 0.005;
/** 螺丝孔距离屏幕中心距离 */
export let keySideDotRtoCenter: number = (maimaiR + maimaiScreenR) / 2;
/** 灯占高度比 */
export const keyLightWidth: number = 0.2;
