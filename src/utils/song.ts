import { Sheet } from "./sheet";

/** 一整首收录的乐曲信息 */
export interface Song {
  title: string;
  artist?: string;
  smsg?: string;
  wholebpm?: number;
  first?: number;
  bg?: string;
  track?: string;

  sheets: Sheet[];

  availableDifficulties: number[];
}
