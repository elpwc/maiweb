import { noteValue_and_noteNumber_analyser } from '../maiReader/noteValueAnalyser';
import { SpecPos } from './specPos';

/** 关键帧 */
export interface SpecFrame {
  timeBeforeJudgeTick: number;

  pos: SpecPos;
  width: number;
  alpha: number;
}

export interface AllFrames {
  emergeFrames: SpecFrame[];
  moveFrames: SpecFrame[];
}

/** 读< >内的内容 */
export const frameReader = (str: string, currentBPM: number): AllFrames => {
  const res: AllFrames = { emergeFrames: [], moveFrames: [] };
  let sections: SpecFrame[][] = [[], []];
  if (str.indexOf('||') !== -1) {
    sections = str.split('||').map(section => {
      return section.split('|').map(frame => {
        return readSingleFrame(frame, currentBPM);
      });
    });
  } else {
    sections[0] = str.split('|').map(frame => {
      return readSingleFrame(frame, currentBPM);
    });
  }
  res.emergeFrames = sections[0];
  res.moveFrames = sections[1];
  return res;
};

/** 读两个 | 之间的内容 */
export const readSingleFrame = (str: string, currentBPM: number): SpecFrame => {
  const res: SpecFrame = { timeBeforeJudgeTick: -1, pos: new SpecPos(), width: -1, alpha: -1 };

  const params = str.split(';');
  if (params[0] === '[-]') {
    res.timeBeforeJudgeTick = -1;
  } else if (params[0] === '[0]') {
    res.timeBeforeJudgeTick = 0;
  } else {
    res.timeBeforeJudgeTick = noteValue_and_noteNumber_analyser(params[0].substring(1, params[0].length - 1), currentBPM).remainTime;
  }

  res.pos = SpecPos.readPosFromStr(params[1]);
  res.width = Number(params[2] === '~' ? -1 : params[2]);
  res.alpha = Number(params[3] === '~' ? -1 : params[3]);

  return res;
};
