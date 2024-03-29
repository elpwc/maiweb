import { GameState } from './types/gamestate';
import { AutoType } from './types/autoType';
import { BackgroundType } from './types/backgroundType';
import { FlipMode } from './types/flipMode';
import { ScoreCalculationType } from './types/judgeStatus';
import { TapStyles, RegularStyles, SlideColor } from './types/noteStyles';
import { SheetSecondaryProps } from './sheet';
import { GameRecord } from './types/gameRecord';

export interface MaisimProps {
  /** 唯一标识，当有多个Maisim时，请为每个Maisim分配不同的id */
  id: string;

  /** 宽度 */
  w: number;
  /** 高度 */
  h: number;

  style?: React.CSSProperties | undefined;

  tapStyle?: TapStyles;
  holdStyle?: RegularStyles;
  slideStyle?: RegularStyles;
  slideColor?: SlideColor;

  /** 镜像 */
  flipMode?: FlipMode;

  /** 显示特效 */
  doShowEffect?: boolean;
  /** 显示判定 */
  doShowJudgement?: boolean;
  /** 外围颜色 */
  outerColor: string;
  /** 自动 */
  isAuto: boolean;
  /** 自动的模式 */
  autoType?: AutoType;
  /** 外键 */
  doShowKeys?: boolean;
  /** 中央显示 */
  centerText?: number;

  /** 谱 */
  sheet: string;
  /** 谱面属性 */
  sheetProps?: SheetSecondaryProps;
  /** 曲 */
  track?: string;
  /** 背景显示方式 */
  backgroundType?: BackgroundType;
  /** 在背景显示为Video时是否在播放前显示背景图 */
  doShowBGImageBeforePlay?: boolean;
  /** 背景图 */
  backgroundImage?: string;
  /** BGA */
  backgroundAnime?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 背景亮度 0~1 */
  backgroundLightness?: number;

  gameState: GameState;
  setGameState?: (gameState: GameState) => void;
  onPlayStart?: (duration: number) => void;
  onGameRecordChange?: (gameRecord: GameRecord) => void;
  onPlayFinish?: () => void;
  onPlayPause?: () => void;
  onPlayResume?: () => void;
  onProgress?: (progress: number) => void,

  seekAction?: { progress: number } | undefined,

  /** 是否显示UI遮盖层 */
  doShowUIContent?: boolean;
  /** UI遮盖层 */
  uiContent?: JSX.Element;

  /** 屏幕/按钮点击事件 */
  onScreenPressDown?: (key: string) => void;
  onScreenPressUp?: (key: string) => void;

  /** 按钮灯光控制 */
  lightStatus?: string[];

  /** 是否启用键盘打歌，启用的话，内屏NOTE都会auto */
  doEnableKeyboard?: boolean;
  /** TAP速度 */
  speedTap?: number;
  speedTouch?: number;
  scoreCalculationType?: ScoreCalculationType;
  slideTrackOffset?: number;
  /** 播放倍速 */
  playSpeedFactor?: number;
  /** 当前播放时刻 */
  songTrackTick?: number;
  /** 播放进度前进 */
  onTrackProcess?: (currentTick: number) => void;
  /** 调试mode */
  isInDev?: boolean;
}
