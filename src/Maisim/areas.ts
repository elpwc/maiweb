import { abs, atan, cos, sin, π } from '../math';
import { isInner, lineLen } from './drawUtils/_base';
import { center, keyInnerR, keyOuterR, keyWidth, maimaiADTouchR, maimaiBR, maimaiER, maimaiJudgeLineR, maimaiScreenR, maimaiSummonLineR } from './const';

/** 一块判定区 */
export interface Area {
  /** A B C.. */
  type: string;
  /** 1 2 3 4 5 6 7 8 */
  id: number;
  /** A1 B2 C3... */
  name: string;
  /** 围住的多边形的所有顶点 */
  points: [number, number][];

  // 适用于key(外键) 绘制外键的时候用
  leftAngle?: number;
  rightAngle?: number;
}

/** 内屏各个判定区 A B C D E */
export let areas: Area[] = [];

/** 各个外键 K */
export let keys: Area[] = [];

let ar1 = 0.735294 * maimaiJudgeLineR,
  ar2 = 0.67647 * maimaiJudgeLineR,
  br1 = (10.1 / 17) * maimaiJudgeLineR,
  br2 = (8 / 17) * maimaiJudgeLineR,
  br3 = (6.7 / 17) * maimaiJudgeLineR,
  br4 = (5.3 / 17) * maimaiJudgeLineR,
  er1 = (13.5 / 17) * maimaiJudgeLineR, // dr1
  er2 = (11.3 / 17) * maimaiJudgeLineR,
  er3 = (8.4 / 17) * maimaiJudgeLineR;

/** 根据区域名 A1,C,E2,K3 获取指定的区域实例，接受C1,C2和K1-K8的输入 */
export const getArea = (name: string): Area | undefined => {
  if (!name) return;
  const first_char = name.substring(0, 1);
  if (first_char === 'C') {
    return keys.find((area: Area) => {
      return area.type === 'C';
    });
  } else if (first_char === 'K') {
    return keys.find((key: Area) => {
      return key.type === 'K' && key.id === Number(name.substring(1, 2));
    });
  } else {
    return areas.find((area: Area) => {
      return area.type === first_char && area.id === Number(name.substring(1, 2));
    });
  }
};

/** 点在哪个区 */
export const whichArea = (x: number, y: number): Area | undefined => {
  const r = lineLen(center[0], center[1], x, y);
  if (r <= maimaiSummonLineR) {
    return areas.find(area => {
      return area.name === 'C';
    });
  } else if (r <= keyOuterR && r >= keyInnerR) {
    const angle1 = atan((x - center[0]) / (y - center[1]));
    let resAngle = 0;
    if (y > center[1]) {
      resAngle = 0.5 * π - angle1;
    } else {
      if (x > center[0]) {
        resAngle = 0.5 * π - angle1 - π;
      } else {
        resAngle = 0.5 * π - angle1 + π;
      }
    }
    return keys.find((area: Area) => {
      return area.type === 'K' && resAngle >= area.leftAngle! && resAngle <= area.rightAngle!;
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

  ar1 = 0.735294 * maimaiJudgeLineR;
  ar2 = 0.67647 * maimaiJudgeLineR;
  br1 = (10.1 / 17) * maimaiJudgeLineR;
  br2 = (8 / 17) * maimaiJudgeLineR;
  br3 = (6.7 / 17) * maimaiJudgeLineR;
  br4 = (5.3 / 17) * maimaiJudgeLineR;
  er1 = (13.5 / 17) * maimaiJudgeLineR;
  er2 = (11.3 / 17) * maimaiJudgeLineR;
  er3 = (8.4 / 17) * maimaiJudgeLineR;

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

  //K
  for (let i = 0; i < 8; i++) {
    keys.push({
      type: 'K',
      id: i + 1,
      name: 'K' + (i + 1).toString(),
      points: [],
      leftAngle: (i * 0.25 - 0.5 + 0.125 - keyWidth) * π,
      rightAngle: (i * 0.25 - 0.5 + 0.125 + keyWidth) * π,
    });
  }
};

/**
 * 指定pos的TOUCH的中心
 * @param pos
 */
export const getTouchCenterCoord = (pos: string): [number, number] => {
  const firstChar = pos.substring(0, 1);
  const touchPos = pos.substring(1, 2);
  let x = 0,
    y = 0;
  let θ = 0;
  switch (firstChar) {
    case 'C':
      x = center[0];
      y = center[1];
      break;
    case 'A':
      θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
      x = center[0] + maimaiADTouchR * Math.cos(θ);
      y = center[1] + maimaiADTouchR * Math.sin(θ);
      break;
    case 'B':
      θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
      x = center[0] + maimaiBR * Math.cos(θ);
      y = center[1] + maimaiBR * Math.sin(θ);
      break;
    case 'D':
      θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
      x = center[0] + maimaiADTouchR * Math.cos(θ);
      y = center[1] + maimaiADTouchR * Math.sin(θ);
      break;
    case 'E':
      θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
      x = center[0] + maimaiER * Math.cos(θ);
      y = center[1] + maimaiER * Math.sin(θ);
      break;
    default:
      break;
  }

  return [x, y];
};
