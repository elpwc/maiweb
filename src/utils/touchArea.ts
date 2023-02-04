import { Area } from '../Maisim/areas';

/** 按下一个判定区域的记录 */
export interface TouchArea {
  /** 按下的判定区实例 */
  area: Area;
  /** 按下时的时间 */
  pressTime: number;
}
