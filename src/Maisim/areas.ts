import { cos, sin, π } from '../math';
import { isInner, lineLen } from './drawUtils/_base';
import { center, maimaiJudgeLineR, maimaiScreenR, maimaiSummonLineR } from './global';

export interface Area {
  type: string;
  id: number;
  name: string;
  points: [number, number][];
}

export let areas: Area[] = [];

const ar1 = 0.735294 * maimaiJudgeLineR,
  ar2 = 0.67647 * maimaiJudgeLineR,
  br1 = (10.1 / 17) * maimaiJudgeLineR,
  br2 = (8 / 17) * maimaiJudgeLineR,
  br3 = (6.7 / 17) * maimaiJudgeLineR,
  br4 = (5.3 / 17) * maimaiJudgeLineR,
  er1 = (13.5 / 17) * maimaiJudgeLineR, // dr1
  er2 = (11.3 / 17) * maimaiJudgeLineR,
  er3 = (8.4 / 17) * maimaiJudgeLineR;

/** 点在哪个区 */
export const whichArea = (x: number, y: number): Area | undefined => {
  if (lineLen(center[0], center[1], x, y) <= maimaiSummonLineR) {
    return areas.find((area) => {
      return area.name === 'C';
    });
  } else {
    return areas.find((area: Area) => {
      return isInner(x, y, area.points);
    });
  }
};

/** 初始化判定区 */
export const initAreas = () => {
  const cx = center[0],
    cy = center[1];
  //A
  for (let i = 0; i < 8; i++) {
    areas.push({
      type: 'A',
      id: i + 1,
      name: 'A' + (i + 1).toString(),
      points: [
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5 + 0.05) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5 + 0.05) * π)],
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5 + 0.125) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5 + 0.125) * π)],
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5 + 0.2) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5 + 0.2) * π)],
        [cx + ar1 * cos((i * 0.25 - 0.5 + 0.2) * π), cy + ar1 * sin((i * 0.25 - 0.5 + 0.2) * π)],
        [cx + ar2 * cos((i * 0.25 - 0.5 + 0.155) * π), cy + ar2 * sin((i * 0.25 - 0.5 + 0.155) * π)],
        [cx + ar2 * cos((i * 0.25 - 0.5 + 0.095) * π), cy + ar2 * sin((i * 0.25 - 0.5 + 0.095) * π)],
        [cx + ar1 * cos((i * 0.25 - 0.5 + 0.05) * π), cy + ar1 * sin((i * 0.25 - 0.5 + 0.05) * π)],
      ],
    });
  }

  //B
  for (let i = 0; i < 8; i++) {
    areas.push({
      type: 'B',
      id: i + 1,
      name: 'B' + (i + 1).toString(),
      points: [
        [cx + br1 * cos((i * 0.25 - 0.5 + 0.064) * π), cy + br1 * sin((i * 0.25 - 0.5 + 0.064) * π)],
        [cx + br1 * cos((i * 0.25 - 0.5 + 0.186) * π), cy + br1 * sin((i * 0.25 - 0.5 + 0.186) * π)],
        [cx + br2 * cos((i * 0.25 - 0.5 + 0.24) * π), cy + br2 * sin((i * 0.25 - 0.5 + 0.24) * π)],
        [cx + br3 * cos((i * 0.25 - 0.5 + 0.24) * π), cy + br3 * sin((i * 0.25 - 0.5 + 0.24) * π)],
        [cx + br4 * cos((i * 0.25 - 0.5 + 0.125) * π), cy + br4 * sin((i * 0.25 - 0.5 + 0.125) * π)],
        [cx + br3 * cos((i * 0.25 - 0.5 + 0.01) * π), cy + br3 * sin((i * 0.25 - 0.5 + 0.01) * π)],
        [cx + br2 * cos((i * 0.25 - 0.5 + 0.01) * π), cy + br2 * sin((i * 0.25 - 0.5 + 0.01) * π)],
      ],
    });
  }

  //C
  areas.push({
    type: 'C',
    id: 0,
    name: 'C',
    points: [],
  });

  //D
  for (let i = 0; i < 8; i++) {
    areas.push({
      type: 'D',
      id: i + 1,
      name: 'D' + (i + 1).toString(),
      points: [
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5 - 0.05) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5 - 0.05) * π)],
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5) * π)],
        [cx + maimaiScreenR * cos((i * 0.25 - 0.5 + 0.05) * π), cy + maimaiScreenR * sin((i * 0.25 - 0.5 + 0.05) * π)],
        [cx + er1 * cos((i * 0.25 - 0.5 + 0.05) * π), cy + er1 * sin((i * 0.25 - 0.5 + 0.05) * π)],
        [cx + er1 * cos((i * 0.25 - 0.5) * π), cy + er1 * sin((i * 0.25 - 0.5) * π)],
        [cx + er1 * cos((i * 0.25 - 0.5 - 0.05) * π), cy + er1 * sin((i * 0.25 - 0.5 - 0.05) * π)],
      ],
    });
  }

  //E
  for (let i = 0; i < 8; i++) {
    areas.push({
      type: 'E',
      id: i + 1,
      name: 'E' + (i + 1).toString(),
      points: [
        [cx + er1 * cos((i * 0.25 - 0.5) * π), cy + er1 * sin((i * 0.25 - 0.5) * π)],
        [cx + er2 * cos((i * 0.25 - 0.5 + 0.073) * π), cy + er2 * sin((i * 0.25 - 0.5 + 0.073) * π)],
        [cx + er3 * cos((i * 0.25 - 0.5) * π), cy + er3 * sin((i * 0.25 - 0.5) * π)],
        [cx + er2 * cos((i * 0.25 - 0.5 - 0.073) * π), cy + er2 * sin((i * 0.25 - 0.5 - 0.073) * π)],
      ],
    });
  }
};
