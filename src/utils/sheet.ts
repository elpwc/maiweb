import { Difficulty } from './difficulties';
import { Note, Beat } from './note';

/** 一个谱面 */
export interface Sheet {
  designer?: string;
  difficulty: Difficulty;
  level: number;
  /** 所有Note */
  notes: Note[];
  /** 每一拍 */
  beats: Beat[];

  /** 宴谱类型 */
  utageType?: string;

  /** 计算分数用：基础评价值（一个TAP的分值） */
  basicEvaluation: number;
  /** 计算分数用：额外评价值（1/5个BREAK的分值） */
  exEvaluation: number;
}
