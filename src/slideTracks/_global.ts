import { center, maimaiJudgeLineR, maimaiScreenR } from '../global';
import { sqrt, π } from '../math';

export let APositions: [number, number][] = [];

for (let i = 1; i <= 8; i++) {
  APositions.push([center[0] + maimaiJudgeLineR * Math.cos((-5 / 8 + (1 / 4) * i) * Math.PI), center[1] + maimaiJudgeLineR * Math.sin((-5 / 8 + (1 / 4) * i) * Math.PI)]);
}

export const centerCircleR = maimaiScreenR * 0.356;

export const leftRightCircleCenterR = maimaiScreenR * 0.402;
export const leftRighCircleR = maimaiScreenR * 0.424;

export const leftCircleCenterAngle = 1.75;
export const rightCircleCenterAngle = 0.5;

export interface Segment {
  /** start */
  s: number;
  /** end */
  e: number;
  /** areas */
  a: string[];
}

export const trackLength = (type: string, startPos: number, endPosOri: number): number => {
  let endPos = endPosOri - startPos + 1;
  if (endPos < 1) endPos += 8;

  switch (type) {
    case '-':
      return sqrt((APositions[endPos - 1][0] - APositions[0][0]) ** 2 + (APositions[endPos - 1][1] - APositions[0][1]) ** 2);
    case '^':
      if (endPos > 1 && endPos < 5) {
        return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
      } else if (endPos > 5 && endPos <= 8) {
        return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
      }
      break;
    case '<':
      if (startPos <= 2 || startPos >= 7) {
        if (endPos > 1 && endPos <= 8) {
          return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
        } else if (endPos === 1) {
          return π * maimaiJudgeLineR * 2;
        }
      } else if (startPos >= 3 && startPos <= 6) {
        if (endPos > 1 && endPos <= 8) {
          return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
        } else if (endPos === 1) {
          return π * maimaiJudgeLineR * 2;
        }
      }

      break;
    case '>':
      if (startPos <= 2 || startPos >= 7) {
        if (endPos > 1 && endPos <= 8) {
          return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
        } else if (endPos === 1) {
          return π * maimaiJudgeLineR * 2;
        }
      } else if (startPos >= 3 && startPos <= 6) {
        if (endPos > 1 && endPos <= 8) {
          return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
        } else if (endPos === 1) {
          return π * maimaiJudgeLineR * 2;
        }
      }

      break;
    case 'v':
      break;
    case 'p':
      break;
    case 'q':
      break;
    case 'pp':
      break;
    case 'qq':
      break;
    case 's':
      break;
    case 'z':
      break;
    case 'V':
      break;
    case 'w':
      break;
    default:
      break;
  }
  return 0;
};

export const segment = (type: string, endPos: string) => {
  switch (type) {
    case '-':
      switch (endPos) {
        case '1':
          return [{}];
      }
      break;
    case '^':
      break;
    case '<':
      break;
    case '>':
      break;
    case 'v':
      break;
    case 'p':
      break;
    case 'q':
      break;
    case 'pp':
      break;
    case 'qq':
      break;
    case 's':
      break;
    case 'z':
      break;
    case 'V':
      break;
    case 'w':
      break;
    default:
      break;
  }
};
