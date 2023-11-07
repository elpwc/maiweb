import MaimaiValues from '../maimaiValues';
import { abs, acos, asin, atan, cos, isANumber, sin, sqrt, π } from '../utils/math';
import { lineLen, lineLenByPoint } from '../drawUtils/_base';
import { FlipMode } from '../utils/types/flipMode';
import { getPosCenterCoord } from '../areas';

/** 一条SLIDE轨迹的长度 */
export const trackLength = (type: string, values: MaimaiValues, startPos_: string | undefined, endPosOri: string | undefined, turnPosOri?: number): number => {
  if (isANumber(startPos_) && isANumber(endPosOri)) {
    const startPos = Number(startPos_);
    let endPos = Number(endPosOri) - startPos + 1;
    if (endPos < 1) endPos += 8;
    let turnPos = (turnPosOri ?? 0) - startPos + 1;
    if (turnPos < 1) turnPos += 8;

    switch (type) {
      case '-':
        return lineLenByPoint(values.APositions.J[0], values.APositions.J[endPos - 1]);
      case '^':
        if (endPos > 1 && endPos < 5) {
          return π * values.maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
        } else if (endPos > 5 && endPos <= 8) {
          return π * values.maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
        }
        break;
      case '<':
        if (startPos <= 2 || startPos >= 7) {
          if (endPos > 1 && endPos <= 8) {
            return π * values.maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
          } else if (endPos === 1) {
            return π * values.maimaiJudgeLineR * 2;
          }
        } else if (startPos >= 3 && startPos <= 6) {
          if (endPos > 1 && endPos <= 8) {
            return π * values.maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
          } else if (endPos === 1) {
            return π * values.maimaiJudgeLineR * 2;
          }
        }

        break;
      case '>':
        if (startPos <= 2 || startPos >= 7) {
          if (endPos > 1 && endPos <= 8) {
            return π * values.maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
          } else if (endPos === 1) {
            return π * values.maimaiJudgeLineR * 2;
          }
        } else if (startPos >= 3 && startPos <= 6) {
          if (endPos > 1 && endPos <= 8) {
            return π * values.maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
          } else if (endPos === 1) {
            return π * values.maimaiJudgeLineR * 2;
          }
        }
        break;
      case 'v':
        return values.maimaiJudgeLineR * 2;
      case 'p':
        return 0.25 * (endPos >= 6 ? 14 - endPos : 6 - endPos) * values.qpCenterCircleR * π + values.qplen * 2;
      case 'q':
        return 0.25 * (endPos <= 4 ? endPos + 4 : endPos - 4) * values.qpCenterCircleR * π + values.qplen * 2;
      case 'pp':
        const ppangle = endPos === 4 ? 1 - ppPoints[endPos] + 1 + ppPoints[0] + 2 : 1 - ppPoints[endPos] + 1 + ppPoints[0];
        return (
          ppangle * values.qpLeftRighCircleR * π +
          lineLen(
            values.APositions.J[0][0],
            values.APositions.J[0][1],
            values.qpRightCircleCenter[0] + values.qpLeftRighCircleR * cos(ppPoints[0] * π),
            values.qpRightCircleCenter[1] + values.qpLeftRighCircleR * sin(ppPoints[0] * π)
          ) +
          lineLen(
            values.APositions.J[endPos - 1][0],
            values.APositions.J[endPos - 1][1],
            values.qpRightCircleCenter[0] + values.qpLeftRighCircleR * cos((ppPoints[0] - ppangle) * π),
            values.qpRightCircleCenter[1] + values.qpLeftRighCircleR * sin((ppPoints[0] - ppangle) * π)
          )
        );

      case 'qq':
        const qqangle = endPos === 7 ? qqPoints[endPos] - qqPoints[0] : 1 + qqPoints[endPos] + 1 - qqPoints[0];
        return (
          qqangle * values.qpLeftRighCircleR * π +
          lineLen(
            values.APositions.J[0][0],
            values.APositions.J[0][1],
            values.qpLeftCircleCenter[0] + values.qpLeftRighCircleR * cos(qqPoints[0] * π),
            values.qpLeftCircleCenter[1] + values.qpLeftRighCircleR * sin(qqPoints[0] * π)
          ) +
          lineLen(
            values.APositions.J[endPos - 1][0],
            values.APositions.J[endPos - 1][1],
            values.qpLeftCircleCenter[0] + values.qpLeftRighCircleR * cos((qqPoints[0] + qqangle) * π),
            values.qpLeftCircleCenter[1] + values.qpLeftRighCircleR * sin((qqPoints[0] + qqangle) * π)
          )
        );
      case 's':
        return values.maimaiJudgeLineR * 2.9932;
      case 'z':
        return values.maimaiJudgeLineR * 2.9932;
      case 'V':
        return lineLenByPoint(values.APositions.J[turnPos - 1], values.APositions.J[0]) + lineLenByPoint(values.APositions.J[turnPos - 1], values.APositions.J[endPos - 1]);
      case 'w':
        return lineLenByPoint(values.APositions.J[0], values.APositions.J[4]);
      default:
        break;
    }
  } else {
    const startPosCoord = getPosCenterCoord(startPos_ ?? '1', values);
    const endPosCoord = getPosCenterCoord(endPosOri ?? '1', values);
    switch (type) {
      case '-':
        return lineLenByPoint(startPosCoord, endPosCoord);
      case '<':
      case '>':
      default:
        break;
    }
  }

  return 0;
};

export const ppPoints = [
  -0.8516444944031569, -0.197563051907167, -0.007987334992532735, 0.4272852860246635, 0.8516444944031569, -0.891273030630514, -0.6949442499922761, -0.5225085064199887, -0.35985847476497856,
];

export const qqPoints = [
  0.10164449440315693, -0.552436948092833, -0.39014152523502166, -0.22749149358001142, -0.055055750007723836, 0.141273030630514, 0.3983555055968429, 0.8227147139753366, -0.7420126650074674,
];

export interface Segment {
  /** start */
  s: number;
  /** end */
  e: number;
  /** areas */
  a: string[];
}

/** 返回坐标绕中点旋转r度的结果 */
export const rotateCoordination = (x: number, y: number, cx: number, cy: number, rad: number): [number, number] => {
  return [(x - cx) * cos(rad) - (y - cy) * sin(rad) + cx, (x - cx) * sin(rad) + (y - cy) * cos(rad) + cy];
};

/** 返回坐标绕中点旋转r度的结果 */
export const rotateCoordination2 = (p: [number, number], c: [number, number], rad: number): [number, number] => {
  return rotateCoordination(p[0], p[1], c[0], c[1], rad);
};

/** 如果设置了谱面镜像，翻转TRACK类型 */
export const flipTrack = (type: string, flipMode: FlipMode) => {
  if (type === undefined) return '';
  if (type === '') return '';
  if (flipMode === FlipMode.None || (flipMode === FlipMode.Both && type !== '<' && type !== '>')) return type;
  if (!['pp', 'qq', 'p', 'q', '<', '>', 's', 'z'].includes(type)) return type;

  const pairs = [
    ['pp', 'qq'],
    ['p', 'q'],
    ['s', 'z'],
    ['qq', 'pp'],
    ['q', 'p'],
    ['z', 's'],
  ];

  const pairsHori = [
    ['<', '>'],
    ['>', '<'],
  ];

  let res: string[] | undefined = undefined;

  if (flipMode === FlipMode.Horizonal || flipMode === FlipMode.Vertical) {
    res = pairs.find(pair => {
      return pair[0] === type;
    });
  }

  if ((flipMode === FlipMode.Horizonal && res === undefined) || flipMode === FlipMode.Both) {
    res = pairsHori.find(pair => {
      return pair[0] === type;
    });
  }

  if (res) {
    return res[1];
  } else {
    return type;
  }
};

/**
 * 三点确定夹角度数
 * @param o
 * @param p1
 * @param p2
 * @returns 返回 180° 360° 这样的
 */
export const getAngle = (o: [number, number], p1: [number, number], p2: [number, number]): number => {
  return (asin(((p1[0] - o[0]) * (p2[0] - o[0]) + (p1[1] - o[1]) * (p2[1] - o[1])) / (lineLenByPoint(o, p1) * lineLenByPoint(o, p2))) / π) * 180;
};

/*


  // 只是开发中计算数值用的，沒有实装（也不需要
  ppqqAnglCalc = () => {
    let res: number[] = [];
    // pp
    this.APositions.forEach((ap, i) => {
      const r = this.qpLeftRighCircleR;
      const l = lineLen(ap[0], ap[1], this.qpRightCircleCenter[0], this.qpRightCircleCenter[1]);
      const sita = atan(abs((this.qpRightCircleCenter[0] - ap[0]) / (this.qpRightCircleCenter[1] - ap[1])));
      const alpha = asin(r / l);

      const beta = asin(abs((this.qpRightCircleCenter[0] - ap[0]) / l)) / π;
      const gamma = acos(r / l) / π;

      switch (i + 1) {
        case 1:
          res.push(-0.5 - beta - gamma);
          res.push(-0.5 - beta + gamma);
          break;
        case 2:
          res.push(-0.5 + beta + gamma);
          break;
        case 3:
          res.push(0.5 - beta + gamma);
          break;
        case 4:
          res.push(0.5 + beta + gamma);
          break;
        case 5:
          res.push(-1.5 + beta + gamma);
          break;
        case 6:
          res.push(-1.5 + beta + gamma);
          break;
        case 7:
          res.push(-0.5 - beta + gamma);
          break;
        case 8:
          res.push(-0.5 - beta + gamma);
          break;
      }

      /**
      -0.8516444944031569 入点
      -0.197563051907167 1
      -0.007987334992532735 2
      0.4272852860246635 3
      0.8516444944031569 ...
      -0.891273030630514
      -0.6949442499922761
      -0.5225085064199887
      -0.35985847476497856
     *
      const result_after_two_hours = [
        -0.8516444944031569, -0.197563051907167, -0.007987334992532735, 0.4272852860246635, 0.8516444944031569, -0.891273030630514, -0.6949442499922761, -0.5225085064199887, -0.35985847476497856,
      ];
    });
    console.log(res);

    res = [];
    // qq
    this.APositions.forEach((ap, i) => {
      const r = this.qpLeftRighCircleR;
      const l = lineLen(ap[0], ap[1], this.qpLeftCircleCenter[0], this.qpLeftCircleCenter[1]);
      const sita = atan(abs((this.qpLeftCircleCenter[0] - ap[0]) / (this.qpLeftCircleCenter[1] - ap[1])));
      const alpha = asin(r / l);

      const beta = asin(abs((this.qpLeftCircleCenter[0] - ap[0]) / l)) / π;
      const gamma = acos(r / l) / π;

      switch (i + 1) {
        case 1:
          res.push(-0.5 + beta + gamma);
          res.push(-0.5 + beta - gamma);
          break;
        case 2:
          res.push(-0.5 + beta - gamma);
          break;
        case 3:
          res.push(0.5 - beta - gamma);
          break;
        case 4:
          res.push(0.5 - beta - gamma);
          break;
        case 5:
          res.push(0.5 + beta - gamma);
          break;
        case 6:
          res.push(0.5 + beta - gamma);
          break;
        case 7:
          res.push(-0.5 - beta - gamma);
          break;
        case 8:
          res.push(-0.5 - beta - gamma);
          break;
      }

      const result_after_1_hour = [
        0.10164449440315693, -0.552436948092833, -0.39014152523502166, -0.22749149358001142, -0.055055750007723836, 0.141273030630514, 0.3983555055968429, -1.1772852860246634, -0.7420126650074674,
      ];
    });
    console.log(res);
  };

  pqTrackJudgeCalc = () => {
    const len = lineLen(this.APositions.J[0][0], this.APositions.J[0][1], this.APositions.J[3][0], this.APositions.J[3][1]);
    const c = this.qpCenterCircleR * 2 * π;
    const len1 = len / 2;
    let sum = len + c;

    sum = (c / 8) * 5 + len;
    const res1 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.125 * 2 * c) / sum,
      (len1 + 0.125 * 3 * c) / sum,
      (len1 + (c / 8) * 5 + (len1 / 9) * 1.5) / sum,
      (len1 + (c / 8) * 5 + (len1 / 9) * 5.5) / sum,
      1,
    ];

    sum = (c / 8) * 4 + len;
    const res2 = [
      0,
      ((3.5 / 9) * len1) / sum,
      ((8 / 9) * len1) / sum,
      (len1 + 0.125 * 1 * c) / sum,
      (len1 + 0.125 * 2 * c) / sum,
      (len1 + 0.125 * 3 * c) / sum,
      (len1 + 0.125 * 4 * c) / sum,
      (len1 + (c / 8) * 4 + (len1 / 9) * 3.5) / sum,
      1,
    ];

    sum = (c / 8) * 3 + len;
    const res3 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.125 * 1 * c) / sum,
      (len1 + 0.125 * 2 * c) / sum,
      (len1 + 0.125 * 3 * c) / sum,
      (len1 + (c / 8) * 3 + (len1 / 9) * 3) / sum,
      (len1 + (c / 8) * 3 + (len1 / 9) * 5.5) / sum,
      1,
    ];

    sum = (c / 8) * 2 + len;
    const res4 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.125 * 1 * c) / sum,
      (len1 + (c / 8) * 2) / sum,
      (len1 + (c / 8) * 2 + (len1 / 9) * 3) / sum,
      (len1 + (c / 8) * 2 + (len1 / 9) * 5.5) / sum,
      1,
    ];

    sum = (c / 8) * 1 + len;
    const res5 = [0, ((3.5 / 9) * len1) / sum, len1 / sum, (len1 + (c / 8) * 1) / sum, (len1 + (c / 8) * 1 + (len1 / 9) * 3) / sum, (len1 + (c / 8) * 1 + (len1 / 9) * 5.5) / sum, 1];

    sum = (c / 8) * 8 + len;
    const res6 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.13542 * 1 * c) / sum,
      (len1 + 0.13542 * 2 * c) / sum,
      (len1 + 0.13542 * 3 * c) / sum,
      (len1 + 0.13542 * 4 * c) / sum,
      (len1 + 0.13542 * 5 * c) / sum,
      (len1 + 0.13542 * 6 * c) / sum,
      (len1 + c) / sum,
      (len1 + c + (len1 / 9) * 3) / sum,
      (len1 + c + (len1 / 9) * 5.7) / sum,
      1,
    ];

    sum = (c / 8) * 7 + len;
    const res7 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.13542 * 1 * c) / sum,
      (len1 + 0.13542 * 2 * c) / sum,
      (len1 + 0.13542 * 3 * c) / sum,
      (len1 + 0.13542 * 4 * c) / sum,
      (len1 + 0.13542 * 5 * c) / sum,
      (len1 + 0.13542 * 6 * c) / sum,
      (len1 + (c / 8) * 7 + (len1 / 9) * 3) / sum,
      (len1 + (c / 8) * 7 + (len1 / 9) * 5.7) / sum,
      1,
    ];

    sum = (c / 8) * 6 + len;
    const res8 = [
      0,
      ((3.5 / 9) * len1) / sum,
      len1 / sum,
      (len1 + 0.125 * 1 * c) / sum,
      (len1 + 0.125 * 2 * c) / sum,
      (len1 + 0.125 * 3 * c) / sum,
      (len1 + 0.125 * 4 * c) / sum,
      (len1 + 0.125 * 5 * c) / sum,
      (len1 + 0.125 * 6 * c) / sum,
      (len1 + (c / 8) * 6 + (len1 / 9) * 3.5) / sum,
      1,
    ];
    console.log(res1, res2, res3, res4, res5, res6, res7, res8);
  };


 */
