import { Difficulty } from "./difficulties";
import { Note, Beat } from "./note";

/** 一个谱面 */
export interface Sheet {
  designer?: string;
  difficulty: Difficulty;
  level: number;
  notes: Note[];
  beats: Beat[];

  utageType?: string;
}