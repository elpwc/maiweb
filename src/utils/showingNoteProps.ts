import { JudgeStatus, JudgeTimeStatus } from "./judgeStatus";

/** 当前绘制的Note，包含各类实时变化量 */
export interface ShowingNoteProps {
  /** 所在的Beat的index */
  beatIndex: number;
  /** 在所有Notes中的index */
  noteIndex: number;

  /**
   * TAP:
   * -2: stop at judge line -1: die 0: emerge 1:move
   * HOLD:
   * -2: stop at judge line -1: die 0: emerge 1: grow 2: move 3: disappear 4: fill(充满 长度暂时不改变)
   * SLIDE TRACK:
   * -2: stop at judge line -1: die 0: emerge 1: hangup 2: move
   */
  status: number;
  radius: number;
  // 位置
  rho: number;
  // 仅适用于SLIDE TRACK，GUIDE STAR半径
  guideStarRadius?: number;

  // 从生成到消亡的不间断变化量
  timer: number;

  tailRho: number;
  placeTime: number;

  isEach: boolean;

  // 判定相关
  /** 是否已经被按下 */
  isTouched: boolean;
  /** 按下的时间 HOLD */
  touchedTime?: number;
  // 实时判定显示相关
  judgeStatus: JudgeStatus;
  judgeTime: JudgeTimeStatus;
}
