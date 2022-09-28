import { π } from '../math';

export const canvasWidth = 800;
export const canvasHeight = 800;

export const center = [canvasWidth / 2, canvasHeight / 2];

// 屏幕
export const maimaiR = 350;
export const maimaiScreenR = maimaiR * 0.78;
export const maimaiJudgeLineR = maimaiScreenR * 0.885;
export const maimaiSummonLineR = maimaiScreenR * 0.22;
export const maimaiTapR = (maimaiScreenR / 9) * 0.8;
export const maimaiBR = maimaiScreenR * 0.418;
export const maimaiER = maimaiScreenR * 0.574;

export const touchMaxDistance = maimaiTapR * 0.8;

/** AD区的TOUCH的位置 */
export const maimaiADTouchR = maimaiJudgeLineR * 0.875;

// 帧
export const timerPeriod: number = 16.6666666666667;

// 轨迹
export const trackItemGap: number = 25;
export const trackItemWidth: number = maimaiTapR * 1.5;
export const trackItemHeight: number = maimaiTapR * 2;

// HOLD头部高度
// 准确地说是头像顶端到头部中心点(?)的距离
export const holdHeadHeight: number = 70;

// 判定相关
/** TAP 在判定线停留的时间 ms */
export const judgeLineRemainTimeTap: number = timerPeriod * 10;
/** TOUCH 在判定後停留的时间 ms */
export const judgeLineRemainTimeTouch: number = timerPeriod * 18;

// 外键
export const keyWidth: number = 1 / 20;
export const keyOuterR: number = maimaiR;
export const keyInnerR: number = maimaiR * 0.8;
export const keyPressOffset: number = maimaiR * 0.02;
export const keySideLineDistance: number = (keyWidth / 8) * π;
/** 螺丝孔与按钮侧面的差度 */
export const keySideDotDistance: number = ((keyWidth * 2) / 5) * π;
/** 螺丝孔半径 */
export const keySideDotR: number = maimaiR * 0.005;
/** 螺丝孔距离屏幕中心距离 */
export const keySideDotRtoCenter: number = (maimaiR + maimaiScreenR) / 2;
/** 灯占高度比 */
export const keyLightWidth: number = 0.2;
