import { Difficulty } from '../utils/difficulties';
import { FlipMode } from '../utils/flipMode';
import { Note } from '../utils/note';
import { NoteType } from '../utils/noteType';
import { Sheet, SheetSecondaryProps, SheetStatisticsProps } from '../utils/sheet';
import { Song } from '../utils/song';
import { read_inote } from './inoteReader';

// 参见 https://w.atwiki.jp/simai/pages/510.html
/**
 * 分析整个谱面文件里的内容，转化为对象（不是指读入inote的谱面文本的部分），顺便进行0-2次的谱面处理
 * @param sheetData 原始文本
 * @param flipMode 谱面翻转模式，默认不翻转
 * @returns
 */
export const ReadMaimaiData = (sheetData: string, flipMode: FlipMode): Song => {
  let res: Song = {
    title: '',
    availableDifficulties: [],
    sheets: [],
  };

  //（第0次谱面处理（）

  let globalFirst: number = 0;
  let globalDes: string | null = null;
  let globalSmsg: string | null = null;

  if (sheetData.substring(0, 1) === '&') sheetData = sheetData.substring(1, sheetData.length);

  sheetData.split('\n&').forEach(e => {
    const splitPos = e.indexOf('=');
    const pname = e.substring(0, splitPos);
    const pvalue = e.substring(splitPos + 1, e.length);
    //console.log(pname, pvalue);

    switch (pname) {
      case 'title':
        res.title = pvalue;
        break;
      case 'artist':
        res.artist = pvalue;
        break;
      case 'bpm':
      case 'wholebpm':
        if (pvalue !== '') {
          res.wholebpm = Number(pvalue);
        }
        break;
      // case 'bg':
      //   res.bg = pvalue;
      //   break;
      // case 'track':
      //   res.track = pvalue;
      //   break;

      default:
        break;
    }

    // 获取所有属性後再开始处理谱面

    // 处理各个可能带等级数字的属性

    const sheetinfos = pname.split('_');
    const propPrefix = sheetinfos[0];

    if (sheetinfos.length === 1) {
      switch (propPrefix) {
        case 'first':
          globalFirst = Number(pvalue);
          break;
        case 'des':
          globalDes = pvalue;
          break;
        case 'smsg':
          globalSmsg = pvalue;
          break;
        default:
          break;
      }
    }
    if (sheetinfos.length > 1) {
      if (!isNaN(Number(sheetinfos[1]))) {
        const propPrefix = sheetinfos[0],
          propDifficulty = Number(sheetinfos[1]);

        let sheetIndex = res.sheets.findIndex((sheet: Sheet) => {
          return sheet.difficulty === propDifficulty;
        });
        if (sheetIndex === -1) {
          res.availableDifficulties.push(propDifficulty);
          res.sheets.push({
            difficulty: propDifficulty,
            level: '',
            levelNumber: 0,
            notes: [],
            beats: [],
            basicEvaluation: 0,
            exEvaluation: 0,
            first: NaN,
            oldTheoreticalScore: 0,
            oldTheoreticalRate: 0,

            tapCount: 0,
            breakCount: 0,
            holdCount: 0,
            slideTrackCount: 0,
            touchCount: 0,
            touchHoldCount: 0,
            breakTapCount: 0,
            breakHoldCount: 0,
            breakSlideCount: 0,

            /** NOTE总数 */
            noteTotalCount: 0,
          });
        }
        sheetIndex = res.sheets.length - 1;

        switch (propPrefix) {
          case 'first':
            res.sheets[sheetIndex].first = Number(pvalue);
            break;
          case 'des':
            res.sheets[sheetIndex].designer = pvalue;
            break;
          case 'smsg':
            res.sheets[sheetIndex].smsg = pvalue;
            break;

          case 'lv':
            res.sheets[sheetIndex].level = pvalue;
            break;
          case 'inote':
            // 分析谱面
            const noteRes = read_inote(pvalue, res.wholebpm, flipMode);
            res.sheets[sheetIndex].beats = noteRes.beats;
            res.sheets[sheetIndex].notes = noteRes.notes;

            // 计算物量和基础值
            const statisticsProps = getStatisticsProps(res.sheets[sheetIndex].notes);

            Object.assign(res.sheets[sheetIndex], statisticsProps);

            break;
          default:
            break;
        }
      }
    }
  });

  // 应用全局属性
  res.sheets.forEach(sheet => {
    if (isNaN(sheet.first ?? NaN) && globalFirst !== 0) {
      sheet.first = globalFirst;
    }
    if (sheet.designer === null && globalDes !== null) {
      sheet.designer = globalDes as string;
    }
    if (sheet.smsg === null && globalSmsg !== null) {
      sheet.smsg = globalSmsg as string;
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

/** 计算谱面的物量和基础值 */
export const getStatisticsProps = (notes: Note[]): SheetStatisticsProps => {
  const res: SheetStatisticsProps = {
    basicEvaluation: 0,
    exEvaluation: 0,
    oldTheoreticalScore: 0,
    oldTheoreticalRate: 0,

    tapCount: 0,
    breakCount: 0,
    holdCount: 0,
    slideTrackCount: 0,
    touchCount: 0,
    touchHoldCount: 0,
    breakTapCount: 0,
    breakHoldCount: 0,
    breakSlideCount: 0,

    /** NOTE总数 */
    noteTotalCount: 0,
  };

  // 计算各种note数量
  res.tapCount = notes.filter(note => {
    return (note.type === NoteType.Tap || note.type === NoteType.Slide) && !note.isBreak;
  }).length;
  res.breakCount = notes.filter(note => {
    return note.isBreak;
  }).length;
  res.breakTapCount = notes.filter(note => {
    return (note.type === NoteType.Tap || note.type === NoteType.Slide) && note.isBreak;
  }).length;
  res.breakHoldCount = notes.filter(note => {
    return note.type === NoteType.Hold && note.isBreak;
  }).length;
  res.breakSlideCount = notes.filter(note => {
    return note.type === NoteType.SlideTrack && note.isBreak;
  }).length;
  res.touchCount = notes.filter(note => {
    return note.type === NoteType.Touch && !note.isBreak;
  }).length;
  res.touchHoldCount = notes.filter(note => {
    return note.type === NoteType.TouchHold && !note.isBreak;
  }).length;
  res.holdCount = notes.filter(note => {
    return note.type === NoteType.Hold && !note.isBreak;
  }).length;
  res.slideTrackCount = notes.filter(note => {
    return note.type === NoteType.SlideTrack && !note.isBreak;
  }).length;

  // evaluation 计算此谱面评价值
  res.basicEvaluation = (100 / (res.tapCount + res.touchCount)) * 1 + (res.holdCount + res.touchHoldCount) * 2 + res.slideTrackCount * 3 + res.breakCount * 5;
  res.exEvaluation = 1 / res.breakCount;

  // 旧框理论分
  res.oldTheoreticalScore = (res.tapCount + res.touchCount) * 500 + (res.holdCount + res.touchHoldCount) * 1000 + res.slideTrackCount * 1500 + res.breakCount * 2500;

  // 旧框理论Rate
  res.oldTheoreticalRate = ((res.tapCount + res.touchCount) * 500 + (res.holdCount + res.touchHoldCount) * 1000 + res.slideTrackCount * 1500 + res.breakCount * 2600) / res.oldTheoreticalScore;

  // 物量
  res.noteTotalCount = res.tapCount + res.touchCount + res.holdCount + res.touchHoldCount + res.slideTrackCount + res.breakCount;

  return res;
};

/** 通过谱面文本返回Sheet */
export const getSheet = (notes: string, flipMode: FlipMode = FlipMode.None, sheetProps: SheetSecondaryProps = {}): Sheet => {
  const noteRes = read_inote(notes, sheetProps.wholeBPM, flipMode);
  const res: Sheet = {
    notes: noteRes.notes,
    beats: noteRes.beats,
    basicEvaluation: 0,
    exEvaluation: 0,
    oldTheoreticalScore: 0,
    oldTheoreticalRate: 0,
    tapCount: 0,
    breakCount: 0,
    holdCount: 0,
    slideTrackCount: 0,
    touchCount: 0,
    touchHoldCount: 0,
    breakTapCount: 0,
    breakHoldCount: 0,
    breakSlideCount: 0,
    noteTotalCount: 0,
  };

  Object.assign(res, sheetProps);

  // 计算物量和基础值
  const statisticsProps = getStatisticsProps(res.notes);

  Object.assign(res, statisticsProps);

  return res;
};
