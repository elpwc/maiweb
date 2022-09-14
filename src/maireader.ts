export enum Difficulty {
  Empty,
  Easy,
  Basic,
  Advanced,
  Expert,
  Master,
  ReMaster,
  Original,
  Utage,
}

export enum NoteType {
  Empty,

  Tap,
  Hold,
  Slide,
  SlideTrack,

  Touch,
  TouchHold,

  EndMark,
}

/** 一拍（可能是空白的，代表空拍） */
export interface Beat {
  // notes: Note[];
  notevalue: number;
  bpm: number;
  // 触发时间
  time: number;

  /** 包含的全部notes的索引 */
  noteIndexes: number[];
}

/** Slide轨迹 */
export interface SlideTrack {
  slideType?: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  endPos?: string;
  turnPos?: string;
  notevalue?: number;
  notenumber?: number;
  /**  持续时间/ms*/
  remainTime?: number;
  /**  ため時間 */
  stopTime?: number;
}

/** 一个Note */
export interface Note {
  /** 顺序 (实际好像没用过？) */
  index: number;

  isBreak?: boolean;
  isEx?: boolean;
  isFirework?: boolean;

  /** 位置 / 头位置 */
  pos: string;

  type: number;

  // 伪EACH
  isNiseEach?: boolean;

  // 适用于SLIDE
  slideTracks?: SlideTrack[];

  // 适用于HOLD,TOUCH HOLD, SLIDE不适用
  isShortHold?: boolean;

  // HOLD延时的节拍
  notevalue?: number;
  notenumber?: number;

  /**  持续时间/ms（HOLD）*/
  remainTime?: number;

  // 以下2个属性（还有下面的guideStarEmergeTime）在生成後由speed之类的决定
  /**
   * 浮现时间/ms
   *  对于TRACK: TRACK浮现时间（其实就是SLIDE TAP的movetime喵
   * */
  emergeTime?: number;
  /**
   * 移动时间/ms
   *  对于TRACK: GUIDE STAR开始移动的时间
   */
  moveTime?: number;

  isEach?: boolean;

  /** 在beats中的索引 */
  beatIndex: number;

  // 这一段的节拍
  partnotevalue: number;
  bpm: number;
  // 触发时间
  time: number;

  // 以下仅适用于SlideTrack
  slideType?: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';
  endPos?: string;
  turnPos?: string;
  /**  ため時間 */
  stopTime?: number;
  // 以下在生成後由speed之类的决定
  /** GUIDE STAR开始浮现的时间 */
  guideStarEmergeTime?: number;
}

/** 一个谱面 */
export interface Sheet {
  designer?: string;
  difficulty: Difficulty;
  level: number;
  notes: Note[];
  beats: Beat[];

  utageType?: string;
}

/** 一整首收录的乐曲信息 */
export interface Song {
  title: string;
  artist?: string;
  smsg?: string;
  wholebpm?: number;
  first?: number;
  bg?: string;
  track?: string;

  sheets: Sheet[];

  availableDifficulties: number[];
}

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

        console.log(hyoshiRes);
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

          if (currentSlideTrackRes.slideType === 'V') {
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
    hyoshiGroup.forEach((hyoshi: string) => {
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

        notesRes.push(res);
        beatT.noteIndexes.push(notesRes.length - 1);

        // 加入SLIDE TRACK
        if (res.type === NoteType.Slide) {
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
            };
            notesRes.push(tempSlideTrackNote);
          });
        }
      }
    });

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
