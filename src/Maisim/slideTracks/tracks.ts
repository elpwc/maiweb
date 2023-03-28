import { cos, sin, π } from '../utils/math';
import { lineLen } from '../drawUtils/_base';
import MaimaiValues from '../maimaiValues';
import { ppPoints, qqPoints } from './_global';

/**
 * 获得当前时刻的track信息
 * @param type track类型
 * @param startPos 开始点
 * @param endPosOri 结束点（原始的）
 * @param ct 当前经过时间
 * @param rt 总时间
 * @returns 这一时刻的位置，方向
 */
export const getTrackProps = (
  values: MaimaiValues,
  type: string,
  startPos: number,
  endPosOri: number,
  ct: number,
  rt: number,
  turnPosOri?: number
): { x: number; y: number; direction: number } | /* wifi */ { x: number; y: number; direction: number }[] => {
  let endPos = endPosOri - startPos + 1;
  let turnPos = (turnPosOri ?? 0) - startPos + 1;
  if (endPos < 1) endPos += 8;
  if (turnPos < 1) turnPos += 8;
  switch (type) {
    case '-':
      return straight(values, endPos, ct, rt);
    case '^':
      return curve(values, endPos, ct, rt);
    case '<':
      return leftCurve(values, startPos, endPos, ct, rt);
    case '>':
      return rightCurve(values, startPos, endPos, ct, rt);
    case 'v':
      return v(values, endPos, ct, rt);
    case 's':
      return s(values, ct, rt);
    case 'z':
      return z(values, ct, rt);
    case 'p':
      return p(values, endPos, ct, rt);
    case 'q':
      return q(values, endPos, ct, rt);
    case 'pp':
      return pp(values, endPos, ct, rt);
    case 'qq':
      return qq(values, endPos, ct, rt);
    case 'V':
      return turn(values, turnPos, endPos, ct, rt);
    case 'w':
      return w(values, ct, rt);
    default:
      return { x: 0, y: 0, direction: 0 };
  }
};

// -
const straight = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  return {
    x: values.APositions[0][0] + (values.APositions[endPos - 1][0] - values.APositions[0][0]) * (ct / rt),
    y: values.APositions[0][1] + (values.APositions[endPos - 1][1] - values.APositions[0][1]) * (ct / rt),
    direction: 22.5 * (endPos - 1) + 202.5,
  };
};

// ^
const curve = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (endPos > 1 && endPos < 5) {
    return {
      x: values.center[0] + values.maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
      y: values.center[1] + values.maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
      direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
    };
  } else if (endPos > 5 && endPos <= 8) {
    return {
      x: values.center[0] + values.maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      y: values.center[1] + values.maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// <
const leftCurve = (values: MaimaiValues, startPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (startPos <= 2 || startPos >= 7) {
    if (endPos > 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
      };
    } else if (endPos === 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((-2 * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((-2 * (ct / rt) - 0.375) * π),
        direction: -360 * (ct / rt) + 22.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else if (startPos >= 3 && startPos <= 6) {
    if (endPos > 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
      };
    } else if (endPos === 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos(((2 * ct) / rt - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin(((2 * ct) / rt - 0.375) * π),
        direction: 360 * (ct / rt) + 202.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// >
const rightCurve = (values: MaimaiValues, startPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (startPos <= 2 || startPos >= 7) {
    if (endPos > 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
      };
    } else if (endPos === 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos(((2 * ct) / rt - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin(((2 * ct) / rt - 0.375) * π),
        direction: 360 * (ct / rt) + 202.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else if (startPos >= 3 && startPos <= 6) {
    if (endPos > 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
      };
    } else if (endPos === 1) {
      return {
        x: values.center[0] + values.maimaiJudgeLineR * cos((-2 * (ct / rt) - 0.375) * π),
        y: values.center[1] + values.maimaiJudgeLineR * sin((-2 * (ct / rt) - 0.375) * π),
        direction: -360 * (ct / rt) + 22.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// v
const v = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt / 2) {
    return {
      x: values.APositions[0][0] + (values.center[0] - values.APositions[0][0]) * (ct / (rt / 2)),
      y: values.APositions[0][1] + (values.center[1] - values.APositions[0][1]) * (ct / (rt / 2)),
      direction: -67.5,
    };
  } else {
    return {
      x: values.center[0] + (values.APositions[endPos - 1][0] - values.center[0]) * ((ct - rt / 2) / (rt / 2)),
      y: values.center[1] + (values.APositions[endPos - 1][1] - values.center[1]) * ((ct - rt / 2) / (rt / 2)),
      direction: 45 * endPos + 67.5,
    };
  }
};

const sz_r1 = 0.361615673,
  sz_r2 = 0.276786931;
// s
const s = (values: MaimaiValues, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt * sz_r1) {
    return {
      x: values.APositions[0][0] + (values.szLeftPoint[0] - values.APositions[0][0]) * (ct / (rt * sz_r1)),
      y: values.APositions[0][1] + (values.szLeftPoint[1] - values.APositions[0][1]) * (ct / (rt * sz_r1)),
      direction: -45,
    };
  } else if (ct >= rt * sz_r1 && ct < rt * (sz_r1 + sz_r2)) {
    return {
      x: values.szLeftPoint[0] + (values.szRightPoint[0] - values.szLeftPoint[0]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      y: values.szLeftPoint[1] + (values.szRightPoint[1] - values.szLeftPoint[1]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      direction: 202.5,
    };
  } else {
    return {
      x: values.szRightPoint[0] + (values.APositions[4][0] - values.szRightPoint[0]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      y: values.szRightPoint[1] + (values.APositions[4][1] - values.szRightPoint[1]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      direction: -45,
    };
  }
};

// z
const z = (values: MaimaiValues, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt * sz_r1) {
    return {
      x: values.APositions[0][0] + (values.szRightPoint[0] - values.APositions[0][0]) * (ct / (rt * sz_r1)),
      y: values.APositions[0][1] + (values.szRightPoint[1] - values.APositions[0][1]) * (ct / (rt * sz_r1)),
      direction: -90,
    };
  } else if (ct >= rt * sz_r1 && ct < rt * (sz_r1 + sz_r2)) {
    return {
      x: values.szRightPoint[0] + (values.szLeftPoint[0] - values.szRightPoint[0]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      y: values.szRightPoint[1] + (values.szLeftPoint[1] - values.szRightPoint[1]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      direction: 22.5,
    };
  } else {
    return {
      x: values.szLeftPoint[0] + (values.APositions[4][0] - values.szLeftPoint[0]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      y: values.szLeftPoint[1] + (values.APositions[4][1] - values.szLeftPoint[1]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      direction: -90,
    };
  }
};

// p
const p = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = -0.75;
  /** 圆弧的角度 */
  const angle = 0.25 * (endPos >= 6 ? 14 - endPos : 6 - endPos);
  /** 圆弧开始的点 */
  const p1 = [values.center[0] + values.qpCenterCircleR * cos(startAngle * π), values.center[1] + values.qpCenterCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [values.center[0] + values.qpCenterCircleR * cos((startAngle - angle) * π), values.center[1] + values.qpCenterCircleR * sin((startAngle - angle) * π)];
  /** 圆弧长度 */
  const curveLen = angle * values.qpCenterCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + values.qplen * 2;

  const b = ct / rt;

  if (b <= values.qplen / sumLen) {
    return {
      x: values.APositions[0][0] + (p1[0] - values.APositions[0][0]) * (b / (values.qplen / sumLen)),
      y: values.APositions[0][1] + (p1[1] - values.APositions[0][1]) * (b / (values.qplen / sumLen)),
      direction: -45,
    };
  } else if (b > values.qplen / sumLen && b < (values.qplen + curveLen) / sumLen) {
    return {
      x: values.center[0] + values.qpCenterCircleR * cos((startAngle - ((sumLen * b - values.qplen) / curveLen) * angle) * π),
      y: values.center[1] + values.qpCenterCircleR * sin((startAngle - ((sumLen * b - values.qplen) / curveLen) * angle) * π),
      direction: (startAngle - ((sumLen * b - values.qplen) / curveLen) * angle + 0.5) * 180,
    };
  } else if (b >= (values.qplen + curveLen) / sumLen) {
    return {
      x: p2[0] + (values.APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - values.qplen) / values.qplen),
      y: p2[1] + (values.APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - values.qplen) / values.qplen),
      direction: 45 * (endPos >= 6 ? endPos - 7 : endPos + 1),
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// q
const q = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = 0;
  /** 圆弧的角度 */
  const angle = 0.25 * (endPos <= 4 ? endPos + 4 : endPos - 4);
  /** 圆弧开始的点 */
  const p1 = [values.center[0] + values.qpCenterCircleR * cos(startAngle * π), values.center[1] + values.qpCenterCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [values.center[0] + values.qpCenterCircleR * cos((startAngle + angle) * π), values.center[1] + values.qpCenterCircleR * sin((startAngle + angle) * π)];
  /** 圆弧长度 */
  const curveLen = angle * values.qpCenterCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + values.qplen * 2;

  const b = ct / rt;

  if (b <= values.qplen / sumLen) {
    return {
      x: values.APositions[0][0] + (p1[0] - values.APositions[0][0]) * (b / (values.qplen / sumLen)),
      y: values.APositions[0][1] + (p1[1] - values.APositions[0][1]) * (b / (values.qplen / sumLen)),
      direction: -90,
    };
  } else if (b > values.qplen / sumLen && b < (values.qplen + curveLen) / sumLen) {
    return {
      x: values.center[0] + values.qpCenterCircleR * cos((startAngle + ((sumLen * b - values.qplen) / curveLen) * angle) * π),
      y: values.center[1] + values.qpCenterCircleR * sin((startAngle + ((sumLen * b - values.qplen) / curveLen) * angle) * π),
      direction: (startAngle + ((sumLen * b - values.qplen) / curveLen) * angle - 0.5) * 180,
    };
  } else if (b >= (values.qplen + curveLen) / sumLen) {
    return {
      x: p2[0] + (values.APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - values.qplen) / values.qplen),
      y: p2[1] + (values.APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - values.qplen) / values.qplen),
      direction: 45 * (endPos <= 4 ? endPos - 6 : endPos - 6),
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// pp
const pp = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = ppPoints[0];
  /** 圆弧的角度 */
  const angle = endPos === 4 ? 1 - ppPoints[endPos] + 1 + startAngle + 2 : 1 - ppPoints[endPos] + 1 + startAngle;
  /** 圆弧开始的点 */
  const p1 = [values.qpRightCircleCenter[0] + values.qpLeftRighCircleR * cos(startAngle * π), values.qpRightCircleCenter[1] + values.qpLeftRighCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [values.qpRightCircleCenter[0] + values.qpLeftRighCircleR * cos((startAngle - angle) * π), values.qpRightCircleCenter[1] + values.qpLeftRighCircleR * sin((startAngle - angle) * π)];

  const l1 = lineLen(values.APositions[0][0], values.APositions[0][1], p1[0], p1[1]);
  const l2 = lineLen(values.APositions[endPos - 1][0], values.APositions[endPos - 1][1], p2[0], p2[1]);

  /** 圆弧长度 */
  const curveLen = angle * values.qpLeftRighCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + l1 + l2;

  const b = ct / rt;

  if (b <= l1 / sumLen) {
    return {
      x: values.APositions[0][0] + (p1[0] - values.APositions[0][0]) * (b / (l1 / sumLen)),
      y: values.APositions[0][1] + (p1[1] - values.APositions[0][1]) * (b / (l1 / sumLen)),
      direction: 90 + startAngle * 180,
    };
  } else if (b > l1 / sumLen && b < (l1 + curveLen) / sumLen) {
    return {
      x: values.qpRightCircleCenter[0] + values.qpLeftRighCircleR * cos((startAngle - ((sumLen * b - l1) / curveLen) * angle) * π),
      y: values.qpRightCircleCenter[1] + values.qpLeftRighCircleR * sin((startAngle - ((sumLen * b - l1) / curveLen) * angle) * π),
      direction: (startAngle - ((sumLen * b - l1) / curveLen) * angle + 0.5) * 180,
    };
  } else if (b >= (l1 + curveLen) / sumLen) {
    return {
      x: p2[0] + (values.APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - l1) / l2),
      y: p2[1] + (values.APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - l1) / l2),
      direction: 90 + ppPoints[endPos] * 180,
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// qq
const qq = (values: MaimaiValues, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = qqPoints[0];
  /** 圆弧的角度 */
  const angle = endPos === 7 ? qqPoints[endPos] - startAngle : 1 + qqPoints[endPos] + 1 - startAngle;
  /** 圆弧开始的点 */
  const p1 = [values.qpLeftCircleCenter[0] + values.qpLeftRighCircleR * cos(startAngle * π), values.qpLeftCircleCenter[1] + values.qpLeftRighCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [values.qpLeftCircleCenter[0] + values.qpLeftRighCircleR * cos((startAngle + angle) * π), values.qpLeftCircleCenter[1] + values.qpLeftRighCircleR * sin((startAngle + angle) * π)];

  const l1 = lineLen(values.APositions[0][0], values.APositions[0][1], p1[0], p1[1]);
  const l2 = lineLen(values.APositions[endPos - 1][0], values.APositions[endPos - 1][1], p2[0], p2[1]);

  /** 圆弧长度 */
  const curveLen = angle * values.qpLeftRighCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + l1 + l2;

  const b = ct / rt;

  if (b <= l1 / sumLen) {
    return {
      x: values.APositions[0][0] + (p1[0] - values.APositions[0][0]) * (b / (l1 / sumLen)),
      y: values.APositions[0][1] + (p1[1] - values.APositions[0][1]) * (b / (l1 / sumLen)),
      direction: startAngle * 180 - 90,
    };
  } else if (b > l1 / sumLen && b < (l1 + curveLen) / sumLen) {
    return {
      x: values.qpLeftCircleCenter[0] + values.qpLeftRighCircleR * cos((startAngle + ((sumLen * b - l1) / curveLen) * angle) * π),
      y: values.qpLeftCircleCenter[1] + values.qpLeftRighCircleR * sin((startAngle + ((sumLen * b - l1) / curveLen) * angle) * π),
      direction: (startAngle + ((sumLen * b - l1) / curveLen) * angle + 0.5) * 180 + 180,
    };
  } else if (b >= (l1 + curveLen) / sumLen) {
    return {
      x: p2[0] + (values.APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - l1) / l2),
      y: p2[1] + (values.APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - l1) / l2),
      direction: qqPoints[endPos] * 180 - 90,
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// V
const turn = (values: MaimaiValues, turnPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  const l1 = lineLen(values.APositions[turnPos - 1][0], values.APositions[turnPos - 1][1], values.APositions[0][0], values.APositions[0][1]);
  const l2 = lineLen(values.APositions[turnPos - 1][0], values.APositions[turnPos - 1][1], values.APositions[endPos - 1][0], values.APositions[endPos - 1][1]);
  const sumLen = l1 + l2;

  const b = ct / rt;

  if (b < l1 / sumLen) {
    return {
      x: values.APositions[0][0] + ((values.APositions[turnPos - 1][0] - values.APositions[0][0]) * (ct / rt)) / (l1 / sumLen),
      y: values.APositions[0][1] + ((values.APositions[turnPos - 1][1] - values.APositions[0][1]) * (ct / rt)) / (l1 / sumLen),
      direction: 22.5 * (turnPos - 1) + 202.5,
    };
  } else {
    return {
      x: values.APositions[turnPos - 1][0] + ((values.APositions[endPos - 1][0] - values.APositions[turnPos - 1][0]) * (ct / rt - l1 / sumLen)) / (l2 / sumLen),
      y: values.APositions[turnPos - 1][1] + ((values.APositions[endPos - 1][1] - values.APositions[turnPos - 1][1]) * (ct / rt - l1 / sumLen)) / (l2 / sumLen),
      direction: 22.5 * (endPos - turnPos - 1) + turnPos * 45 + (endPos > 4 && turnPos < 5 ? 180 : 0),
    };
  }
};

// w
const w = (values: MaimaiValues, ct: number, rt: number): { x: number; y: number; direction: number }[] => {
  return [
    {
      x: values.APositions[0][0] + (values.APositions[5][0] - values.APositions[0][0]) * (ct / rt),
      y: values.APositions[0][1] + (values.APositions[5][1] - values.APositions[0][1]) * (ct / rt),
      direction: 22.5 * 5 + 202.5,
    },
    {
      x: values.APositions[0][0] + (values.APositions[4][0] - values.APositions[0][0]) * (ct / rt),
      y: values.APositions[0][1] + (values.APositions[4][1] - values.APositions[0][1]) * (ct / rt),
      direction: 22.5 * 4 + 202.5,
    },
    {
      x: values.APositions[0][0] + (values.APositions[3][0] - values.APositions[0][0]) * (ct / rt),
      y: values.APositions[0][1] + (values.APositions[3][1] - values.APositions[0][1]) * (ct / rt),
      direction: 22.5 * 3 + 202.5,
    },
  ];
};
