import { lineLen } from './drawUtils/_base';
import { cos, sin, π } from './utils/math';

export default class MaimaiValues {
  constructor(canvasWidth: number = 800, canvasHeight: number = 800) {
    this.update(canvasWidth, canvasHeight);
  }

  canvasWidth = 800;
  canvasHeight = 800;

  center: [number, number] = [this.canvasWidth / 2, this.canvasHeight / 2];

  // 屏幕
  maimaiR = this.canvasWidth / 2;
  maimaiScreenR = this.maimaiR * 0.78;
  maimaiJudgeLineR = this.maimaiScreenR * 0.885;
  maimaiSummonLineR = this.maimaiScreenR * 0.22;
  maimaiTapR = (this.maimaiScreenR / 9) * 0.8;
  maimaiBR = this.maimaiScreenR * 0.418;
  maimaiER = this.maimaiScreenR * 0.574;

  touchMaxDistance = this.maimaiTapR * 0.6;

  /** AD区的TOUCH的位置 */
  maimaiADTouchR = this.maimaiJudgeLineR * 0.875;

  /** 1帧的时长 ms */
  timerPeriod: number = 16.6666666666667;

  /** Firework持续时长 ms */
  fireworkLength: number = 1000;
  fireworkInnerCircleR: number = this.maimaiJudgeLineR * 0.4138;

  // 轨迹
  trackItemGap: number = (25 * this.maimaiR) / 350;
  trackItemWidth: number = this.maimaiTapR * 1.5;
  trackItemHeight: number = this.maimaiTapR * 2;

  // HOLD头部高度
  // 准确地说是头像顶端到头部中心点(?)的距离
  holdHeadHeight: number = 70;

  // 判定相关
  /** HOLD 在判定等待判定的最大时间 ms */
  judgeLineRemainTimeHold: number = this.timerPeriod * 10;
  /** TOUCH 在判定等待判定的最大时间 ms */
  judgeLineRemainTimeTouch: number = this.timerPeriod * 18;

  /** 判定结果显示的时间 */
  judgeResultShowTime: number = this.timerPeriod * 35;
  /** 判定结果淡出动画的时长 */
  judgeResultFadeOutDuration: number = this.timerPeriod * 12;
  /** 判定显示标准距离 */
  judgeDistance: number = this.maimaiTapR * 1.5;
  /** 判定特效显示时长 */
  judgeEffectDuration: number = this.timerPeriod * 15;

  // 外键
  keyWidth: number = 1 / 20;
  keyOuterR: number = this.maimaiR;
  keyInnerR: number = this.maimaiR * 0.8;
  keyPressOffset: number = this.maimaiR * 0.02;
  keySideLineDistance: number = (this.keyWidth / 8) * π;
  /** 螺丝孔与按钮侧面的差度 */
  keySideDotDistance: number = ((this.keyWidth * 2) / 5) * π;
  /** 螺丝孔半径 */
  keySideDotR: number = this.maimaiR * 0.005;
  /** 螺丝孔距离屏幕中心距离 */
  keySideDotRtoCenter: number = (this.maimaiR + this.maimaiScreenR) / 2;
  /** 灯占高度比 */
  keyLightWidth: number = 0.2;

  // 1-8判定点的坐标
  APositions: [number, number][] = [];

  //// SLIDE
  // sz轨迹的左右拐点
  szLeftPoint: [number, number] = [0, 0];
  szRightPoint: [number, number] = [0, 0];

  // qp中央圆半径
  qpCenterCircleR = 0;

  // qqpp左右圆圆心距center距离
  qpLeftRightCircleCenterR = 0;
  // qqpp左右圆半径
  qpLeftRighCircleR = 0;

  // qqpp左右圆圆心坐标
  qpLeftCircleCenter = [0, 0];
  qpRightCircleCenter = [0, 0];

  /** qp一条直线的长度 */
  qplen = 0;

  // qq左圆圆心角度
  qpLeftCircleCenterAngle = -0.75;
  // pp右圆圆心角度
  qpRightCircleCenterAngle = 0;

  update = (w: number, h: number) => {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.center = [this.canvasWidth / 2, this.canvasHeight / 2];
    this.maimaiR = this.canvasWidth / 2;
    this.maimaiScreenR = this.maimaiR * 0.78;
    this.maimaiJudgeLineR = this.maimaiScreenR * 0.885;
    this.maimaiSummonLineR = this.maimaiScreenR * 0.22;
    this.maimaiTapR = (this.maimaiScreenR / 9) * 0.8;
    this.maimaiBR = this.maimaiScreenR * 0.418;
    this.maimaiER = this.maimaiScreenR * 0.574;
    this.touchMaxDistance = this.maimaiTapR * 0.6;

    this.maimaiADTouchR = this.maimaiJudgeLineR * 0.875;

    this.fireworkInnerCircleR = this.maimaiJudgeLineR * 0.4138;

    this.trackItemGap = (25 * this.maimaiR) / 350;
    this.trackItemWidth = this.maimaiTapR * 1.5;
    this.trackItemHeight = this.maimaiTapR * 2;

    this.keyOuterR = this.maimaiR;
    this.keyInnerR = this.maimaiR * 0.8;
    this.keyPressOffset = this.maimaiR * 0.02;
    this.keySideDotR = this.maimaiR * 0.005;

    this.keySideDotRtoCenter = (this.maimaiR + this.maimaiScreenR) / 2;

    this.judgeDistance = this.maimaiTapR * 1.5;

    this.APositions = [];
    for (let i = 1; i <= 8; i++) {
      this.APositions.push([this.center[0] + this.maimaiJudgeLineR * cos((-5 / 8 + (1 / 4) * i) * Math.PI), this.center[1] + this.maimaiJudgeLineR * sin((-5 / 8 + (1 / 4) * i) * Math.PI)]);
    }

    let szk = (this.APositions[2][1] - this.APositions[6][1]) / (this.APositions[2][0] - this.APositions[6][0]);
    this.szLeftPoint = [this.APositions[7][0], szk * this.APositions[7][0] + this.APositions[2][1] - this.APositions[2][0] * szk];
    this.szRightPoint = [this.APositions[0][0], szk * this.APositions[0][0] + this.APositions[2][1] - this.APositions[2][0] * szk];

    // qp中央圆半径
    this.qpCenterCircleR = this.maimaiScreenR * 0.356;

    // qqpp左右圆圆心距center距离
    this.qpLeftRightCircleCenterR = this.maimaiScreenR * 0.402;
    // qqpp左右圆半径
    this.qpLeftRighCircleR = this.maimaiScreenR * 0.424;

    // qqpp左右圆圆心坐标
    this.qpLeftCircleCenter = [
      this.center[0] + this.qpLeftRightCircleCenterR * cos(this.qpLeftCircleCenterAngle * π),
      this.center[1] + this.qpLeftRightCircleCenterR * sin(this.qpLeftCircleCenterAngle * π),
    ];
    this.qpRightCircleCenter = [
      this.center[0] + this.qpLeftRightCircleCenterR * cos(this.qpRightCircleCenterAngle * π),
      this.center[1] + this.qpLeftRightCircleCenterR * sin(this.qpRightCircleCenterAngle * π),
    ];

    /** qp一条直线的长度 */
    this.qplen = lineLen(this.APositions[0][0], this.APositions[0][1], this.APositions[5][0], this.APositions[5][1]) / 2;
  };
}
