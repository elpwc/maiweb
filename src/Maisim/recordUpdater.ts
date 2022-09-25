import { JudgeStatus, JudgeTimeStatus } from '../utils/judgeStatus';
import { Note } from '../utils/note';
import { NoteType } from '../utils/noteType';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import { gameRecord } from './global';
import { NoteSound } from './resourceReaders/noteSoundReader';

const dx_score = [3, 2, 1, 0, 0];

export const updateRecord = (note: Note, props: ShowingNoteProps, basicEvaluation: number, exEvaluation: number, soundOnly: boolean = false) => {
  // combo 计算
  if (props.judgeStatus !== JudgeStatus.Miss) {
    gameRecord.combo++;
    if (gameRecord.combo >= gameRecord.max_combo) gameRecord.max_combo = gameRecord.combo;
  } else {
    if (gameRecord.combo >= gameRecord.max_combo) gameRecord.max_combo = gameRecord.combo;
    gameRecord.combo = 0;
  }

  switch (note.type) {
    case NoteType.Tap:
    case NoteType.Slide:
      if (note.isBreak && note.isEx) {
        // EX BREAK
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.break.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.break.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
          case JudgeStatus.Perfect:
          case JudgeStatus.Great:
          case JudgeStatus.Good:
            gameRecord.break.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            break;
        }
      } else if (note.isBreak) {
        // TAP BREAK
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.break.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.break.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.break.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.break.perfect++;
            gameRecord.perfect++;
            switch (props.judgeLevel) {
              case 2:
                gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.75;
                break;
              case 3:
                gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.5;
                break;
            }
            gameRecord.dx_point += dx_score[1];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.break.great++;
            gameRecord.great++;
            switch (props.judgeLevel) {
              case 4:
                gameRecord.achieving_rate += basicEvaluation * 4 + exEvaluation * 0.4;
                break;
              case 5:
                gameRecord.achieving_rate += basicEvaluation * 3 + exEvaluation * 0.4;
                break;
              case 6:
                gameRecord.achieving_rate += basicEvaluation * 2.5 + exEvaluation * 0.4;
                break;
            }
            gameRecord.dx_point += dx_score[2];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.break.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 2 + exEvaluation * 0.3;
            gameRecord.dx_point += dx_score[3];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            break;
        }
      } else if (note.isEx) {
        // EX-TAP
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.tap.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.tap.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
          case JudgeStatus.Perfect:
          case JudgeStatus.Great:
          case JudgeStatus.Good:
            gameRecord.tap.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            // @ts-ignore
            NoteSound.ex.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.tap.miss++;
            gameRecord.miss++;
            break;
        }
      } else {
        //NORMAL TAP
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.tap.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.tap.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.tap.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            // @ts-ignore
            NoteSound.perfect.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.tap.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[1];
            // @ts-ignore
            NoteSound.perfect.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.tap.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 0.8;
            gameRecord.dx_point += dx_score[2];
            // @ts-ignore
            NoteSound.great.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.tap.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 0.5;
            gameRecord.dx_point += dx_score[3];
            // @ts-ignore
            NoteSound.good.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.tap.miss++;
            gameRecord.miss++;
            break;
        }
      }
      break;

    case NoteType.Hold:
      if (soundOnly) {
        if (note.isBreak && note.isEx) {
          // EX BREAK
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
            case JudgeStatus.Perfect:
            case JudgeStatus.Great:
            case JudgeStatus.Good:
              // @ts-ignore
              NoteSound.break1.cloneNode().play();
              break;
            case JudgeStatus.Miss:
              break;
          }
        } else if (note.isBreak) {
          // TAP BREAK
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
              // @ts-ignore
              NoteSound.break1.cloneNode().play();
              break;
            case JudgeStatus.Perfect:
              // @ts-ignore
              NoteSound.break1.cloneNode().play();
              break;
            case JudgeStatus.Great:
              gameRecord.break.great++;
              gameRecord.great++;
              // @ts-ignore
              NoteSound.break2.cloneNode().play();
              break;
            case JudgeStatus.Good:
              // @ts-ignore
              NoteSound.break2.cloneNode().play();
              break;
            case JudgeStatus.Miss:
              break;
          }
        } else if (note.isEx) {
          // EX-TAP
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
            case JudgeStatus.Perfect:
            case JudgeStatus.Great:
            case JudgeStatus.Good:
              // @ts-ignore
              NoteSound.ex.cloneNode().play();
              break;
            case JudgeStatus.Miss:
              break;
          }
        } else {
          //NORMAL TAP
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
              // @ts-ignore
              NoteSound.perfect.cloneNode().play();
              break;
            case JudgeStatus.Perfect:
              // @ts-ignore
              NoteSound.perfect.cloneNode().play();
              break;
            case JudgeStatus.Great:
              // @ts-ignore
              NoteSound.great.cloneNode().play();
              break;
            case JudgeStatus.Good:
              // @ts-ignore
              NoteSound.good.cloneNode().play();
              break;
            case JudgeStatus.Miss:
              break;
          }
        }
      } else {
        if (note.isBreak && note.isEx) {
          // EX BREAK
          switch (props.judgeTime) {
            case JudgeTimeStatus.Fast:
              gameRecord.fast++;
              gameRecord.break.fast++;
              break;
            case JudgeTimeStatus.Late:
              gameRecord.late++;
              gameRecord.break.late++;
              break;
          }
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
            case JudgeStatus.Perfect:
            case JudgeStatus.Great:
            case JudgeStatus.Good:
              gameRecord.break.criticalPerfect++;
              gameRecord.criticalPerfect++;
              gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 1;
              gameRecord.dx_point += dx_score[0];
              break;
            case JudgeStatus.Miss:
              gameRecord.break.miss++;
              gameRecord.miss++;
              break;
          }
        } else if (note.isBreak) {
          // TAP BREAK
          switch (props.judgeTime) {
            case JudgeTimeStatus.Fast:
              gameRecord.fast++;
              gameRecord.break.fast++;
              break;
            case JudgeTimeStatus.Late:
              gameRecord.late++;
              gameRecord.break.late++;
              break;
          }
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
              gameRecord.break.criticalPerfect++;
              gameRecord.criticalPerfect++;
              gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 1;
              gameRecord.dx_point += dx_score[0];
              break;
            case JudgeStatus.Perfect:
              gameRecord.break.perfect++;
              gameRecord.perfect++;
              switch (props.judgeLevel) {
                case 2:
                  gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.75;
                  break;
                case 3:
                  gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.5;
                  break;
              }
              gameRecord.dx_point += dx_score[1];
              break;
            case JudgeStatus.Great:
              gameRecord.break.great++;
              gameRecord.great++;
              switch (props.judgeLevel) {
                case 4:
                  gameRecord.achieving_rate += basicEvaluation * 4 + exEvaluation * 0.4;
                  break;
                case 5:
                  gameRecord.achieving_rate += basicEvaluation * 3 + exEvaluation * 0.4;
                  break;
                case 6:
                  gameRecord.achieving_rate += basicEvaluation * 2.5 + exEvaluation * 0.4;
                  break;
              }
              gameRecord.dx_point += dx_score[2];
              break;
            case JudgeStatus.Good:
              gameRecord.break.good++;
              gameRecord.good++;
              gameRecord.achieving_rate += basicEvaluation * 2 + exEvaluation * 0.3;
              gameRecord.dx_point += dx_score[3];
              break;
            case JudgeStatus.Miss:
              gameRecord.break.miss++;
              gameRecord.miss++;
              break;
          }
        } else if (note.isEx) {
          // EX-TAP
          switch (props.judgeTime) {
            case JudgeTimeStatus.Fast:
              gameRecord.fast++;
              gameRecord.hold.fast++;
              break;
            case JudgeTimeStatus.Late:
              gameRecord.late++;
              gameRecord.hold.late++;
              break;
          }
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
            case JudgeStatus.Perfect:
            case JudgeStatus.Great:
            case JudgeStatus.Good:
              gameRecord.hold.criticalPerfect++;
              gameRecord.criticalPerfect++;
              gameRecord.achieving_rate += basicEvaluation * 1;
              gameRecord.dx_point += dx_score[0];
              break;
            case JudgeStatus.Miss:
              gameRecord.hold.miss++;
              gameRecord.miss++;
              break;
          }
        } else {
          //NORMAL TAP
          switch (props.judgeTime) {
            case JudgeTimeStatus.Fast:
              gameRecord.fast++;
              gameRecord.hold.fast++;
              break;
            case JudgeTimeStatus.Late:
              gameRecord.late++;
              gameRecord.hold.late++;
              break;
          }
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
              gameRecord.hold.criticalPerfect++;
              gameRecord.criticalPerfect++;
              gameRecord.achieving_rate += basicEvaluation * 2;
              gameRecord.dx_point += dx_score[0];
              break;
            case JudgeStatus.Perfect:
              gameRecord.hold.perfect++;
              gameRecord.perfect++;
              gameRecord.achieving_rate += basicEvaluation * 2;
              gameRecord.dx_point += dx_score[1];
              break;
            case JudgeStatus.Great:
              gameRecord.hold.great++;
              gameRecord.great++;
              gameRecord.achieving_rate += basicEvaluation * 1.6;
              gameRecord.dx_point += dx_score[2];
              break;
            case JudgeStatus.Good:
              gameRecord.hold.good++;
              gameRecord.good++;
              gameRecord.achieving_rate += basicEvaluation * 1;
              gameRecord.dx_point += dx_score[3];
              break;
            case JudgeStatus.Miss:
              gameRecord.hold.miss++;
              gameRecord.miss++;
              break;
          }
        }
      }
      break;
    case NoteType.TouchHold:
      if (soundOnly) {
        //NORMAL TAP
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            // @ts-ignore
            NoteSound.touchhold_perfect.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            // @ts-ignore
            NoteSound.touchhold_perfect.cloneNode().play();
            break;
          case JudgeStatus.Great:
            // @ts-ignore
            NoteSound.touchhold_great.cloneNode().play();
            break;
          case JudgeStatus.Good:
            // @ts-ignore
            NoteSound.touchhold_good.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            // @ts-ignore
            NoteSound.touchhold_miss.cloneNode().play();
            break;
        }
      } else {
        //NORMAL TAP
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.hold.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.hold.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.hold.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 2;
            gameRecord.dx_point += dx_score[0];
            break;
          case JudgeStatus.Perfect:
            gameRecord.hold.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 2;
            gameRecord.dx_point += dx_score[1];
            break;
          case JudgeStatus.Great:
            gameRecord.hold.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 1.6;
            gameRecord.dx_point += dx_score[2];
            break;
          case JudgeStatus.Good:
            gameRecord.hold.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[3];
            break;
          case JudgeStatus.Miss:
            gameRecord.hold.miss++;
            gameRecord.miss++;
            break;
        }
      }
      break;

    case NoteType.SlideTrack:
      if (note.isBreak) {
        // TAP BREAK
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.break.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.break.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.break.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.break.perfect++;
            gameRecord.perfect++;
            switch (props.judgeLevel) {
              case 2:
                gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.75;
                break;
              case 3:
                gameRecord.achieving_rate += basicEvaluation * 5 + exEvaluation * 0.5;
                break;
            }
            gameRecord.dx_point += dx_score[1];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.break.great++;
            gameRecord.great++;
            switch (props.judgeLevel) {
              case 4:
                gameRecord.achieving_rate += basicEvaluation * 4 + exEvaluation * 0.4;
                break;
              case 5:
                gameRecord.achieving_rate += basicEvaluation * 3 + exEvaluation * 0.4;
                break;
              case 6:
                gameRecord.achieving_rate += basicEvaluation * 2.5 + exEvaluation * 0.4;
                break;
            }
            gameRecord.dx_point += dx_score[2];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.break.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 2 + exEvaluation * 0.3;
            gameRecord.dx_point += dx_score[3];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            break;
        }
      } else {
        //NORMAL TAP
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.slide.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.slide.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.slide.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 3;
            gameRecord.dx_point += dx_score[0];
            break;
          case JudgeStatus.Perfect:
            gameRecord.slide.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 3;
            gameRecord.dx_point += dx_score[1];
            break;
          case JudgeStatus.Great:
            gameRecord.slide.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 2.4;
            gameRecord.dx_point += dx_score[2];
            break;
          case JudgeStatus.Good:
            gameRecord.slide.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 1.5;
            gameRecord.dx_point += dx_score[3];
            break;
          case JudgeStatus.Miss:
            gameRecord.slide.miss++;
            gameRecord.miss++;
            break;
        }
      }
      break;
    case NoteType.Touch:
      if (note.isEx) {
        // EX-TOUCH
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.touch.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.touch.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
          case JudgeStatus.Perfect:
          case JudgeStatus.Great:
          case JudgeStatus.Good:
            gameRecord.touch.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            break;
          case JudgeStatus.Miss:
            gameRecord.touch.miss++;
            gameRecord.miss++;
            break;
        }
      } else {
        //NORMAL TOUCH
        switch (props.judgeTime) {
          case JudgeTimeStatus.Fast:
            gameRecord.fast++;
            gameRecord.touch.fast++;
            break;
          case JudgeTimeStatus.Late:
            gameRecord.late++;
            gameRecord.touch.late++;
            break;
        }
        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            gameRecord.touch.criticalPerfect++;
            gameRecord.criticalPerfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            break;
          case JudgeStatus.Perfect:
            gameRecord.touch.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[1];
            break;
          case JudgeStatus.Great:
            gameRecord.touch.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 0.8;
            gameRecord.dx_point += dx_score[2];
            break;
          case JudgeStatus.Good:
            gameRecord.touch.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 0.5;
            gameRecord.dx_point += dx_score[3];
            break;
          case JudgeStatus.Miss:
            gameRecord.touch.miss++;
            gameRecord.miss++;
            break;
        }
      }
      break;
    default:
      break;
  }
};
