import { JudgeStatus, JudgeTimeStatus } from './types/judgeStatus';

/** 当前绘制的Note，包含各类实时变化量 */
export interface ShowingNoteProps {
  /** 所在的Beat的index */
  beatIndex: number;
  /** 在所有Notes中的index */
  noteIndex: number;

  /**
   *  ● TAP:
   * -4: 等待修正 -3: judge -1: die 0: emerge 1:move
   *  ● HOLD:
   * -4: 等待修正 -3: judge -1: die 0: emerge 1: grow 2: move(不能充满，移动)/fill(充满 长度暂时不改变) 3: disappear
   *  ● SLIDE TRACK:
   * -4: 等待修正 -3: judge -1: die 0: emerge 1: hangup 2: move
   *  ● FIREWORK:
   * -1: die 0: wait for trig 1: change
   *  ● TOUCH:
   * -4: 等待修正 -3: judge -2: wait(停留) -1: die 0: emerge 1:converge
   * ※说明：
   * -4(等待修正)：在判定范围内的任何时间被判定後，迅速（在judge.ts内）转变为等待修正状态，之後在对ex,HOLD按压时间导致的判定改变更新完成後，转变为-3（显示判定），TAP沒有被判定会在离开屏幕後进入-4状态；
   * -3(judge)：显示判定文字(PERFECT,GREAT,etc.)的阶段，显示完毕後转变为-1(die)状态；
   * -2(wait)：在正解时刻後持续显示的阶段，只用于TOUCH；
   * -1(die)：完成了整个生命周期，等待从pool中回收；
   */
  status: number;
  /** 当前note本身大小的半径 */
  radius: number;
  /** note距离屏幕中心的距离比 ρ */
  rho: number;
  /** GUIDE STAR半径 */
  guideStarRadius?: number;

  /** 从生成到消亡的不间断变化量 */
  timer: number;

  /** HOLD / TOUCH HOLD尾部位置 */
  tailRho: number;
  /** 开始绘制的时刻 */
  placeTime: number;

  /** 是否是EACH NOTE */
  isEach: boolean;

  // 判定相关
  /** 是否已经被按过 */
  touched: boolean;
  /** 是否正在被按着 */
  isTouching: boolean;
  /** 按下时的时间 HOLD */
  touchedTime?: number;

  // 实时判定显示相关
  /** 判定结果 */
  judgeStatus: JudgeStatus;
  /** 判定FAST LATE */
  judgeTime: JudgeTimeStatus;
  /** BREAK结果细分 范围：CP:1, P:2-3, G:4-6 */
  judgeLevel: number;

  /** 适用于HOLD, SLIDE HOLD 被按下的总时间 */
  holdingTime: number;

  /** 适用于SLIDE TRACK, 当前等待的下一个section index */
  currentSectionIndex: number;
  /** 适用于SLIDE TRACK, 当前GOOD是否是TOO FAST GOOD */
  tooFast?: boolean;

  /** 适用于WIFI, 各个判定区当前等待的下一个section index */
  currentSectionIndexWifi: [number, number, number];

  /** 适用于人体蜈蚣，当前没画完的第一个Line */
  currentLineIndex: number;
  /** 适用于人体蜈蚣，当前显示GUIDE STAR的Line */
  currentGuideStarLineIndex: number;

  /** firework是否已经被触发了 */
  fireworkTrigged?: boolean;

  /** HOLD TOUCH HOLD: 尾判前是否没松手 */
  holdPress?: boolean;
}
