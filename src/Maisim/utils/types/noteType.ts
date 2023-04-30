/** Note类型 */
export enum NoteType {
  Undefined,

  Tap,
  Hold,
  /** 星星头 */
  Slide,
  /** 星星轨迹 */
  SlideTrack,

  Touch,
  TouchHold,

  /** 空位。目前在 xx/0 这种神秘写法的适配中使用，用来表示位置设置在 0 的工具Note */
  Empty,

  /** 结束标记 */
  EndMark,

  /// 观赏谱Note类型
  /** TOUCH星星 */
  Spec_TouchSlide,
  /** HOLD星星 */
  Spec_HoldSlide,
  /** TOUCHHOLD星星 */
  Spec_TouchHoldSlide,
}

/** 是否不是功能性的Note */
export const isNormalNoteType = (type: NoteType) => {
  return (
    type === NoteType.Tap ||
    type === NoteType.Hold ||
    type === NoteType.Slide ||
    type === NoteType.SlideTrack ||
    type === NoteType.Touch ||
    type === NoteType.TouchHold ||
    type === NoteType.Spec_TouchHoldSlide ||
    type === NoteType.Spec_TouchSlide ||
    type === NoteType.Spec_HoldSlide
  );
};

/** 是否是内屏Note */
export const isInnerScreenNoteType = (type: NoteType) => {
  return type === NoteType.SlideTrack || type === NoteType.Touch || type === NoteType.TouchHold || type === NoteType.Spec_TouchHoldSlide || type === NoteType.Spec_TouchSlide;
};

/** 是否是观赏谱类型 */
export const isSpectatorNoteType = (type: NoteType) => {
  return type === NoteType.Spec_TouchHoldSlide || type === NoteType.Spec_TouchSlide || type === NoteType.Spec_HoldSlide;
};
