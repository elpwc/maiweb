export interface GameRecord {
    criticalPerfect: number,
    perfect: number,
    great: number,
    good: number,
    miss: number,
    fast: number,
    late: number,
    /** 最大COMBO */
    max_combo: number,
    /** 当前COMBO */
    combo: number,
    /** 达成率 0-100 */
    achieving_rate: number,
    /** extra达成率 (BREAK) 0-1 */
    achieving_rate_ex: number,
    /** 已丢失达成率 */
    achieving_rate_lost: number,
    /** DX分数 */
    dx_point: number,
    /** 旧框计分  */
    old_score: number,
    /** 旧框达成率  */
    old_achieving_rate: number,
    tap: {
      criticalPerfect: number,
      perfect: number,
      great: number,
      good: number,
      miss: number,
      fast: number,
      late: number,
    },
    hold: {
      criticalPerfect: number,
      perfect: number,
      great: number,
      good: number,
      miss: number,
      fast: number,
      late: number,
    },
    slide: {
      criticalPerfect: number,
      perfect: number,
      great: number,
      good: number,
      miss: number,
      fast: number,
      late: number,
    },
    touch: {
      criticalPerfect: number,
      perfect: number,
      great: number,
      good: number,
      miss: number,
      fast: number,
      late: number,
    },
    break: {
      criticalPerfect: number,
      perfect: number,
      great: number,
      good: number,
      miss: number,
      fast: number,
      late: number,
    }
};