/** Note类型 */
export enum NoteType {
  Empty,

  Tap,
  Hold,
  /** 星星头 */
  Slide,
  /** 星星轨迹 */
  SlideTrack,

  Touch,
  TouchHold,

  /** 结束标记 */
  EndMark,
}

/** 是否不是功能性的Note */
export const isNormalNoteType = (type: NoteType) => {
  return type === NoteType.Tap || type === NoteType.Hold || type === NoteType.Slide || type === NoteType.SlideTrack || type === NoteType.Touch || type === NoteType.TouchHold;
};

/** 是否是内屏Note */
export const isInnerScreenNoteType = (type: NoteType) => {
  return type === NoteType.SlideTrack || type === NoteType.Touch || type === NoteType.TouchHold;
};
