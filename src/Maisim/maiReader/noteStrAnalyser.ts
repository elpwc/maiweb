import { Note, SlideLine, SlideTrack } from '../../utils/note';
import { NoteType } from '../../utils/noteType';
import { flipPos } from '../areas';
import { flipTrack } from '../slideTracks/_global';
import { FlipMode } from '../utils/flipMode';
import { noteValue_and_noteNumber_analyser } from './noteValueAnalyser';
import { analyse_slide_line } from './slideLineAnalyser';

/** 分析谱面中一个note的文本 */
export const analyse_note_original_data = (noteDataOri: string, index: number, currentBPM: number, flipMode: FlipMode) => {
  //console.log(noteDataOri, index);
  let noteRes: Note = {
    index,
    serial: -1,
    pos: '',
    slideTracks: [],
    type: NoteType.Empty,
    beatIndex: 0,
    partnotevalue: 0,
    bpm: 0,
    time: 0,
  };
  let noteData = noteDataOri;

  if (noteData === '') {
    return null;
  }

  if (noteData.indexOf('速') !== -1) {
    // 伪EACH
    noteRes.isNiseEach = true;
    noteData = noteData.replaceAll('速', '');
  }

  if (noteData.indexOf('b') !== -1) {
    // BREAK
    // 如果是SLIDE
    if (noteData.includes('[') && !noteData.includes('h')) {
      if (noteData.split('b').length === 3) {
        noteRes.isBreak = true;
        noteRes.isSlideTrackBreak = true;
      } else if (noteData.split('b').length === 2) {
        if (noteData.substring(1, 2) === 'b') {
          noteRes.isBreak = true;
        } else {
          noteRes.isSlideTrackBreak = true;
        }
      }
    } else {
      // 通常Note
      noteRes.isBreak = true;
    }
    noteData = noteData.replaceAll('b', '');
  }
  if (noteData.indexOf('x') !== -1) {
    // EX
    noteRes.isEx = true;
    noteData = noteData.replaceAll('x', '');
  }
  if (noteData.indexOf('f') !== -1) {
    // FIREWORK
    noteRes.hasFirework = true;
    noteData = noteData.replaceAll('f', '');
  }

  // $ @ ? !
  if (noteData.indexOf('$') !== -1) {
    // TAP、BREAKを強制的に☆型にする
    noteRes.isStarTap = true;
    // 2つ並べて"$$"にすると、☆TAPが回転するようになる(回転速度は一定)
    if (noteData.substring(noteData.indexOf('$') + 1, noteData.indexOf('$') + 2) === '$') {
      noteRes.starTapRotate = true;
    } else {
      noteRes.starTapRotate = false;
    }
    noteData = noteData.replaceAll('$', '');
  }
  if (noteData.indexOf('@') !== -1) {
    // SLIDE時にTAP、BREAKを強制的に○型にする
    noteRes.isTapStar = true;
    noteData = noteData.replaceAll('@', '');
  }
  if (noteData.indexOf('?') !== -1) {
    // "?"の場合は、タメ時間中にSLIDEをなぞる用の☆が表示される
    noteRes.isNoTapSlide = true;
    noteData = noteData.replaceAll('?', '');
  }
  if (noteData.indexOf('!') !== -1) {
    // "!"の場合は、SLIDEをなぞり始めるその瞬間にいきなり☆が表示される
    noteRes.isNoTapNoTameTimeSlide = true;
    noteData = noteData.replaceAll('!', '');
  }

  if (noteData.length === 1) {
    // C TOUCH, TAP
    if (noteData === 'C') {
      // C TOUCH
      noteRes.type = NoteType.Touch;
      noteRes.pos = 'C';
    } else {
      // TAP
      noteRes.type = NoteType.Tap;
      noteRes.pos = flipPos(noteData, flipMode);
    }
  }

  if (noteData.length === 2) {
    // TOUCH (except C)
    noteRes.type = NoteType.Touch;
    noteRes.pos = flipPos(noteData, flipMode);

    // C1 C2
    if (noteRes.pos === 'C1' || noteRes.pos === 'C2') {
      noteRes.pos = 'C';
    }
  }

  if (noteData.indexOf('[') !== -1) {
    // SLIDE,HOLD,TOUCH HOLD
    if (noteData.indexOf('h') !== -1) {
      // HOLD, TOUCH HOLD

      const noteValue_and_noteNumber_original_data = noteData.substring(noteData.indexOf('[') + 1, noteData.indexOf(']'));

      let noteValue_and_noteNumber: number[] = [];

      if (noteValue_and_noteNumber_original_data.substring(0, 1) === '#') {
        noteRes.remainTime = Number(noteValue_and_noteNumber_original_data.substring(1, noteValue_and_noteNumber_original_data.length)) * 1000;
      } else {
        noteValue_and_noteNumber = noteData
          .substring(noteData.indexOf('[') + 1, noteData.indexOf(']'))
          .split(':')
          .map(e => {
            return Number(e);
          });
        noteRes.notevalue = noteValue_and_noteNumber[0];
        noteRes.notenumber = noteValue_and_noteNumber[1];

        noteRes.remainTime = (240 * noteRes.notenumber * 1000) / (currentBPM * noteRes.notevalue);
      }

      noteData = noteData.substring(0, noteData.indexOf('['));

      //console.log(noteRes);
      const firstChar = noteData.substring(0, 1);
      if (firstChar === 'C' || firstChar === 'A' || firstChar === 'B' || firstChar === 'D' || firstChar === 'E') {
        // TOUCH HOLD
        noteRes.type = NoteType.TouchHold;
        noteRes.isShortHold = false;
        if (firstChar === 'C') {
          noteRes.pos = 'C';
        } else {
          noteRes.pos = flipPos(noteData.substring(0, 2), flipMode);
        }
      } else {
        // HOLD
        noteRes.type = NoteType.Hold;
        noteRes.isShortHold = false;
        noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
      }
    } else {
      // SLIDE (TAP + SLIDES)
      // SLIDE TAP
      noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
      noteRes.type = NoteType.Slide;
      noteData = noteData.substring(1, noteData.length);

      const slides = noteData.split('*');
      slides.forEach(slideOri => {
        // SLIDES
        let slide = slideOri;

        let currentSlideTrackRes: SlideTrack = {};

        // 判断是不是人体蜈蚣
        const slideLines: SlideLine[] = [];
        if (slide.split('[').length > 2) {
          // 1. simai型   -3[:]-5[:]
          currentSlideTrackRes.isChain = true;

          const temp_slideLinesOri: SlideTrack[] = [];
          slide.split(']').forEach(lineOriData => {
            if (lineOriData !== '') {
              const analysedLine = analyse_slide_line(lineOriData + ']', currentBPM, flipMode);
              temp_slideLinesOri.push(analysedLine);
            }
          });

          // 总remainTime
          let totalRemainTime = 0;
          temp_slideLinesOri.forEach((slideLineOri, i) => {
            if (i === 0) {
              currentSlideTrackRes.stopTime = slideLineOri.stopTime;
            }
            totalRemainTime += slideLineOri.remainTime ?? 0;
          });

          /** 开始时间 */
          let beginTime = 0;

          temp_slideLinesOri.forEach((slideLineOri, i) => {
            slideLines.push({
              slideType: slideLineOri.slideType,
              endPos: slideLineOri.endPos,
              turnPos: slideLineOri.turnPos,
              pos: i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos,

              /**  持续时间占比 */
              remainTime: slideLineOri.remainTime,
              beginTime,
            });
            beginTime += slideLineOri.remainTime ?? 0;
          });

          currentSlideTrackRes.remainTime = totalRemainTime;
          currentSlideTrackRes.slideLines = slideLines;
        } else if (slide.split(/-|\^|<|>|v|s|z|pp|qq|p|q|w|V/).length > 2) {
          // 2. majdata型   -3-5[:]
          currentSlideTrackRes.isChain = true;

          const temp_slideLinesOri: SlideLine[] = [];

          let positions = slide.split('[')[0];
          const noteValue_and_noteNumber_original_data = slide.substring(slide.indexOf('[') + 1, slide.indexOf(']'));

          const noteValueRes = noteValue_and_noteNumber_analyser(noteValue_and_noteNumber_original_data, currentBPM);
          currentSlideTrackRes.notevalue = noteValueRes.notevalue;
          currentSlideTrackRes.notenumber = noteValueRes.notenumber;
          currentSlideTrackRes.remainTime = noteValueRes.remainTime;
          currentSlideTrackRes.stopTime = noteValueRes.stopTime;

          let i = 0;
          //开始处理左边这一长串  pp3w6V57-3-6qq3q4
          while (positions !== '') {
            if (positions.substring(0, 2) === 'pp' || positions.substring(0, 2) === 'qq') {
              // pp qq
              temp_slideLinesOri.push({
                slideType: flipTrack(positions.substring(0, 2), flipMode),
                endPos: flipPos(positions.substring(2, 3), flipMode),
                pos: i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos,

                /**  持续时间占比 */
                remainTime: 0,
                beginTime: 0,
              });
              positions = positions.substring(3, positions.length);
            } else if (positions.substring(0, 1) === 'V') {
              //V
              temp_slideLinesOri.push({
                slideType: positions.substring(0, 1),
                turnPos: flipPos(positions.substring(1, 2), flipMode),
                endPos: flipPos(positions.substring(2, 3), flipMode),
                pos: i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos,

                /**  持续时间占比 */
                remainTime: 0,
                beginTime: 0,
              });
              positions = positions.substring(3, positions.length);
            } else {
              // normal
              temp_slideLinesOri.push({
                slideType: flipTrack(positions.substring(0, 1), flipMode),
                endPos: flipPos(positions.substring(1, 2), flipMode),
                pos: i === 0 ? noteRes.pos : temp_slideLinesOri[i - 1].endPos,

                /**  持续时间占比 */
                remainTime: 0,
                beginTime: 0,
              });
              positions = positions.substring(2, positions.length);
            }
            i++;
          }

          // 设置时间
          for (let j = 0; j < temp_slideLinesOri.length; j++) {
            temp_slideLinesOri[j].beginTime = (j / temp_slideLinesOri.length) * currentSlideTrackRes.remainTime;
            temp_slideLinesOri[j].remainTime = (1 / temp_slideLinesOri.length) * currentSlideTrackRes.remainTime;
          }

          currentSlideTrackRes.slideLines = temp_slideLinesOri;
        } else {
          // 正常
          currentSlideTrackRes = analyse_slide_line(slide, currentBPM, flipMode);
        }

        noteData = noteData.substring(0, noteData.indexOf('['));

        noteRes.slideTracks?.push(currentSlideTrackRes);
      });
    }
  } else {
    if (noteData.indexOf('h') !== -1) {
      // SHORT HOLD, SHORT TOUCH HOLD
      const firstChar = noteData.substring(0, 1);
      if (firstChar === 'C' || firstChar === 'A' || firstChar === 'B' || firstChar === 'D' || firstChar === 'E') {
        // TOUCH HOLD
        noteRes.type = NoteType.TouchHold;
        if (firstChar === 'C') {
          noteRes.pos = 'C';
        } else {
          noteRes.pos = flipPos(noteData.substring(0, 2), flipMode);
        }
        noteRes.isShortHold = true;
      } else {
        // HOLD
        noteRes.type = NoteType.Hold;
        noteRes.pos = flipPos(noteData.substring(0, 1), flipMode);
        noteRes.isShortHold = true;
      }
    }
  }

  return noteRes;
};
