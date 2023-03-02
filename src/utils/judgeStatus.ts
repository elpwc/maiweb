/** 判定结果 */
export enum JudgeStatus {
  CriticalPerfect,
  Perfect,
  Great,
  Good,
  Miss,
}

/** 判定FAST LATE */
export enum JudgeTimeStatus {
  Fast,
  Late,
}

/** 分数计算方式 */
export enum ScoreCalculationType {
  maimai,
  maimaiDX
}