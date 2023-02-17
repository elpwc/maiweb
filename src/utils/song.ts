import { Sheet } from './sheet';

/** 一整首收录的乐曲信息  https://web.archive.org/web/20210120233836/https://w.atwiki.jp/simai/pages/510.html */
export interface Song {
  /** 标题 */
  title: string;
  /** 作曲家 */
  artist?: string;
  /** bgm */
  wholebpm?: number;

  /** 此曲包含的不同难度的谱面 */
  sheets: Sheet[];

  /** 所有困难度 */
  availableDifficulties: number[];
}
