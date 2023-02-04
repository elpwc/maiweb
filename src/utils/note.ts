import { NoteType } from './noteType';
import { SlideTrackJudgementParams } from './slideTrackJudgementParams';

/** 一拍（可能是空白的，代表空拍） */
export interface Beat {
  // notes: Note[];
  /** 这一拍的节拍 */
  notevalue: number;
  /** 这一拍的BPM */
  bpm: number;
  /** 触发时间 */
  time: number;

  /** 包含的全部notes的索引 */
  noteIndexes: number[];

  /** touch group */
  touchGroupStatus?: number[];
  /** touch group内已触发数量 */
  touchGroupTouched?: number;
}

/** (人体蜈蚣中的)一段Slide轨迹 */
export interface SlideLine {
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 开始位置 '1'-'8' */
  pos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;
  /** 结束位置 '1'-'8' */
  endPos?: string;

  /**  持续时间/ms*/
  remainTime?: number;
  /** 开始时的时间 */
  beginTime?: number;
}

/** Slide轨迹 */
export interface SlideTrack {
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 结束位置 '1'-'8' */
  endPos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;

  // HOLD延时的节拍 ([]里的内容)
  /** HOLD演示节拍[]里内容的前一个数字 */
  notevalue?: number;
  /** HOLD演示节拍[]里内容的後一个数字 */
  notenumber?: number;

  /**  持续时间/ms*/
  remainTime?: number;
  /**  ため時間 */
  stopTime?: number;
  /** 是否是SLIDE CHAIN（人体蜈蚣） */
  isChain?: boolean;
  /** (人体蜈蚣)包含的子轨迹 */
  slideLines?: SlideLine[];
}

/** 一个Note */
export interface Note {
  /** 顺序 (实际好像没用过？) */
  index: number;

  /** 唯一标识符（因为数组在排序後会乱掉 */
  serial: number;

  /** 是否是绝赞 */
  isBreak?: boolean;
  /** 是否有保护套 */
  isEx?: boolean;
  /** 是不是一个烟花特效而不是正常Note（没错，烟花特效也是当作Note被处理的（）） */
  isFirework?: boolean;

  /** 位置 / 头位置 */
  pos: string;

  /** Note类型 */
  type: NoteType;

  /** 是否是伪EACH https://w.atwiki.jp/simai/pages/25.html#id_62a860a2 */
  isNiseEach?: boolean;

  // 适用于SLIDE
  /** 适用于SLIDE, 这个SLIDE後面的所有TRACKS */
  slideTracks?: SlideTrack[];

  // 适用于HOLD,TOUCH HOLD, SLIDE不适用
  /** 适用于HOLD,TOUCH HOLD, 是否是TAP型HOLD */
  isShortHold?: boolean;

  // HOLD延时的节拍 ([]里的内容)
  /** HOLD演示节拍[]里内容的前一个数字 */
  notevalue?: number;
  /** HOLD演示节拍[]里内容的後一个数字 */
  notenumber?: number;

  /** 此Note的持续时间/ms（HOLD）*/
  remainTime?: number;

  // 以下2个属性（还有下面的guideStarEmergeTime）在生成後由speed之类的决定
  /**
   * 浮现时间/ms
   *  对于TRACK: 是TRACK的浮现时间（其实就是SLIDE TAP的movetime喵）
   * ⚠注意⚠：
   * 所有Note的emergeTime在maireader中均未被定义
   * 是在读取谱面数据後根据速度设定计算的
   * */
  emergeTime?: number;
  /**
   * 移动时间/ms
   *  对于TRACK: GUIDE STAR开始移动的时间
   */
  moveTime?: number;

  /** 是否是EACH */
  isEach?: boolean;

  /** 在beats中的索引 */
  beatIndex: number;

  /** 这一段的节拍 */
  partnotevalue: number;
  /** 这一段的BPM */
  bpm: number;
  /** 这个Note应当被判定的时间 */
  time: number;

  ///////////////////////// 以下仅适用于SlideTrack///////////////
  /** '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' */
  slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  /** 结束位置 '1'-'8' */
  endPos?: string;
  /** 适用于V, 转向位置 '1'-'8' */
  turnPos?: string;
  /**  ため時間 */
  stopTime?: number;

  /** 是否是SLIDE CHAIN（人体蜈蚣） */
  isChain?: boolean;
  /**这段人体蜈蚣里的所有TRACK */
  slideLines?: SlideLine[];

  // 以下在生成後由speed之类的决定
  /** GUIDE STAR开始浮现的时间 */
  guideStarEmergeTime?: number;

  /** SLIDE TRACK 分段的长度 */
  sectionCount?: number;

  /** ? （无头SLIDE TRACK）https://w.atwiki.jp/simai/pages/25.html#id_25968468  */
  isNoTapSlide?: boolean;
  /** ! （无头闪现SLIDE TRACK）https://w.atwiki.jp/simai/pages/25.html#id_25968468 */
  isNoTapNoTameTimeSlide?: boolean;

  /** 仅用于谱面读取时 */
  isSlideTrackBreak?: boolean;

  /** 最後SlideLine的角度，用来确定判定图像的角度 */
  slideLineDirectionParams?: SlideTrackJudgementParams;
  //////////////////////////////////////////////////////////////////

  /** 伪SLIDE TAP(TAP、BREAKを強制的に☆型にする) */
  isStarTap?: boolean;
  /** 伪SLIDE TAP是否旋转 */
  starTapRotate?: boolean;

  /** 伪TAP(SLIDE時にTAP、BREAKを強制的に○型にする) */
  isTapStar?: boolean;

  /** 是否是「EACH对」的头部，用来画EACH对的黄线 */
  isEachPairFirst?: boolean;
  /** 「EACH对」长度，用来画EACH对的黄线 */
  eachPairDistance?: number;

  /** 多TOUCH白框，应当根据谱面流速在开始游戏後算出，该改了 */
  touchCount?: number; // 1 2

  /** 适用于TOUCH，此TOUCH是否在一个touch group中 */
  inTouchGroup?: boolean;

  /** 对应的firework触发Note serial索引(是Note接口中的serial)（有的话 */
  fireworkTriggerIndex?: number;
}
