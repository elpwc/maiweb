/** 计算出的SLIDE TRACK判定图像应该被怎样绘制的属性，用来显示SLIDE TRACK的判定图像用 */
export interface SlideTrackJudgementParams {
  /** 判定图像类型 0 直线，1 curv，2 fan */
  image: number;
  /** 判定图像方向 0 以左旋转，1 以右旋转 */
  direction: number;
  /** 判定图像旋转角度 */
  angle: number;
}
