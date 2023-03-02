import { fireworkTrigger } from '.';
import { JudgeStatus, JudgeTimeStatus } from '../utils/judgeStatus';
import { Note } from '../utils/note';
import { NoteType } from '../utils/noteType';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import { gameRecord } from './global';
import { NoteSound } from './resourceReaders/noteSoundReader';

/**  */
const dx_score = [3, 2, 1, 0, 0];

/** 控制TOUCH HOLD的储能音效开关 */
const touchHoldSounds: { sound: HTMLAudioElement; serial: number }[] = [];

/**
 * 更新计分
 * @param note
 * @param props
 * @param basicEvaluation 基础单位分（单个TAP分）
 * @param exEvaluation 额外单位分（单个BREAK分）
 * @param oldTheoreticalScore 旧谱理论值
 * @param soundOnly 控制HOLD头发声，但不更新计分
 * @param soundControl 控制TOUCH HOLD积蓄声用
 */
export const updateRecord = (
  note: Note,
  props: ShowingNoteProps,
  basicEvaluation: number,
  exEvaluation: number,
  oldTheoreticalScore: number,
  soundOnly: boolean = false,
  soundControl: boolean = true /* true: play, false: pause */
) => {
  // combo 计算
  if (props.judgeStatus !== JudgeStatus.Miss) {
    gameRecord.combo++;
    if (gameRecord.combo >= gameRecord.max_combo) gameRecord.max_combo = gameRecord.combo;
  } else {
    if (gameRecord.combo >= gameRecord.max_combo) gameRecord.max_combo = gameRecord.combo;
    gameRecord.combo = 0;
  }

  //props.judgeStatus = JudgeStatus.CriticalPerfect as JudgeStatus;

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
            gameRecord.achieving_rate += basicEvaluation * 5;
            gameRecord.achieving_rate_ex += exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            gameRecord.old_score += 2600;
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 5;
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
            gameRecord.achieving_rate += basicEvaluation * 5;
            gameRecord.achieving_rate_ex += exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            gameRecord.old_score += 2600;
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.break.perfect++;
            gameRecord.perfect++;
            switch (props.judgeLevel) {
              case 2:
                gameRecord.achieving_rate += basicEvaluation * 5;
                gameRecord.achieving_rate_ex += exEvaluation * 0.75;
                gameRecord.old_score += 2550;
                break;
              case 3:
                gameRecord.achieving_rate += basicEvaluation * 5;
                gameRecord.achieving_rate_ex += exEvaluation * 0.5;
                gameRecord.old_score += 2500;
                break;
            }
            gameRecord.dx_point += dx_score[1];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.break.great++;
            gameRecord.great++;
            gameRecord.achieving_rate_ex += exEvaluation * 0.4;
            switch (props.judgeLevel) {
              case 4:
                gameRecord.achieving_rate += basicEvaluation * 4;
                gameRecord.achieving_rate_lost += basicEvaluation * 1;
                gameRecord.old_score += 2000;
                break;
              case 5:
                gameRecord.achieving_rate += basicEvaluation * 3;
                gameRecord.achieving_rate_lost += basicEvaluation * 2;
                gameRecord.old_score += 1500;
                break;
              case 6:
                gameRecord.achieving_rate += basicEvaluation * 2.5;
                gameRecord.achieving_rate_lost += basicEvaluation * 2.5;
                gameRecord.old_score += 1250;
                break;
            }
            gameRecord.dx_point += dx_score[2];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.break.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 2;
            gameRecord.achieving_rate_ex += exEvaluation * 0.3;
            gameRecord.achieving_rate_lost += basicEvaluation * 3;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 1000;
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 5;
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
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.ex.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.tap.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 1;
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
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.perfect.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.tap.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[1];
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.perfect.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.tap.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 0.8;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.2;
            gameRecord.dx_point += dx_score[2];
            gameRecord.old_score += 400;
            // @ts-ignore
            NoteSound.great.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.tap.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 0.5;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.5;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 250;
            // @ts-ignore
            NoteSound.good.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.tap.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 1;
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
              gameRecord.achieving_rate += basicEvaluation * 5;
              gameRecord.achieving_rate_ex += exEvaluation * 1;
              gameRecord.dx_point += dx_score[0];
              gameRecord.old_score += 2600;
              break;
            case JudgeStatus.Miss:
              gameRecord.break.miss++;
              gameRecord.miss++;
              gameRecord.achieving_rate_lost += basicEvaluation * 5;
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
              gameRecord.achieving_rate += basicEvaluation * 5;
              gameRecord.achieving_rate_ex += exEvaluation * 1;
              gameRecord.dx_point += dx_score[0];
              gameRecord.old_score += 2600;
              break;
            case JudgeStatus.Perfect:
              gameRecord.break.perfect++;
              gameRecord.perfect++;
              switch (props.judgeLevel) {
                case 2:
                  gameRecord.achieving_rate += basicEvaluation * 5;
                  gameRecord.achieving_rate_ex += exEvaluation * 0.75;
                  gameRecord.old_score += 2550;
                  break;
                case 3:
                  gameRecord.achieving_rate += basicEvaluation * 5;
                  gameRecord.achieving_rate_ex += exEvaluation * 0.5;
                  gameRecord.old_score += 2500;
                  break;
              }
              gameRecord.dx_point += dx_score[1];
              break;
            case JudgeStatus.Great:
              gameRecord.break.great++;
              gameRecord.great++;
              gameRecord.achieving_rate_ex += exEvaluation * 0.4;
              switch (props.judgeLevel) {
                case 4:
                  gameRecord.achieving_rate += basicEvaluation * 4;
                  gameRecord.achieving_rate_lost += basicEvaluation * 1;
                  gameRecord.old_score += 2000;
                  break;
                case 5:
                  gameRecord.achieving_rate += basicEvaluation * 3;
                  gameRecord.achieving_rate_lost += basicEvaluation * 2;
                  gameRecord.old_score += 1500;
                  break;
                case 6:
                  gameRecord.achieving_rate += basicEvaluation * 2.5;
                  gameRecord.achieving_rate_lost += basicEvaluation * 2.5;
                  gameRecord.old_score += 1250;
                  break;
              }
              gameRecord.dx_point += dx_score[2];
              break;
            case JudgeStatus.Good:
              gameRecord.break.good++;
              gameRecord.good++;
              gameRecord.achieving_rate += basicEvaluation * 2;
              gameRecord.achieving_rate_ex += exEvaluation * 0.3;
              gameRecord.achieving_rate_lost += basicEvaluation * 3;
              gameRecord.dx_point += dx_score[3];
              gameRecord.old_score += 1000;
              break;
            case JudgeStatus.Miss:
              gameRecord.break.miss++;
              gameRecord.miss++;
              gameRecord.achieving_rate_lost += basicEvaluation * 5;
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
              gameRecord.achieving_rate += basicEvaluation * 2;
              gameRecord.dx_point += dx_score[0];
              gameRecord.old_score += 1000;
              break;
            case JudgeStatus.Miss:
              gameRecord.hold.miss++;
              gameRecord.miss++;
              gameRecord.achieving_rate_lost += basicEvaluation * 2;
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
              gameRecord.old_score += 1000;
              break;
            case JudgeStatus.Perfect:
              gameRecord.hold.perfect++;
              gameRecord.perfect++;
              gameRecord.achieving_rate += basicEvaluation * 2;
              gameRecord.dx_point += dx_score[1];
              gameRecord.old_score += 1000;
              break;
            case JudgeStatus.Great:
              gameRecord.hold.great++;
              gameRecord.great++;
              gameRecord.achieving_rate += basicEvaluation * 1.6;
              gameRecord.achieving_rate_lost += basicEvaluation * 0.4;
              gameRecord.dx_point += dx_score[2];
              gameRecord.old_score += 800;
              break;
            case JudgeStatus.Good:
              gameRecord.hold.good++;
              gameRecord.good++;
              gameRecord.achieving_rate += basicEvaluation * 1;
              gameRecord.achieving_rate_lost += basicEvaluation * 1;
              gameRecord.dx_point += dx_score[3];
              gameRecord.old_score += 500;
              break;
            case JudgeStatus.Miss:
              gameRecord.hold.miss++;
              gameRecord.miss++;
              gameRecord.achieving_rate_lost += basicEvaluation * 2;
              break;
          }
        }
      }
      break;
    case NoteType.TouchHold:
      if (soundOnly) {
        //NORMAL TAP
        if (!note.isShortHold) {
          const touchHoldSoundIndex = touchHoldSounds.findIndex(s => {
            return s.serial === note.serial;
          });
          console.log(touchHoldSounds, touchHoldSoundIndex);
          switch (props.judgeStatus) {
            case JudgeStatus.CriticalPerfect:
            case JudgeStatus.Perfect:
              if (touchHoldSoundIndex !== -1) {
                if (soundControl) {
                  touchHoldSounds[touchHoldSoundIndex].sound.play();
                } else {
                  touchHoldSounds[touchHoldSoundIndex].sound.pause();
                }
              } else {
                touchHoldSounds.push({ sound: NoteSound.touchhold_perfect.cloneNode() as HTMLAudioElement, serial: note.serial });
                touchHoldSounds[touchHoldSounds.length - 1].sound.play();
              }
              break;
            case JudgeStatus.Great:
              if (touchHoldSoundIndex !== -1) {
                if (soundControl) {
                  touchHoldSounds[touchHoldSoundIndex].sound.play();
                } else {
                  touchHoldSounds[touchHoldSoundIndex].sound.pause();
                }
              } else {
                touchHoldSounds.push({ sound: NoteSound.touchhold_perfect.cloneNode() as HTMLAudioElement, serial: note.serial });
                touchHoldSounds[touchHoldSounds.length - 1].sound.play();
              }
              break;
            case JudgeStatus.Good:
              if (touchHoldSoundIndex !== -1) {
                if (soundControl) {
                  touchHoldSounds[touchHoldSoundIndex].sound.play();
                } else {
                  touchHoldSounds[touchHoldSoundIndex].sound.pause();
                }
              } else {
                touchHoldSounds.push({ sound: NoteSound.touchhold_perfect.cloneNode() as HTMLAudioElement, serial: note.serial });
                touchHoldSounds[touchHoldSounds.length - 1].sound.play();
              }
              break;
          }
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
            gameRecord.old_score += 1000;
            break;
          case JudgeStatus.Perfect:
            gameRecord.hold.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 2;
            gameRecord.dx_point += dx_score[1];
            gameRecord.old_score += 1000;
            break;
          case JudgeStatus.Great:
            gameRecord.hold.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 1.6;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.4;
            gameRecord.dx_point += dx_score[2];
            gameRecord.old_score += 800;
            break;
          case JudgeStatus.Good:
            gameRecord.hold.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.achieving_rate_lost += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 500;
            break;
          case JudgeStatus.Miss:
            gameRecord.hold.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 2;
            break;
        }
        if (note.hasFirework && props.judgeStatus !== JudgeStatus.Miss) {
          fireworkTrigger(note);
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
            gameRecord.achieving_rate += basicEvaluation * 5;
            gameRecord.achieving_rate_ex += exEvaluation * 1;
            gameRecord.dx_point += dx_score[0];
            gameRecord.old_score += 2600;
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.break.perfect++;
            gameRecord.perfect++;
            switch (props.judgeLevel) {
              case 2:
                gameRecord.achieving_rate += basicEvaluation * 5;
                gameRecord.achieving_rate_ex += exEvaluation * 0.75;
                gameRecord.old_score += 2550;
                break;
              case 3:
                gameRecord.achieving_rate += basicEvaluation * 5;
                gameRecord.achieving_rate_ex += exEvaluation * 0.5;
                gameRecord.old_score += 2500;
                break;
            }
            gameRecord.dx_point += dx_score[1];
            // @ts-ignore
            NoteSound.break1.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.break.great++;
            gameRecord.great++;
            gameRecord.achieving_rate_ex += exEvaluation * 0.4;
            switch (props.judgeLevel) {
              case 4:
                gameRecord.achieving_rate += basicEvaluation * 4;
                gameRecord.achieving_rate_lost += basicEvaluation * 1;
                gameRecord.old_score += 2000;
                break;
              case 5:
                gameRecord.achieving_rate += basicEvaluation * 3;
                gameRecord.achieving_rate_lost += basicEvaluation * 2;
                gameRecord.old_score += 1500;
                break;
              case 6:
                gameRecord.achieving_rate += basicEvaluation * 2.5;
                gameRecord.achieving_rate_lost += basicEvaluation * 2.5;
                gameRecord.old_score += 1250;
                break;
            }
            gameRecord.dx_point += dx_score[2];
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.break.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 2;
            gameRecord.achieving_rate_ex += exEvaluation * 0.3;
            gameRecord.achieving_rate_lost += basicEvaluation * 3;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 1000;
            // @ts-ignore
            NoteSound.break2.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.break.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 5;
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
            gameRecord.old_score += 1500;
            break;
          case JudgeStatus.Perfect:
            gameRecord.slide.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 3;
            gameRecord.dx_point += dx_score[1];
            gameRecord.old_score += 1500;
            break;
          case JudgeStatus.Great:
            gameRecord.slide.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 2.4;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.6;
            gameRecord.dx_point += dx_score[2];
            gameRecord.old_score += 1200;
            break;
          case JudgeStatus.Good:
            gameRecord.slide.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 1.5;
            gameRecord.achieving_rate_lost += basicEvaluation * 1.5;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 750;
            break;
          case JudgeStatus.Miss:
            gameRecord.slide.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 3;
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
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.touch.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 1;
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
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            break;
          case JudgeStatus.Perfect:
            gameRecord.touch.perfect++;
            gameRecord.perfect++;
            gameRecord.achieving_rate += basicEvaluation * 1;
            gameRecord.dx_point += dx_score[1];
            gameRecord.old_score += 500;
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            break;
          case JudgeStatus.Great:
            gameRecord.touch.great++;
            gameRecord.great++;
            gameRecord.achieving_rate += basicEvaluation * 0.8;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.2;
            gameRecord.dx_point += dx_score[2];
            gameRecord.old_score += 400;
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            break;
          case JudgeStatus.Good:
            gameRecord.touch.good++;
            gameRecord.good++;
            gameRecord.achieving_rate += basicEvaluation * 0.5;
            gameRecord.achieving_rate_lost += basicEvaluation * 0.5;
            gameRecord.dx_point += dx_score[3];
            gameRecord.old_score += 250;
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            break;
          case JudgeStatus.Miss:
            gameRecord.touch.miss++;
            gameRecord.miss++;
            gameRecord.achieving_rate_lost += basicEvaluation * 1;
            break;
        }
      }
      if (note.hasFirework && props.judgeStatus !== JudgeStatus.Miss) {
        fireworkTrigger(note);
      }
      break;
    default:
      break;
  }

  // 更新旧谱达成率
  gameRecord.old_achieving_rate = (gameRecord.old_score / oldTheoreticalScore) * 100;
};
