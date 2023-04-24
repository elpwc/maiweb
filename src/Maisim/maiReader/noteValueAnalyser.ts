/** 分析[]里的内容喵 （实际上只有分析SLIDE时在用，不过不排除以後扩展到HOLD）*/
export const noteValue_and_noteNumber_analyser = (oriData: string, currentBPM: number): { notevalue: number; notenumber: number; remainTime: number; stopTime: number } => {
  const ndata = oriData;

  const res: { notevalue: number; notenumber: number; remainTime: number; stopTime: number } = {
    notevalue: 0,
    notenumber: 0,
    remainTime: 0,
    stopTime: 0,
  };

  let noteValue_and_noteNumber: number[] = [];

  if (ndata.indexOf('#') !== -1) {
    //有#
    if (ndata.substring(0, 1) !== '#') {
      if (ndata.indexOf('##') === -1) {
        if (ndata.indexOf(':') === -1) {
          //[ # ]
          // [持续时间BPM#秒]
          const noteValue_and_noteNumber_original_data_split_by_numbersign = ndata.split('#').map(e => {
            return Number(e);
          });
          res.remainTime = noteValue_and_noteNumber_original_data_split_by_numbersign[1] * 1000;
          res.stopTime = 60_000 / noteValue_and_noteNumber_original_data_split_by_numbersign[0];
        } else {
          //[ # : ]
          // [持续时间BPM#分拍:拍]
          noteValue_and_noteNumber = ndata.split(/#|:/).map(e => {
            return Number(e);
          });
          res.notevalue = noteValue_and_noteNumber[1];
          res.notenumber = noteValue_and_noteNumber[2];
          //slide = slide.substring(0, slide.indexOf('['));

          res.remainTime = (240_000 * res.notenumber) / (noteValue_and_noteNumber[0] * res.notevalue);
          res.stopTime = 60_000 / noteValue_and_noteNumber[0];
        }
      } else {
        //有##
        const noteValue_and_noteNumber_original_data_split_by_numbersign = ndata.split('#').map(e => {
          return Number(e);
        });
        if (ndata.indexOf(':') === -1) {
          if (ndata.split('#').length === 4) {
            //[ ## # : ]
            // [持续时间秒##BPM#分拍:拍]
            res.stopTime = noteValue_and_noteNumber_original_data_split_by_numbersign[0] * 1000;
            res.notevalue = noteValue_and_noteNumber[3];
            res.notenumber = noteValue_and_noteNumber[4];

            res.remainTime = (240_000 * res.notenumber) / (noteValue_and_noteNumber[2] * res.notevalue);
          } else {
            //[ ## : ]
            // [持续时间秒##分拍:拍]
            res.stopTime = noteValue_and_noteNumber_original_data_split_by_numbersign[0] * 1000;
            res.notevalue = noteValue_and_noteNumber[2];
            res.notenumber = noteValue_and_noteNumber[3];

            res.remainTime = (240_000 * res.notenumber) / (currentBPM * res.notevalue);
          }
        } else {
          //[ ## ]
          // [持续时间秒##秒]
          res.stopTime = noteValue_and_noteNumber_original_data_split_by_numbersign[0] * 1000;
          res.remainTime = noteValue_and_noteNumber_original_data_split_by_numbersign[1] * 1000;
        }
      }
    } else {
      //[# ]
      res.remainTime = Number(ndata.substring(1, ndata.length)) * 1000;
      res.stopTime = 60_000 / currentBPM;
    }
  } else {
    //[ : ]
    noteValue_and_noteNumber = ndata.split(':').map(e => {
      return Number(e);
    });
    res.notevalue = noteValue_and_noteNumber[0];
    res.notenumber = noteValue_and_noteNumber[1];
    //slide = slide.substring(0, slide.indexOf('['));

    res.remainTime = (240_000 * res.notenumber) / (currentBPM * res.notevalue);

    res.stopTime = 60_000 / currentBPM;
  }

  return res;
};
