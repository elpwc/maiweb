import { abs, atan, cos, isANumber, sin, π } from './utils/math';
import { isInner, lineLen } from './drawUtils/_base';
import { FlipMode } from './utils/types/flipMode';
import MaimaiValues from './maimaiValues';
import { SpecPos } from './spectator/specPos';
import { SpecPosType } from './spectator/specPosType';

/** 一块判定区 */
export interface Area {
  /** A B C.. */
  type: string;
  /** 1 2 3 4 5 6 7 8 */
  id: number;
  /** A1 B2 C3... N*/ /* N: None 用于一般范围以外的观赏谱Notes */ name: string;
  /** 围住的多边形的所有顶点 */
  points: [number, number][];

  // 适用于key(外键) 绘制外键的时候用
  leftAngle?: number;
  rightAngle?: number;
}

export class AreaUtils {
  constructor(values: MaimaiValues) {
    this.values = values;
    this.initAreas(values);
  }

  private values: MaimaiValues = new MaimaiValues();

  /** 内屏各个判定区 A B C D E */
  areas: Area[] = [];

  /** 各个外键 K */
  keys: Area[] = [];

  private ar1 = 0.735294 * this.values.maimaiJudgeLineR;
  private ar2 = 0.67647 * this.values.maimaiJudgeLineR;
  private br1 = (10.1 / 17) * this.values.maimaiJudgeLineR;
  private br2 = (8 / 17) * this.values.maimaiJudgeLineR;
  private br3 = (6.7 / 17) * this.values.maimaiJudgeLineR;
  private br4 = (5.3 / 17) * this.values.maimaiJudgeLineR;
  private er1 = (13.5 / 17) * this.values.maimaiJudgeLineR; // dr1
  private er2 = (11.3 / 17) * this.values.maimaiJudgeLineR;
  private er3 = (8.4 / 17) * this.values.maimaiJudgeLineR;

  /** 根据区域名 A1,C,E2,K3 获取指定的区域实例，接受C1,C2和K1-K8的输入 */
  getArea = (name: string): Area | undefined => {
    if (!name) return;
    const first_char = name.substring(0, 1);
    if (first_char === 'C') {
      return this.keys.find((area: Area) => {
        return area.type === 'C';
      });
    } else if (first_char === 'K') {
      return this.keys.find((key: Area) => {
        return key.type === 'K' && key.id === Number(name.substring(1, 2));
      });
    } else {
      return this.areas.find((area: Area) => {
        return area.type === first_char && area.id === Number(name.substring(1, 2));
      });
    }
  };

  /** 点在哪个区 */
  whichArea = (x: number, y: number): Area | undefined => {
    const r = lineLen(this.values.center[0], this.values.center[1], x, y);
    if (r <= this.values.maimaiSummonLineR) {
      return this.areas.find(area => {
        return area.name === 'C';
      });
    } else if (r <= this.values.keyOuterR && r >= this.values.keyInnerR) {
      const angle1 = atan((x - this.values.center[0]) / (y - this.values.center[1]));
      let resAngle = 0;
      if (y > this.values.center[1]) {
        resAngle = 0.5 * π - angle1;
      } else {
        if (x > this.values.center[0]) {
          resAngle = 0.5 * π - angle1 - π;
        } else {
          resAngle = 0.5 * π - angle1 + π;
        }
      }
      return this.keys.find((area: Area) => {
        return area.type === 'K' && resAngle >= area.leftAngle! && resAngle <= area.rightAngle!;
      });
    } else {
      return this.areas.find((area: Area) => {
        return isInner(x, y, area.points);
      });
    }
  };

  /** 初始化判定区 */
  initAreas = (values: MaimaiValues) => {
    const cx = this.values.center[0],
      cy = this.values.center[1];

    this.ar1 = 0.735294 * this.values.maimaiJudgeLineR;
    this.ar2 = 0.67647 * this.values.maimaiJudgeLineR;
    this.br1 = (10.1 / 17) * this.values.maimaiJudgeLineR;
    this.br2 = (8 / 17) * this.values.maimaiJudgeLineR;
    this.br3 = (6.7 / 17) * this.values.maimaiJudgeLineR;
    this.br4 = (5.3 / 17) * this.values.maimaiJudgeLineR;
    this.er1 = (13.5 / 17) * this.values.maimaiJudgeLineR;
    this.er2 = (11.3 / 17) * this.values.maimaiJudgeLineR;
    this.er3 = (8.4 / 17) * this.values.maimaiJudgeLineR;

    //A
    for (let i = 0; i < 8; i++) {
      this.areas.push({
        type: 'A',
        id: i + 1,
        name: 'A' + (i + 1).toString(),
        points: [
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5 + 0.05) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5 + 0.05) * π)],
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5 + 0.125) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5 + 0.125) * π)],
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5 + 0.2) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5 + 0.2) * π)],
          [cx + this.ar1 * cos((i * 0.25 - 0.5 + 0.2) * π), cy + this.ar1 * sin((i * 0.25 - 0.5 + 0.2) * π)],
          [cx + this.ar2 * cos((i * 0.25 - 0.5 + 0.155) * π), cy + this.ar2 * sin((i * 0.25 - 0.5 + 0.155) * π)],
          [cx + this.ar2 * cos((i * 0.25 - 0.5 + 0.095) * π), cy + this.ar2 * sin((i * 0.25 - 0.5 + 0.095) * π)],
          [cx + this.ar1 * cos((i * 0.25 - 0.5 + 0.05) * π), cy + this.ar1 * sin((i * 0.25 - 0.5 + 0.05) * π)],
        ],
      });
    }

    //B
    for (let i = 0; i < 8; i++) {
      this.areas.push({
        type: 'B',
        id: i + 1,
        name: 'B' + (i + 1).toString(),
        points: [
          [cx + this.br1 * cos((i * 0.25 - 0.5 + 0.064) * π), cy + this.br1 * sin((i * 0.25 - 0.5 + 0.064) * π)],
          [cx + this.br1 * cos((i * 0.25 - 0.5 + 0.186) * π), cy + this.br1 * sin((i * 0.25 - 0.5 + 0.186) * π)],
          [cx + this.br2 * cos((i * 0.25 - 0.5 + 0.24) * π), cy + this.br2 * sin((i * 0.25 - 0.5 + 0.24) * π)],
          [cx + this.br3 * cos((i * 0.25 - 0.5 + 0.24) * π), cy + this.br3 * sin((i * 0.25 - 0.5 + 0.24) * π)],
          [cx + this.br4 * cos((i * 0.25 - 0.5 + 0.125) * π), cy + this.br4 * sin((i * 0.25 - 0.5 + 0.125) * π)],
          [cx + this.br3 * cos((i * 0.25 - 0.5 + 0.01) * π), cy + this.br3 * sin((i * 0.25 - 0.5 + 0.01) * π)],
          [cx + this.br2 * cos((i * 0.25 - 0.5 + 0.01) * π), cy + this.br2 * sin((i * 0.25 - 0.5 + 0.01) * π)],
        ],
      });
    }

    //C
    this.areas.push({
      type: 'C',
      id: 0,
      name: 'C',
      points: [],
    });

    //D
    for (let i = 0; i < 8; i++) {
      this.areas.push({
        type: 'D',
        id: i + 1,
        name: 'D' + (i + 1).toString(),
        points: [
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5 - 0.05) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5 - 0.05) * π)],
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5) * π)],
          [cx + this.values.maimaiScreenR * cos((i * 0.25 - 0.5 + 0.05) * π), cy + this.values.maimaiScreenR * sin((i * 0.25 - 0.5 + 0.05) * π)],
          [cx + this.er1 * cos((i * 0.25 - 0.5 + 0.05) * π), cy + this.er1 * sin((i * 0.25 - 0.5 + 0.05) * π)],
          [cx + this.er1 * cos((i * 0.25 - 0.5) * π), cy + this.er1 * sin((i * 0.25 - 0.5) * π)],
          [cx + this.er1 * cos((i * 0.25 - 0.5 - 0.05) * π), cy + this.er1 * sin((i * 0.25 - 0.5 - 0.05) * π)],
        ],
      });
    }

    //E
    for (let i = 0; i < 8; i++) {
      this.areas.push({
        type: 'E',
        id: i + 1,
        name: 'E' + (i + 1).toString(),
        points: [
          [cx + this.er1 * cos((i * 0.25 - 0.5) * π), cy + this.er1 * sin((i * 0.25 - 0.5) * π)],
          [cx + this.er2 * cos((i * 0.25 - 0.5 + 0.073) * π), cy + this.er2 * sin((i * 0.25 - 0.5 + 0.073) * π)],
          [cx + this.er3 * cos((i * 0.25 - 0.5) * π), cy + this.er3 * sin((i * 0.25 - 0.5) * π)],
          [cx + this.er2 * cos((i * 0.25 - 0.5 - 0.073) * π), cy + this.er2 * sin((i * 0.25 - 0.5 - 0.073) * π)],
        ],
      });
    }

    //K
    for (let i = 0; i < 8; i++) {
      this.keys.push({
        type: 'K',
        id: i + 1,
        name: 'K' + (i + 1).toString(),
        points: [],
        leftAngle: (i * 0.25 - 0.5 + 0.125 - this.values.keyWidth) * π,
        rightAngle: (i * 0.25 - 0.5 + 0.125 + this.values.keyWidth) * π,
      });
    }
  };
}

/**
 * 指定pos的具体坐标
 * @param pos
 */
export const getPosCenterCoord = (pos: string, values: MaimaiValues): [number, number] => {
  const firstChar = pos.substring(0, 1);
  if (isANumber(firstChar)) {
    return values.APositions.J[Number(firstChar) - 1];
  }

  const touchPos = pos.substring(1, 2);
  switch (firstChar) {
    case 'C':
      return values.center;
    case 'A':
      return values.APositions.A[Number(touchPos) - 1];
    case 'B':
      return values.APositions.B[Number(touchPos) - 1];
    case 'D':
      return values.APositions.D[Number(touchPos) - 1];
    case 'E':
      return values.APositions.E[Number(touchPos) - 1];
    case '#':
    case '@':
      return SpecPos.readPosFromStr(pos).getCoord(values) as [number, number];
    default:
      break;
  }

  return [0, 0];
};

/** 如果设置了谱面镜像，翻转pos */
export const flipPos = (pos: string | undefined, flipMode: FlipMode): string => {
  if (pos === undefined) return '';
  if (pos === '') return '';
  if (flipMode === FlipMode.None) return pos;

  const flipPosNum = (pos: string): string => {
    switch (flipMode) {
      case FlipMode.Horizonal:
        return (9 - Number(pos)).toString();
      case FlipMode.Vertical:
        if (Number(pos) < 5) {
          return (5 - Number(pos)).toString();
        } else {
          return (13 - Number(pos)).toString();
        }
      case FlipMode.Both:
        if (Number(pos) < 5) {
          return (4 + Number(pos)).toString();
        } else {
          return (Number(pos) - 4).toString();
        }
      default:
        return pos;
    }
  };
  const flipPosNumED = (pos: string): string => {
    switch (flipMode) {
      case FlipMode.Horizonal:
        if (Number(pos) === 1) {
          return '1';
        } else {
          return (10 - Number(pos)).toString();
        }
      case FlipMode.Vertical:
        if (Number(pos) < 6) {
          return (6 - Number(pos)).toString();
        } else {
          return (14 - Number(pos)).toString();
        }
      case FlipMode.Both:
        if (Number(pos) < 5) {
          return (4 + Number(pos)).toString();
        } else {
          return (Number(pos) - 4).toString();
        }
      default:
        return pos;
    }
  };
  const flipCartSpecPosNum = (x: number, y: number): { x: number; y: number } => {
    switch (flipMode) {
      case FlipMode.Horizonal:
        return { x: -x, y };
      case FlipMode.Vertical:
        return { x, y: -y };
      case FlipMode.Both:
        return { x: -x, y: -y };
      default:
        return { x, y };
    }
  };
  const flipPolarSpecPosNum = (sita: number): number => {
    switch (flipMode) {
      case FlipMode.Horizonal:
        return 360 - sita;
      case FlipMode.Vertical:
        return 180 - sita < 0 ? 540 - sita : 180 - sita;
      case FlipMode.Both:
        return -(180 - sita < 0 ? 540 - sita : -(180 - sita));
      default:
        return sita;
    }
  };

  const firstChar = pos.substring(0, 1);
  if (isNaN(Number(firstChar))) {
    // A B C ..
    if (firstChar === 'C') {
      return 'C';
    } else if (firstChar === 'E' || firstChar === 'D') {
      return firstChar + flipPosNumED(pos.substring(1, 2));
    } else if (firstChar === '#' || firstChar === '@') {
      // 观赏谱
      const specres = SpecPos.readPosFromStr(pos);
      switch (specres.type) {
        case SpecPosType.Cartesian:
          const res = flipCartSpecPosNum(specres.x_sita, specres.y_r);
          specres.x_sita = res.x;
          specres.y_r = res.y;
          break;
        case SpecPosType.Polar:
          specres.x_sita = flipPolarSpecPosNum(specres.x_sita);
          break;
      }
      return specres.toString();
    } else {
      return firstChar + flipPosNum(pos.substring(1, 2));
    }
  } else {
    // 1 2 3 ..
    return flipPosNum(pos);
  }
};
