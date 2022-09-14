import { center, maimaiJudgeLineR } from '../global';
import { cos, sin, π } from '../math';
import { APositions } from './_global';

export const getTrackProps = (type: string, startPos: number, endPos: number, ct: number, rt: number): { x: number; y: number; direction: number } => {
  let endPos_ = endPos - startPos + 1;
  if (endPos_ < 1) endPos_ += 8;
  switch (type) {
    case '-':
      return straight(endPos_, ct, rt);
    case '^':
      return curve(endPos_, ct, rt);
    case '<':
      return leftCurve(startPos, endPos_, ct, rt);
    case '>':
      return rightCurve(startPos, endPos_, ct, rt);
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
      direction: 22.5 * (endPos - 1) * (ct / rt) * 2 + 202.5,
    };
  } else if (endPos > 5 && endPos <= 8) {
    return {
      x: center[0] + maimaiJudgeLineR * cos((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      y: center[1] + maimaiJudgeLineR * sin((-0.25 * (9 - endPos) * (ct / rt) - 0.375) * π),
      direction: -22.5 * (9 - endPos) * (ct / rt) * 2 + 22.5,
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
        direction: -22.5 * (9 - endPos) * (ct / rt) * 2 + 22.5,
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
        direction: 22.5 * (endPos - 1) * (ct / rt) * 2 + 202.5,
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
        direction: 22.5 * (endPos - 1) * (ct / rt) * 2 + 202.5,
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
        direction: -22.5 * (9 - endPos) * (ct / rt) * 2 + 22.5,
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
