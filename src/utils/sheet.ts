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

  /** 基础评价值 */
  basicEvaluation: number;
  /** 额外评价值 */
  exEvaluation: number;
}
