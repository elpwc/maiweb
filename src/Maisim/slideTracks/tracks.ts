import { center, maimaiJudgeLineR } from '../global';
import { cos, sin, π } from '../../math';
import { APositions, qpCenterCircleR, qplen, szLeftPoint, szRightPoint } from './_global';
import { lineLen } from '../drawUtils/_base';

/**
 * 获得当前时刻的track信息
 * @param type track类型
 * @param startPos 开始点
 * @param endPosOri 结束点（原始的）
 * @param ct 当前经过时间
 * @param rt 总时间
 * @returns 这一时刻的位置，方向
 */
export const getTrackProps = (type: string, startPos: number, endPosOri: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  let endPos = endPosOri - startPos + 1;
  if (endPos < 1) endPos += 8;
  switch (type) {
    case '-':
      return straight(endPos, ct, rt);
    case '^':
      return curve(endPos, ct, rt);
    case '<':
      return leftCurve(startPos, endPos, ct, rt);
    case '>':
      return rightCurve(startPos, endPos, ct, rt);
    case 'v':
      return v(endPos, ct, rt);
    case 's':
      return s(ct, rt);
    case 'z':
      return z(ct, rt);
    case 'p':
      return p(endPos, ct, rt);
    case 'q':
      return q(endPos, ct, rt);
    default:
      return { x: 0, y: 0, direction: 0 };
  }
};

// -
const straight = (endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  return {
    x: APositions[0][0] + (APositions[endPos - 1][0] - APositions[0][0]) * (ct / rt),
    y: APositions[0][1] + (APositions[endPos - 1][1] - APositions[0][1]) * (ct / rt),
    direction: 22.5 * (endPos - 1) + 202.5,
  };
};

// ^
const curve = (endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (endPos > 1 && endPos < 5) {
    return {
      x: center[0] + maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
      y: center[1] + maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
      direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
    };
  } else if (endPos > 5 && endPos <= 8) {
    return {
      x: center[0] + maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      y: center[1] + maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// <
const leftCurve = (startPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (startPos <= 2 || startPos >= 7) {
    if (endPos > 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
      };
    } else if (endPos === 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((-2 * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((-2 * (ct / rt) - 0.375) * π),
        direction: -360 * (ct / rt) + 22.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else if (startPos >= 3 && startPos <= 6) {
    if (endPos > 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
      };
    } else if (endPos === 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos(((2 * ct) / rt - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin(((2 * ct) / rt - 0.375) * π),
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
const rightCurve = (startPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (startPos <= 2 || startPos >= 7) {
    if (endPos > 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((0.25 * (endPos - 1) * (ct / rt) - 0.375) * π),
        direction: 45 * (endPos - 1) * (ct / rt) + 202.5,
      };
    } else if (endPos === 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos(((2 * ct) / rt - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin(((2 * ct) / rt - 0.375) * π),
        direction: 360 * (ct / rt) + 202.5,
      };
    } else {
      return { x: 0, y: 0, direction: 0 };
    }
  } else if (startPos >= 3 && startPos <= 6) {
    if (endPos > 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
        direction: -45 * (9 - endPos) * (ct / rt) + 22.5,
      };
    } else if (endPos === 1) {
      return {
        x: center[0] + maimaiJudgeLineR * cos((-2 * (ct / rt) - 0.375) * π),
        y: center[1] + maimaiJudgeLineR * sin((-2 * (ct / rt) - 0.375) * π),
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
const v = (endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt / 2) {
    return {
      x: APositions[0][0] + (center[0] - APositions[0][0]) * (ct / (rt / 2)),
      y: APositions[0][1] + (center[1] - APositions[0][1]) * (ct / (rt / 2)),
      direction: -67.5,
    };
  } else {
    return {
      x: center[0] + (APositions[endPos - 1][0] - center[0]) * ((ct - rt / 2) / (rt / 2)),
      y: center[1] + (APositions[endPos - 1][1] - center[1]) * ((ct - rt / 2) / (rt / 2)),
      direction: 45 * endPos + 67.5,
    };
  }
};

const sz_r1 = 0.361615673,
  sz_r2 = 0.276786931;
// s
const s = (ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt * sz_r1) {
    return {
      x: APositions[0][0] + (szLeftPoint[0] - APositions[0][0]) * (ct / (rt * sz_r1)),
      y: APositions[0][1] + (szLeftPoint[1] - APositions[0][1]) * (ct / (rt * sz_r1)),
      direction: -45,
    };
  } else if (ct >= rt * sz_r1 && ct < rt * (sz_r1 + sz_r2)) {
    return {
      x: szLeftPoint[0] + (szRightPoint[0] - szLeftPoint[0]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      y: szLeftPoint[1] + (szRightPoint[1] - szLeftPoint[1]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      direction: 202.5,
    };
  } else {
    return {
      x: szRightPoint[0] + (APositions[4][0] - szRightPoint[0]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      y: szRightPoint[1] + (APositions[4][1] - szRightPoint[1]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      direction: -45,
    };
  }
};

// z
const z = (ct: number, rt: number): { x: number; y: number; direction: number } => {
  if (ct < rt * sz_r1) {
    return {
      x: APositions[0][0] + (szRightPoint[0] - APositions[0][0]) * (ct / (rt * sz_r1)),
      y: APositions[0][1] + (szRightPoint[1] - APositions[0][1]) * (ct / (rt * sz_r1)),
      direction: -90,
    };
  } else if (ct >= rt * sz_r1 && ct < rt * (sz_r1 + sz_r2)) {
    return {
      x: szRightPoint[0] + (szLeftPoint[0] - szRightPoint[0]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      y: szRightPoint[1] + (szLeftPoint[1] - szRightPoint[1]) * ((ct - rt * sz_r1) / (rt * sz_r2)),
      direction: 22.5,
    };
  } else {
    return {
      x: szLeftPoint[0] + (APositions[4][0] - szLeftPoint[0]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      y: szLeftPoint[1] + (APositions[4][1] - szLeftPoint[1]) * ((ct - rt * (sz_r1 + sz_r2)) / (rt * sz_r1)),
      direction: -90,
    };
  }
};

// p
const p = (endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = -0.75;
  /** 圆弧的角度 */
  const angle = 0.25 * (endPos >= 6 ? 14 - endPos : 6 - endPos);
  /** 圆弧开始的点 */
  const p1 = [center[0] + qpCenterCircleR * cos(startAngle * π), center[1] + qpCenterCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [center[0] + qpCenterCircleR * cos((startAngle - angle) * π), center[1] + qpCenterCircleR * sin((startAngle - angle) * π)];
  /** 圆弧长度 */
  const curveLen = angle * qpCenterCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + qplen * 2;

  const b = ct / rt;

  if (b <= qplen / sumLen) {
    return {
      x: APositions[0][0] + (p1[0] - APositions[0][0]) * (b / (qplen / sumLen)),
      y: APositions[0][1] + (p1[1] - APositions[0][1]) * (b / (qplen / sumLen)),
      direction: -45,
    };
  } else if (b > qplen / sumLen && b < (qplen + curveLen) / sumLen) {
    return {
      x: center[0] + qpCenterCircleR * cos((startAngle - ((sumLen * b - qplen) / curveLen) * angle) * π),
      y: center[1] + qpCenterCircleR * sin((startAngle - ((sumLen * b - qplen) / curveLen) * angle) * π),
      direction: (startAngle - ((sumLen * b - qplen) / curveLen) * angle + 0.5) * 180,
    };
  } else if (b >= (qplen + curveLen) / sumLen) {
    return {
      x: p2[0] + (APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - qplen) / qplen),
      y: p2[1] + (APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - qplen) / qplen),
      direction: 45 * (endPos >= 6 ? endPos - 7 : endPos + 1),
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};

// q
const q = (endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  /** 圆弧开始画的角度 */
  const startAngle = 0;
  /** 圆弧的角度 */
  const angle = 0.25 * (endPos <= 4 ? endPos + 4 : endPos - 4);
  /** 圆弧开始的点 */
  const p1 = [center[0] + qpCenterCircleR * cos(startAngle * π), center[1] + qpCenterCircleR * sin(startAngle * π)];
  /** 圆弧终止的点 */
  const p2 = [center[0] + qpCenterCircleR * cos((startAngle + angle) * π), center[1] + qpCenterCircleR * sin((startAngle + angle) * π)];
  /** 圆弧长度 */
  const curveLen = angle * qpCenterCircleR * π;
  /** 总长度 */
  const sumLen = curveLen + qplen * 2;

  const b = ct / rt;

  if (b <= qplen / sumLen) {
    return {
      x: APositions[0][0] + (p1[0] - APositions[0][0]) * (b / (qplen / sumLen)),
      y: APositions[0][1] + (p1[1] - APositions[0][1]) * (b / (qplen / sumLen)),
      direction: -90,
    };
  } else if (b > qplen / sumLen && b < (qplen + curveLen) / sumLen) {
    return {
      x: center[0] + qpCenterCircleR * cos((startAngle + ((sumLen * b - qplen) / curveLen) * angle) * π),
      y: center[1] + qpCenterCircleR * sin((startAngle + ((sumLen * b - qplen) / curveLen) * angle) * π),
      direction: (startAngle + ((sumLen * b - qplen) / curveLen) * angle - 0.5) * 180,
    };
  } else if (b >= (qplen + curveLen) / sumLen) {
    return {
      x: p2[0] + (APositions[endPos - 1][0] - p2[0]) * ((sumLen * b - curveLen - qplen) / qplen),
      y: p2[1] + (APositions[endPos - 1][1] - p2[1]) * ((sumLen * b - curveLen - qplen) / qplen),
      direction: 45 * (endPos <= 4 ? endPos - 6 : endPos - 6),
    };
  } else {
    return { x: 0, y: 0, direction: 0 };
  }
};
