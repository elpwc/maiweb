import { NoteType } from '../../utils/noteType';
import { Sheet } from '../../utils/sheet';
import { Song } from '../../utils/song';
import { FlipMode } from '../utils/flipMode';
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
            const noteRes = read_inote(pvalue, res.wholebpm, flipMode);
            res.sheets[sheetIndex].beats = noteRes.beats;
            res.sheets[sheetIndex].notes = noteRes.notes;

            // evaluation 计算此谱面评价值
            res.sheets[sheetIndex].basicEvaluation =
              100 /
              (res.sheets[sheetIndex].notes.filter(note => {
                return (note.type === NoteType.Tap || note.type === NoteType.Slide || note.type === NoteType.Touch) && !note.isBreak;
              }).length *
                1 +
                res.sheets[sheetIndex].notes.filter(note => {
                  return (note.type === NoteType.Hold || note.type === NoteType.TouchHold) && !note.isBreak;
                }).length *
                  2 +
                res.sheets[sheetIndex].notes.filter(note => {
                  return note.type === NoteType.SlideTrack && !note.isBreak;
                }).length *
                  3 +
                res.sheets[sheetIndex].notes.filter(note => {
                  return note.isBreak;
                }).length *
                  5);
            res.sheets[sheetIndex].exEvaluation =
              1 /
              res.sheets[sheetIndex].notes.filter(note => {
                return note.isBreak;
              }).length;
            break;
          default:
            break;
        }
      }
    }
  });

  // 应用全局属性
  res.sheets.forEach(sheet => {
    if (isNaN(sheet.first) && globalFirst !== 0) {
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
