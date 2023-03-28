import { SlideTrack } from '../utils/note';
import { flipPos } from '../areas';
import { section } from '../slideTracks/section';
import { flipTrack } from '../slideTracks/_global';
import { FlipMode } from '../utils/types/flipMode';
import { noteValue_and_noteNumber_analyser } from './noteValueAnalyser';

/** 对一整条SLIDE的谱面文本的分析（majdata型人体蜈蚣不走这里，直接在noteStrAnalyser.ts里解析） */
export const analyse_slide_line = (oriData: string, startPos: string, currentBPM: number, flipMode: FlipMode): SlideTrack => {
  /** 不包含头的SLIDES， format be like:  -5[1:4]  pp2[1:4] */
  let slide = oriData;

  let currentSlideTrackRes: SlideTrack = {};

  const noteValue_and_noteNumber_original_data = slide.substring(slide.indexOf('[') + 1, slide.indexOf(']'));

  const noteValueRes = noteValue_and_noteNumber_analyser(noteValue_and_noteNumber_original_data, currentBPM);
  currentSlideTrackRes.notevalue = noteValueRes.notevalue;
  currentSlideTrackRes.notenumber = noteValueRes.notenumber;
  currentSlideTrackRes.remainTime = noteValueRes.remainTime;
  currentSlideTrackRes.stopTime = noteValueRes.stopTime;

  let endPos = undefined,
    turnPos = undefined;

  currentSlideTrackRes.slideType = slide.substring(0, 1) as '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  if (currentSlideTrackRes.slideType === 'p' && slide.substring(1, 2) === 'p') {
    currentSlideTrackRes.slideType = 'pp';
    endPos = slide.substring(2, 3);
  } else if (currentSlideTrackRes.slideType === 'q' && slide.substring(1, 2) === 'q') {
    currentSlideTrackRes.slideType = 'qq';
    endPos = slide.substring(2, 3);
  } else if (currentSlideTrackRes.slideType === 'V') {
    turnPos = slide.substring(1, 2);
    endPos = slide.substring(2, 3);
  } else {
    endPos = slide.substring(1, 2);
  }

  currentSlideTrackRes.slideType = flipTrack(currentSlideTrackRes.slideType, flipMode);
  currentSlideTrackRes.turnPos = flipPos(turnPos, flipMode);
  currentSlideTrackRes.endPos = flipPos(endPos, flipMode);

  //currentSlideTrackRes.sections = section(currentSlideTrackRes.slideType, startPos, currentSlideTrackRes.endPos!, currentSlideTrackRes.turnPos);

  return currentSlideTrackRes;
};
