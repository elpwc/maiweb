export interface SlideTrackJudgementParams {
  /** 判定图像 0 直线，1 curv，2 fan */
  image: number;
  /** 图像方向 0 以左旋转，1 以右旋转 */
  direction: number;
  /** 旋转角度 */
  angle: number;
}
