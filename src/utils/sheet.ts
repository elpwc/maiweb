import { Difficulty } from './difficulties';
import { Note, Beat } from './note';

/** 一个谱面 */
export interface Sheet {
  /** 谱师 */
  designer?: string;
  /** 难度 EXPERT，MASTER etc */
  difficulty: Difficulty;
  /** 底数 */
  levelNumber: number;
  /** 显示的等级 */
  level: string;
  /** 所有Note */
  notes: Note[];
  /** 每一拍 */
  beats: Beat[];
  /** 乐曲开始後谱面开始播放的时刻 s */
  first: number;
  /** SINGLE MESSAGE */
  smsg?: string;

  /** 宴谱类型 */
  utageType?: string;

  /** 计算分数用：基础评价值（一个TAP的分值） */
  basicEvaluation: number;
  /** 计算分数用：额外评价值（1/5个BREAK的分值） */
  exEvaluation: number;
  /** 计算分数用：旧框理论总分（BREAK按照2500计算） */
  oldTheoreticalScore: number;
  /** 计算分数用：旧框理论Rate */
  oldTheoreticalRate: number;

  tapCount: number;
  breakCount: number;
  breakTapCount: number;
  breakHoldCount: number;
  breakSlideCount: number;
  holdCount: number;
  slideTrackCount: number;
  touchCount: number;
  touchHoldCount: number;

  /** NOTE总数 */
  noteTotalCount: number;
}
