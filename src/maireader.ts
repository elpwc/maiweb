export enum Difficulty {
  Easy,
  Basic,
  Advanced,
  Expert,
  Master,
  ReMaster,
  Original,
}

export enum NoteIconType {
  TapNormal,
  TapEach,
  TapBreak,
  TapSlide,
}

export enum NoteType {
  Tap,
  Hold,
  Slide,

  Touch,
  TouchHold,
}

export interface SubSheet {
  beat: Beat[];
  length: number;
}

export interface Beat {
  notes: Note[];
  notevalue: number;
  bpm: number;
  // 触发时间
  time: number;
}

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

export interface Note {
  // 顺序
  index: number;

  isBreak?: boolean;
  isEx?: boolean;
  isFirework?: boolean;

  /** 位置 / 头位置 */
  pos: string;

  type?: number;

  // 伪EACH
  isNiseEach?: boolean;

  // 适用于SLIDE
  slideTracks?: SlideTrack[];

  // 适用于HOLD,TOUCH HOLD, SLIDE不适用
  isShortHold?: boolean;

  notevalue?: number;
  notenumber?: number;

  /**  持续时间/ms（HOLD）*/
  remainTime?: number;
}

export interface Sheet {
  title: string;
  artist?: string;
  smsg?: string;
  wholebpm?: number;
  first?: number;
  bg?: string;
  track?: string;

  lv_1?: number;
  lv_2?: number;
  lv_3?: number;
  lv_4?: number;
  lv_5?: number;
  lv_6?: number;
  lv_7?: number;

  des_1?: string;
  des_2?: string;
  des_3?: string;
  des_4?: string;
  des_5?: string;
  des_6?: string;
  des_7?: string;

  beats1?: SubSheet;
  beats2?: SubSheet;
  beats3?: SubSheet;
  beats4?: SubSheet;
  beats5?: SubSheet;
  beats6?: SubSheet;
  beats7?: SubSheet;

  availableDifficulties: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
}

export const ReadMaimaiData = (sheetData: string) => {
  let res: Sheet = {
    title: '',
    availableDifficulties: [false, false, false, false, false, false, false],
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

      case 'lv_1':
        res.availableDifficulties[0] = true;
        res.lv_1 = Number(pvalue);
        break;
      case 'lv_2':
        res.availableDifficulties[1] = true;
        res.lv_2 = Number(pvalue);
        break;
      case 'lv_3':
        res.availableDifficulties[2] = true;
        res.lv_3 = Number(pvalue);
        break;
      case 'lv_4':
        res.availableDifficulties[3] = true;
        res.lv_4 = Number(pvalue);
        break;
      case 'lv_5':
        res.availableDifficulties[4] = true;
        res.lv_5 = Number(pvalue);
        break;
      case 'lv_6':
        res.availableDifficulties[5] = true;
        res.lv_6 = Number(pvalue);
        break;
      case 'lv_7':
        res.availableDifficulties[6] = true;
        res.lv_7 = Number(pvalue);
        break;

      case 'des_1':
        res.des_1 = pvalue;
        break;
      case 'des_2':
        res.des_2 = pvalue;
        break;
      case 'des_3':
        res.des_3 = pvalue;
        break;
      case 'des_4':
        res.des_4 = pvalue;
        break;
      case 'des_5':
        res.des_5 = pvalue;
        break;
      case 'des_6':
        res.des_6 = pvalue;
        break;
      case 'des_7':
        res.des_7 = pvalue;
        break;

      case 'inote_1':
        res.beats1 = read_inote(pvalue);
        break;
      case 'inote_2':
        res.beats2 = read_inote(pvalue);
        break;
      case 'inote_3':
        res.beats3 = read_inote(pvalue);
        break;
      case 'inote_4':
        res.beats4 = read_inote(pvalue);
        break;
      case 'inote_5':
        res.beats5 = read_inote(pvalue);
        break;
      case 'inote_6':
        res.beats6 = read_inote(pvalue);
        break;
      case 'inote_7':
        res.beats7 = read_inote(pvalue);
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

export const read_inote = (inoteOri: string) => {
  let currentBPM: number = 0;
  let currentNoteNumber: number = 0;

  let beatRes: Beat[] = [];

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
      if (/^[0-9]+$/.test(e)) {
        //连续数字为TAP EACH
        return e.split('');
      } else {
        //EACH
        return e.split('/');
      }
    });

  const length = hyoshis.length;

  //console.log(hyoshis);

  // 分析单个note
  const hyoshiAnalyse = (hyoshiDataOri: string, index: number) => {
    //console.log(hyoshiDataOri, index);
    let hyoshiRes: Note = { index, pos: '', slideTracks: [] };
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
              currentSlideTrackRes.stopTime = 240_000 / noteValue_and_noteNumber[0];
            } else {
              const noteValue_and_noteNumber_original_data_split_by_numbersign = noteValue_and_noteNumber_original_data.split('#').map((e) => {
                return Number(e);
              });
              if (noteValue_and_noteNumber_original_data_split_by_numbersign.length === 2) {
                // [持续时间BPM#秒]
                currentSlideTrackRes.remainTime = noteValue_and_noteNumber_original_data_split_by_numbersign[1] * 1000;
                currentSlideTrackRes.stopTime = 240_000 / noteValue_and_noteNumber_original_data_split_by_numbersign[0];
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

            currentSlideTrackRes.slideType = slide.substring(0, 1) as '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V';

            if (currentSlideTrackRes.slideType === 'V') {
              currentSlideTrackRes.turnPos = slide.substring(1, 2);
              currentSlideTrackRes.endPos = slide.substring(2, 3);
            } else {
              currentSlideTrackRes.endPos = slide.substring(1, 2);
            }
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
      notes: [],
      notevalue: 0,
      bpm: 0,
      time: currentTime,
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

    // // End
    // if (hyoshiGroup[0] === 'E') {
    // }

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

      if (res !== null) {
        beatT.notes.push(res);
      }
    });

    beatRes.push(beatT);

    beatRes = beatRes.sort((a: Beat, b: Beat) => {
      return a.time - b.time;
    });

    if (!isNiseEach) {
      currentTime += (240 / beatT.notevalue / beatT.bpm) * 1000;
    }
  });

  console.log(beatRes);
  return { beat: beatRes, length } as SubSheet;
};
