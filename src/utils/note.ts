/** 一拍（可能是空白的，代表空拍） */
export interface Beat {
	// notes: Note[];
	notevalue: number;
	bpm: number;
	// 触发时间
	time: number;

	/** 包含的全部notes的索引 */
	noteIndexes: number[];

	/** touch group */
	touchGroupStatus?: number[];
	/** touch group内已触发数量 */
	touchGroupTouched?: number;
}

/** 一段Slide轨迹 */
export interface SlideLine {
	slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
	pos?: string;
	turnPos?: string;
	endPos?: string;

	/**  持续时间/ms*/
	remainTime?: number;
	/** 开始时的时间 */
	beginTime?: number;
}

/** Slide轨迹 */
export interface SlideTrack {
	slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
	endPos?: string;
	turnPos?: string;
	notevalue?: number;
	notenumber?: number;
	/**  持续时间/ms*/
	remainTime?: number;
	/**  ため時間 */
	stopTime?: number;
	/** 是否是SLIDE CHAIN */
	isChain?: boolean;
	slideLines?: SlideLine[];
}

/** 一个Note */
export interface Note {
	/** 顺序 (实际好像没用过？) */
	index: number;

	/** 唯一标识符（因为数组在排序後会乱掉 */
	serial: number;

	isBreak?: boolean;
	isEx?: boolean;
	isFirework?: boolean;

	/** 位置 / 头位置 */
	pos: string;

	type: number;

	// 伪EACH
	isNiseEach?: boolean;

	// 适用于SLIDE
	slideTracks?: SlideTrack[];

	// 适用于HOLD,TOUCH HOLD, SLIDE不适用
	isShortHold?: boolean;

	// HOLD延时的节拍 ([]里的内容)
	notevalue?: number;
	notenumber?: number;

	/**  持续时间/ms（HOLD）*/
	remainTime?: number;

	// 以下2个属性（还有下面的guideStarEmergeTime）在生成後由speed之类的决定
	/**
	 * 浮现时间/ms
	 *  对于TRACK: TRACK浮现时间（其实就是SLIDE TAP的movetime喵
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

	isEach?: boolean;

	/** 在beats中的索引 */
	beatIndex: number;

	// 这一段的节拍
	partnotevalue: number;
	bpm: number;
	// 触发时间
	time: number;

	///////////////////////// 以下仅适用于SlideTrack///////////////
	slideType?: string; //'-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
	endPos?: string;
	turnPos?: string;
	/**  ため時間 */
	stopTime?: number;

	/** 是否是SLIDE CHAIN */
	isChain?: boolean;
	slideLines?: SlideLine[];

	// 以下在生成後由speed之类的决定
	/** GUIDE STAR开始浮现的时间 */
	guideStarEmergeTime?: number;

	/** SLIDE TRACK 分段的长度 */
	sectionCount?: number;

	/** ? */
	isNoTapSlide?: boolean;
	/** ! */
	isNoTapNoTameTimeSlide?: boolean;

	/** 仅用于谱面读取时 */
	isSlideTrackBreak?: boolean;

	/** 最後SlideLine的角度，用来确定判定图像的角度 */
	slideLineDirection?: number;
	//////////////////////////////////////////////////////////////////

	/** 伪SLIDE TAP(TAP、BREAKを強制的に☆型にする) */
	isStarTap?: boolean;
	/** 伪SLIDE TAP是否旋转 */
	starTapRotate?: boolean;

	/** 伪TAP(SLIDE時にTAP、BREAKを強制的に○型にする) */
	isTapStar?: boolean;

	/** 是否是EACH对头部 */
	isEachPairFirst?: boolean;
	/** EACH对长度 */
	eachPairDistance?: number;

	/** 多TOUCH白框 */
	touchCount?: number; // 1 2

	/** 是否在touch group */
	inTouchGroup?: boolean;

	/** 对应的firework触发Note serial索引(是Note接口中的serial)（有的话 */
	fireworkTriggerIndex?: number;
}
