import { NoteType } from '../../utils/noteType';
import { Sheet } from '../../utils/sheet';
import { Song } from '../../utils/song';
import { read_inote } from './inoteReader';

/** 分析整个谱面文件的内容，转化为对象（不是指读入inote的谱面文本的部分） */
export const ReadMaimaiData = (sheetData: string) => {
  let res: Song = {
    title: '',
    availableDifficulties: [],
    sheets: [],
  };

  sheetData.split('&').map(e => {
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
