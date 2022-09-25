import { abs } from '../math';
import { Note, Beat, SlideTrack } from '../utils/note';
import { NoteType } from '../utils/noteType';
import { Sheet } from '../utils/sheet';
import { Song } from '../utils/song';

export const ReadMaimaiData = (sheetData: string) => {
  let res: Song = {
    title: '',
    availableDifficulties: [],
    sheets: [],
  };

  sheetData.split('&').map((e) => {
    const splitPos = e.indexOf('=');
    const pname = e.substring(0, splitPos);
    const pvalue = e.substring(splitPos + 1, e.length - 1);

    //console.log(pname, pvalue);

    switch (pname) {
      case 'title':
        res.title = pvalue;
        break;
      case 'artist':
        res.artist = pvalue;
        break;
      case 'smsg':
        res.smsg = pvalue;
        break;
      case 'wholebpm':
        res.wholebpm = Number(pvalue);
        break;
      case 'first':
        res.first = Number(pvalue);
        break;
      case 'bg':
        res.bg = pvalue;
        break;
      case 'track':
        res.track = pvalue;
        break;

      default:
        // 处理各个带等级数字的属性
        const sheetinfos = pname.split('_');
        if (sheetinfos.length === 2 && !isNaN(Number(sheetinfos[1]))) {
          const propPrefix = sheetinfos[0],
            propDifficulty = Number(sheetinfos[1]);

          let sheetIndex = res.sheets.findIndex((sheet: Sheet) => {
            return sheet.difficulty === propDifficulty;
          });
          if (sheetIndex === -1) {
            res.availableDifficulties.push(propDifficulty);
            res.sheets.push({
              difficulty: propDifficulty,
              level: 0,
              notes: [],
              beats: [],
              basicEvaluation: 0,
              exEvaluation: 0,
            });
          }
          sheetIndex = res.sheets.length - 1;

          switch (propPrefix) {
            case 'lv':
              res.sheets[sheetIndex].level = Number(pvalue);
              break;
            case 'des':
              res.sheets[sheetIndex].designer = pvalue;
              break;
            case 'inote':
              const noteRes = read_inote(pvalue);
              res.sheets[sheetIndex].beats = noteRes.beats;
              res.sheets[sheetIndex].notes = noteRes.notes;

              // evaluation
              res.sheets[sheetIndex].basicEvaluation =
                100 /
                (res.sheets[sheetIndex].notes.filter((note) => {
                  return (note.type === NoteType.Tap || note.type === NoteType.Slide || note.type === NoteType.Touch) && !note.isBreak;
                }).length *
                  1 +
                  res.sheets[sheetIndex].notes.filter((note) => {
                    return (note.type === NoteType.Hold || note.type === NoteType.TouchHold) && !note.isBreak;
                  }).length *
                    2 +
                  res.sheets[sheetIndex].notes.filter((note) => {
                    return note.type === NoteType.SlideTrack && !note.isBreak;
                  }).length *
                    3 +
                  res.sheets[sheetIndex].notes.filter((note) => {
                    return note.isBreak;
                  }).length *
                    5);
              res.sheets[sheetIndex].exEvaluation =
                1 /
                res.sheets[sheetIndex].notes.filter((note) => {
                  return note.isBreak;
                }).length;
              break;
          }
        }

        break;
    }
  });

  //console.log(res);
  return res;
  /*
「&」→「\＆」
「+」→「\＋」
「%」→「\％」
「\」→「\￥」
    */
};

/**
 * 读取maimaiDX谱面文件的inote属性
 * @param inoteOri inote内容
 * @returns
 */
export const read_inote = (inoteOri: string): { notes: Note[]; beats: Beat[] } => {
  let currentBPM: number = 0;
  let currentNoteNumber: number = 0;

  let beatRes: Beat[] = [];
  let notesRes: Note[] = [];

  let inote = inoteOri;

  //清除空格Tab
  inote = inote.replaceAll(' ', '').replaceAll('\t', '');

  //清除注释和结束符
  inote = inote
    .split('\n')
    .map((line) => {
      if (line.substring(0, 2) !== '||' || line === 'E') {
        return line;
      }
    })
    .join('');

  //所有note
  const hyoshis: string[][] = inote
    .replaceAll('\n', '')
    .replaceAll('\r', '')
    // 伪EACH
    .replaceAll('`', '`速')
    .split(/,|`/)
    .map((e) => {
      if (e.includes('(') || e.includes('{')) {
        // 针对 (4)12 这样的情况（即简写的TAP EACH前带了拍数或BPM变换）
        let endpos1 = e.lastIndexOf('}');
        const endpos2 = e.lastIndexOf(')');
        if (endpos2 > endpos1) endpos1 = endpos2;
        const notesdata = e.substring(endpos1 + 1, e.length);
        if (/^[0-9]+$/.test(notesdata)) {
          //连续数字为TAP EACH
          const tempRes = notesdata.split('');
          tempRes[0] = e.substring(0, endpos1 + 1) + tempRes[0];
          return tempRes;
        } else {
          //EACH
          return e.split('/');
        }
      } else {
        if (/^[0-9]+$/.test(e)) {
          //连续数字为TAP EACH
          return e.split('');
        } else {
          //EACH
          return e.split('/');
        }
      }
    });

  const length = hyoshis.length;

  //console.log(hyoshis);

  // 分析单个note
  const hyoshiAnalyse = (hyoshiDataOri: string, index: number) => {
    //console.log(hyoshiDataOri, index);
    let hyoshiRes: Note = {
      index,
      pos: '',
      slideTracks: [],
      type: NoteType.Empty,
      beatIndex: 0,
      partnotevalue: 0,
      bpm: 0,
      time: 0,
    };
    let hyoshiData = hyoshiDataOri;

    if (hyoshiData === '') {
      return null;
    }

    if (hyoshiData.indexOf('速') !== -1) {
      // 伪EACH
      hyoshiRes.isNiseEach = true;
      hyoshiData = hyoshiData.replaceAll('速', '');
    }

    if (hyoshiData.indexOf('b') !== -1) {
      // BREAK
      hyoshiRes.isBreak = true;
      hyoshiData = hyoshiData.replaceAll('b', '');
    }
    if (hyoshiData.indexOf('x') !== -1) {
      // EX
      hyoshiRes.isEx = true;
      hyoshiData = hyoshiData.replaceAll('x', '');
    }
    if (hyoshiData.indexOf('f') !== -1) {
      // FIREWORK
      hyoshiRes.isFirework = true;
      hyoshiData = hyoshiData.replaceAll('f', '');
    }

    // $ @ ? !
    if (hyoshiData.indexOf('$') !== -1) {
      // TAP、BREAKを強制的に☆型にする
      hyoshiRes.isStarTap = true;
      // 2つ並べて"$$"にすると、☆TAPが回転するようになる(回転速度は一定)
      if (hyoshiData.substring(hyoshiData.indexOf('$') + 1, hyoshiData.indexOf('$') + 2) === '$') {
        hyoshiRes.starTapRotate = true;
      } else {
        hyoshiRes.starTapRotate = false;
      }
      hyoshiData = hyoshiData.replaceAll('$', '');
    }
    if (hyoshiData.indexOf('@') !== -1) {
      // SLIDE時にTAP、BREAKを強制的に○型にする
      hyoshiRes.isTapStar = true;
      hyoshiData = hyoshiData.replaceAll('@', '');
    }
    if (hyoshiData.indexOf('?') !== -1) {
      // "?"の場合は、タメ時間中にSLIDEをなぞる用の☆が表示される
      hyoshiRes.isNoTapSlide = true;
      hyoshiData = hyoshiData.replaceAll('?', '');
    }
    if (hyoshiData.indexOf('!') !== -1) {
      // "!"の場合は、SLIDEをなぞり始めるその瞬間にいきなり☆が表示される
      hyoshiRes.isNoTapNoTameTimeSlide = true;
      hyoshiData = hyoshiData.replaceAll('!', '');
    }

    if (hyoshiData.length === 1) {
      // C TOUCH, TAP
      if (hyoshiData === 'C') {
        // C TOUCH
        hyoshiRes.type = NoteType.Touch;
        hyoshiRes.pos = 'C';
      } else {
        // TAP
        hyoshiRes.type = NoteType.Tap;
        hyoshiRes.pos = hyoshiData;
      }
    }

    if (hyoshiData.length === 2) {
      // TOUCH (except C)
      hyoshiRes.type = NoteType.Touch;
      hyoshiRes.pos = hyoshiData;
    }

    if (hyoshiData.indexOf('[') !== -1) {
      // SLIDE,HOLD,TOUCH HOLD
      if (hyoshiData.indexOf('h') !== -1) {
        // HOLD, TOUCH HOLD

        const noteValue_and_noteNumber_original_data = hyoshiData.substring(hyoshiData.indexOf('[') + 1, hyoshiData.indexOf(']'));

        let noteValue_and_noteNumber: number[] = [];

        if (noteValue_and_noteNumber_original_data.substring(0, 1) === '#') {
          hyoshiRes.remainTime = Number(noteValue_and_noteNumber_original_data.substring(1, noteValue_and_noteNumber_original_data.length)) * 1000;
        } else {
          noteValue_and_noteNumber = hyoshiData
            .substring(hyoshiData.indexOf('[') + 1, hyoshiData.indexOf(']'))
            .split(':')
            .map((e) => {
              return Number(e);
            });
          hyoshiRes.notevalue = noteValue_and_noteNumber[0];
          hyoshiRes.notenumber = noteValue_and_noteNumber[1];

          hyoshiRes.remainTime = (240 * hyoshiRes.notenumber * 1000) / (currentBPM * hyoshiRes.notevalue);
        }

        hyoshiData = hyoshiData.substring(0, hyoshiData.indexOf('['));

        //console.log(hyoshiRes);
        if (hyoshiData.substring(0, 1) === 'C') {
          // TOUCH HOLD
          hyoshiRes.type = NoteType.TouchHold;
          hyoshiRes.isShortHold = false;
          hyoshiRes.pos = 'C';
        } else {
          // HOLD
          hyoshiRes.type = NoteType.Hold;
          hyoshiRes.isShortHold = false;
          hyoshiRes.pos = hyoshiData.substring(0, 1);
        }
      } else {
        // SLIDE (TAP + SLIDES)
        // SLIDE TAP
        hyoshiRes.pos = hyoshiData.substring(0, 1);
        hyoshiRes.type = NoteType.Slide;
        hyoshiData = hyoshiData.substring(1, hyoshiData.length);

        const slides = hyoshiData.split('*');
        slides.forEach((slideOri) => {
          // SLIDES
          let slide = slideOri;

          let currentSlideTrackRes: SlideTrack = {};

          const noteValue_and_noteNumber_original_data = slide.substring(slide.indexOf('[') + 1, slide.indexOf(']'));

          let noteValue_and_noteNumber: number[] = [];

          if (noteValue_and_noteNumber_original_data.indexOf('#') !== -1) {
            if (noteValue_and_noteNumber_original_data.indexOf(':') !== -1) {
              // [持续时间BPM#分拍:拍]
              noteValue_and_noteNumber = noteValue_and_noteNumber_original_data.split(/#|:/).map((e) => {
                return Number(e);
              });
              currentSlideTrackRes.notevalue = noteValue_and_noteNumber[1];
              currentSlideTrackRes.notenumber = noteValue_and_noteNumber[2];
              //slide = slide.substring(0, slide.indexOf('['));

              currentSlideTrackRes.remainTime = (240_000 * currentSlideTrackRes.notenumber) / (currentBPM * currentSlideTrackRes.notevalue);
              currentSlideTrackRes.stopTime = 60_000 / noteValue_and_noteNumber[0];
            } else {
              const noteValue_and_noteNumber_original_data_split_by_numbersign = noteValue_and_noteNumber_original_data.split('#').map((e) => {
                return Number(e);
              });
              if (noteValue_and_noteNumber_original_data_split_by_numbersign.length === 2) {
                // [持续时间BPM#秒]
                currentSlideTrackRes.remainTime = noteValue_and_noteNumber_original_data_split_by_numbersign[1] * 1000;
                currentSlideTrackRes.stopTime = 60_000 / noteValue_and_noteNumber_original_data_split_by_numbersign[0];
              } else {
                // [持续时间秒##秒]
                currentSlideTrackRes.remainTime = noteValue_and_noteNumber_original_data_split_by_numbersign[1] * 1000;
                currentSlideTrackRes.stopTime = noteValue_and_noteNumber_original_data_split_by_numbersign[0] * 1000;
              }
            }
          } else {
            noteValue_and_noteNumber = noteValue_and_noteNumber_original_data.split(':').map((e) => {
              return Number(e);
            });
            currentSlideTrackRes.notevalue = noteValue_and_noteNumber[0];
            currentSlideTrackRes.notenumber = noteValue_and_noteNumber[1];
            //slide = slide.substring(0, slide.indexOf('['));

            currentSlideTrackRes.remainTime = (240 * currentSlideTrackRes.notenumber * 1000) / (currentBPM * currentSlideTrackRes.notevalue);
            currentSlideTrackRes.stopTime = 60_000 / currentBPM;
          }
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

          hyoshiData = hyoshiData.substring(0, hyoshiData.indexOf('['));

          hyoshiRes.slideTracks?.push(currentSlideTrackRes);
        });
      }
    } else {
      if (hyoshiData.indexOf('h') !== -1) {
        // SHORT HOLD, SHORT TOUCH HOLD
        if (hyoshiData.substring(0, 1) === 'C') {
          // TOUCH HOLD
          hyoshiRes.type = NoteType.TouchHold;
          hyoshiRes.pos = 'C';
          hyoshiRes.isShortHold = true;
        } else {
          // HOLD
          hyoshiRes.type = NoteType.Hold;
          hyoshiRes.pos = hyoshiData.substring(0, 1);
          hyoshiRes.isShortHold = true;
        }
      }
    }

    return hyoshiRes;
  };

  let currentTime: number = 0;

  //处理所有
  hyoshis.forEach((hyoshiGroup: string[], index) => {
    let beatT: Beat = {
      //notes: [],
      notevalue: 0,
      bpm: 0,
      time: currentTime,
      noteIndexes: [],
    };

    // (){}
    const bpmSign = hyoshiGroup[0].indexOf('(');

    //console.log(hyoshiGroup);

    if (bpmSign > -1) {
      currentBPM = Number(hyoshiGroup[0].substring(bpmSign + 1, hyoshiGroup[0].indexOf(')')));
      hyoshiGroup[0] = hyoshiGroup[0].substring(0, hyoshiGroup[0].indexOf('(')) + hyoshiGroup[0].substring(hyoshiGroup[0].indexOf(')') + 1, hyoshiGroup[0].length);
    }

    const noteSign = hyoshiGroup[0].indexOf('{');
    if (noteSign > -1) {
      if (hyoshiGroup[0].substring(noteSign, noteSign + 1) === '#') {
        const second = Number(hyoshiGroup[0].substring(noteSign + 2, hyoshiGroup[0].indexOf('}')));
        currentNoteNumber = 240 / (currentBPM * second);
      } else {
        currentNoteNumber = Number(hyoshiGroup[0].substring(noteSign + 1, hyoshiGroup[0].indexOf('}')));
      }
      hyoshiGroup[0] = hyoshiGroup[0].substring(0, hyoshiGroup[0].indexOf('{')) + hyoshiGroup[0].substring(hyoshiGroup[0].indexOf('}') + 1, hyoshiGroup[0].length);
    }

    beatT.bpm = currentBPM;
    beatT.notevalue = currentNoteNumber;
    beatT.time = currentTime;

    let isNiseEach = false;

    //处理一组Note
    // （二次处理）
    hyoshiGroup.forEach((hyoshi: string) => {
      /** 要加入Notes列表的note */
      const res: Note | null = hyoshiAnalyse(hyoshi, index);
      //console.log(res);

      isNiseEach = res?.isNiseEach ?? false;
      if (res?.isNiseEach) {
        beatT.time = beatRes[beatRes.length - 1].time + 3 / currentBPM;
      }

      if (hyoshiGroup.length > 1 && res) {
        res.isEach = true;
      }

      // 终止标记
      if (hyoshi === 'E' && res) {
        res.type = NoteType.EndMark;
      }

      if (res !== null) {
        res.beatIndex = beatRes.length;
        res.time = beatT.time;
        res.bpm = beatT.bpm;
        res.partnotevalue = beatT.notevalue;

        // 处理前的type
        const foreType = res.type;

        // 处理伪TAP 伪SLIDE
        if (res.isStarTap) {
          res.type = NoteType.Slide;
        }
        if (res.isTapStar) {
          res.type = NoteType.Tap;
        }

        // 处理好的res加入Notes列表
        // 并分离掉？！SLIDE的头
        if (!(res.isNoTapSlide || res.isNoTapNoTameTimeSlide)) {
          notesRes.push(res);
          beatT.noteIndexes.push(notesRes.length - 1);
        }

        // 加入SLIDE TRACK
        if (foreType === NoteType.Slide) {
          res.slideTracks?.forEach((slideTrack: SlideTrack) => {
            const tempSlideTrackNote: Note = {
              index: res.index,
              pos: res.pos,
              type: NoteType.SlideTrack,
              beatIndex: -1,
              partnotevalue: res.partnotevalue,
              bpm: res.bpm,
              time: res.time + slideTrack.stopTime! + slideTrack.remainTime!,
              slideType: slideTrack.slideType,
              endPos: slideTrack.endPos,
              turnPos: slideTrack.turnPos,
              /**  ため時間 */
              stopTime: slideTrack.stopTime,
              remainTime: slideTrack.remainTime,
              notenumber: slideTrack.notenumber,
              notevalue: slideTrack.notevalue,
              isEach: res.slideTracks!.length > 1,
              isTapStar: res.isTapStar,
              isStarTap: res.isStarTap,
              isNoTapSlide: res.isNoTapSlide,
              isNoTapNoTameTimeSlide: res.isNoTapNoTameTimeSlide,
            };

            notesRes.push(tempSlideTrackNote);
          });
        }
      }
    });

    // 设置eachPairDistance, isEachPairFirst
    // 画EACH pair的黄线要用
    if (beatT.noteIndexes.length > 1) {
      /** 除了TOUCH TOUCH HOLD的Note的index，大于1的话就喵 */
      let tapIndexes = [];
      tapIndexes = beatT.noteIndexes.filter((noteIndex) => {
        return notesRes[noteIndex].type !== NoteType.Touch && notesRes[noteIndex].type !== NoteType.TouchHold;
      });

      if (tapIndexes.length > 1) {
        // Pos最大最小的note
        let eachPairPosMin = 9;
        let eachPairPosMax = -1;
        let eachPairPosMinIndex: number = -1;
        let eachPairPosMaxIndex: number = -1;
        tapIndexes.forEach((noteIndex) => {
          const noteIns = notesRes[noteIndex];
          if (Number(noteIns.pos) >= eachPairPosMax) {
            eachPairPosMax = Number(noteIns.pos);
            eachPairPosMaxIndex = noteIndex;
          }
          if (Number(noteIns.pos) <= eachPairPosMin) {
            eachPairPosMin = Number(noteIns.pos);
            eachPairPosMinIndex = noteIndex;
          }
        });
        /** 最大最小的Note间的距离 */
        let eachPairDistance = abs(eachPairPosMax - eachPairPosMin);
        if (eachPairDistance > 4) {
          eachPairDistance = 8 - eachPairDistance;

          notesRes[eachPairPosMaxIndex].eachPairDistance = eachPairDistance;
          notesRes[eachPairPosMaxIndex].isEachPairFirst = true;
        } else {
          notesRes[eachPairPosMinIndex].eachPairDistance = eachPairDistance;
          notesRes[eachPairPosMinIndex].isEachPairFirst = true;
        }
      }
    }

    beatRes.push(beatT);

    if (!isNiseEach) {
      currentTime += (240 / beatT.notevalue / beatT.bpm) * 1000;
    }
  });

  // 排序
  beatRes.sort((a: Beat, b: Beat) => {
    return a.time - b.time;
  });

  console.log(beatRes, notesRes);

  return { beats: beatRes, notes: notesRes };
};
