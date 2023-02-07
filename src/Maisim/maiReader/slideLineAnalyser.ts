import { Note, SlideLine, SlideTrack } from '../../utils/note';
import { NoteType } from '../../utils/noteType';
import { noteValue_and_noteNumber_analyser } from './noteValueAnalyser';

/** 对一整条SLIDE的谱面文本的分析 */
export const analyse_slide_line = (oriData: string, currentBPM: number) => {
  // SLIDES
  let slide = oriData;

  let currentSlideTrackRes: SlideTrack = {};

  const noteValue_and_noteNumber_original_data = slide.substring(slide.indexOf('[') + 1, slide.indexOf(']'));

  const noteValueRes = noteValue_and_noteNumber_analyser(noteValue_and_noteNumber_original_data, currentBPM);
  currentSlideTrackRes.notevalue = noteValueRes.notevalue;
  currentSlideTrackRes.notenumber = noteValueRes.notenumber;
  currentSlideTrackRes.remainTime = noteValueRes.remainTime;
  currentSlideTrackRes.stopTime = noteValueRes.stopTime;

  currentSlideTrackRes.slideType = slide.substring(0, 1) as '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  if (currentSlideTrackRes.slideType === 'p' && slide.substring(1, 2) === 'p') {
    currentSlideTrackRes.slideType = 'pp';
    currentSlideTrackRes.endPos = slide.substring(2, 3);
  } else if (currentSlideTrackRes.slideType === 'q' && slide.substring(1, 2) === 'q') {
    currentSlideTrackRes.slideType = 'qq';
    currentSlideTrackRes.endPos = slide.substring(2, 3);
  } else if (currentSlideTrackRes.slideType === 'V') {
    currentSlideTrackRes.turnPos = slide.substring(1, 2);
    currentSlideTrackRes.endPos = slide.substring(2, 3);
  } else {
    currentSlideTrackRes.endPos = slide.substring(1, 2);
  }

  return currentSlideTrackRes;
};
