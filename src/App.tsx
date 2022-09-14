import React, { useEffect, useState } from 'react';
import { finished } from 'stream';
import './App.css';
import {
  canvasWidth,
  canvasHeight,
  center,
  maimaiScreenR,
  maimaiJudgeLineR,
  maimaiR,
  timerPeriod,
  maimaiSummonLineR,
  maimaiTapR,
  touchMaxDistance,
  maimaiBR,
  maimaiER,
  trackItemWidth,
  trackItemHeight,
  trackItemGap,
} from './global';
import { Beat, Note, NoteType, ReadMaimaiData, Sheet, Song } from './maireader';
import { π } from './math';

import {
  hold,
  holdEach,
  holdEachShort,
  holdEx,
  holdExShort,
  holdHeadHeight,
  holdShort,
  judgeAreaImage,
  music,
  slideTrack,
  slideTrackEach,
  tap,
  tapBreak,
  tapDoubleSlide,
  tapDoubleSlideBreak,
  tapDoubleSlideEach,
  tapDoubleSlideEx,
  tapEach,
  tapEx,
  tapSlide,
  tapSlideBreak,
  tapSlideEach,
  tapSlideEx,
  touch,
  touchCenter,
  touchEach,
  touchEachCenter,
  touchHold1,
  touchHold2,
  touchHold3,
  touchHold4,
  touchHoldGage,
} from './resourceReader';
import { getTrackProps } from './slideTracks/tracks';
import { trackLength } from './slideTracks/_global';

const sheetdata = `
&title=sweet little sister
&wholebpm=168
&lv_5=11
&seek=5
&wait=0
&track=track.mp3
&bg=bg.png
&inote_5=(210)
{4} 3p6[4:1],4b,,1x/8x,4x/5x,2b-5[8:1]/6b,2/8-4[8:1],3-8[8:1]/8,3/5-1[8:1],2>5[8:1]/5,28,17,
{8} 3>8[8:1],,7,7<4[8:1],,1,
{4} 1b,3b/7b-4[8:1],1-5[8:1]/7,1/6-1[8:1],4-8[8:1]/6,4/7<4[8:1],17,
{8} 12,3,46,7,1V35[8:1]/8x,,5-1[8:1],,1-5[8:1],,5,,
{16} 1x/8x,,3h,4h,3h,4h,3h,4h,1xh,,6h,5h,6h,5h,6h,5h,
{4} 8xw4[8:1],8x,2x/6x,5x-3[8:1]/6x,7x-5[8:1],2x,
{8} 1x/2x,3,45,6,5-1[8:1]/7-5[8:1],,,,2-4[8:1]/4-8[8:1],,,,5x/7x,,3x/4x,,1b/8b,2x/8x,3x/8x,4x/8x,
{4} 5/7-5[8:1],4/7-1[8:1],3/7-3[8:1],2-6[8:1]/7,1/2-4[8:1],28,
{8} 5x/6x,7x,6x/8x,1x,
{4} 2/4-8[8:1],34,5-1[8:1]/7,56,2x-5[8:1]/4x,
{8} 6,7,
{4} 8,1x/7x,2-4[8:1]/4,2-8[8:1]/5,2-6[8:1]/6,2/7-3[8:1],7-5[8:1]/8,17,
{8} 2x/4x,3x,4x/5x,6x,
{4} 5xv8[8:1]/7x-5[8:1],57,2x-4[8:1]/4xv1[8:1],24,5x/7x-3[8:1],17,
{16} 1,5,2,6,3,7,4,8,
{1} 1b/5b<5[4:5],,
{4} B2/B3,B6/B7,
{8} B5,B4,
{4} E4,E3/E7,,E1,E5,
{8} Ch[1:1],,,B1,,,B8,,E1,,,,E6,B5,B4,,B2/B3,,,,E4,B4,B5,,B6/B7,,,E5,,,E3,,B1/B8,,,E5,,,
{4} E7,E1,C,E5,,4b/5b,36,
{8} 5,4,
{4} 3<6[2:1],6,,7,6,
{8} 45,,,3,3,,46,,3/5h[2:1],,,,4,5,4,,2h[4:1]/4h[4:1],,,,5,4,5,,5h[4:1]/7h[4:1],,,,4,5,4,,
{1} 2/4-8[2:1],5-1[2:1]/7,2h[4:3]/4<8[2:1],5>1[2:1]/7h[4:3],
{8} 2b/8b,,1,1h[4:1],,3,3h[4:1],,5,5h[4:1],,6,47,,35,,4/8h[4:1],,6,6h[4:1],,4,4h[4:1],,2,2h[4:1],,1,38,47,
{4} 56,4/7-4[8:1],2-5[8:1]/7,2/8-4[8:1],18,
{8} 25,25,36,36,
{32} 4,5,6,7,8,1,2,3,4-8[26.25#64:1],5-1[26.6666666667#63:1],6,7,8,1,2,3,
{4} 4xh[2:3]/5xh[2:3],,,,,,,4b/5b,2x/7x,
{16} 6x,5,6,,7x,,1,8,1x,,2,,3x/5x,,4,,6x,5,
{8} 6,7/8x,1,2/4x,3/5x,4/6x,
{16} 7,8,7x,,1,,3x,4,3,,5x,,1/8x,2x/7,
{8} 3/6x,,1/2x,3/8x,,3/4x,4/5x,5/6x,4b/7b,
{16} 6,5,6x,,4,,2x,1,
{8} 2,8x,7x,5/6x,
{16} 3,4,3x,,2x,,8,1,
{8} 8x,37,6x,2x-6[8:1]/5,2/5x,2x/5,,4/8x,5x/7,,1x/8,2/4x,3/5x,4x/6,5/7x,
{16} 1x,8x,2x,7x,3x,6x,4x,5x,2b/7b,,,,3x,4,3,,2x,,8,1,
{8} 8x,7,4x/6x,5,
{16} 3x,4,
{8} 3,1x/2,8,5/7x,4x/6,3/5x,
{16} 2,1,2x,,8,,6x,5,6,,3x,4x,3x,4x,
{4} 2x-5[8:1]/5,2/6x-1[8:1],6/8x-4[8:1],
{16} 7x/8,,6,,2b/5b,,3,4,3x,,5,,7x,8,7,,1x/2,,3,,4b/5b,,6,5,6x,,7,,1x,8,
{8} 1,3/4x,3x/4,2b/5b,,5x/6,47,,34,2x/5x,3x/6x,
{16} 4xh[8:1]/7xh[8:1],,,2xh[8:1]/5xh[8:1],,,
{8} 1x/8x,,4x/5x,4x/5x,2b/7b,,
{16} 3,4,3,,25,,6,5,7,5,6,,3,,12,,7,8,6,,57,,3,4,2,4,3,,6,,1/7<5[8:1],,2,3,7>1[8:1],,2,3,7-3[8:1],,2,3,7,,1,,1b/5b,,,,48,,48,,
{24} 7,6,5,2,3,4,
{16} 8b,,,,3x/7,,6,5,6,,45,,3-1[8:1],4,3,4,3,,8,,2x/6x,,3,4,3,,45,,6-8[8:1],5,6,5,
{8} 6,2,13,13,24,35,46,57,
{16} 1,8,1,8,2b-5[8:1]/7b-4[8:1],,,,27,,,,
{32} 1x/8x,2,3,4,5,6,7,8,
{16} 1b/5b,,,,3x/8x,,6,5,6,,47,,3,4,2,4,3,,6,,78,,2,1,3,,24,,6,5,7,5,6,,3,,2>4[8:1]/8,,7,6,2<8[8:1],,7,6,2-6[8:1],,7,6,
{8} 2,8,3x-8[8:1]/7x-4[8:1],,3x/7x,,2b/6b,,
{24} 2,3,4,7,6,5,
{16} 1b,,3,4,3,,25,,6>3[8:1],5,7,5,6,,2,,1x/8x,,6,5,6,,47,,3<6[8:1],4,2,4,3,,7,,
{24} 1xh[4:1]/2x,3,4,5,6,,,,,7x/8xh[4:1],6,5,4,3,,,,,1x,5,1,5,1,5,
{8} 1h[4:1],,,4h[4:1]/6h[4:1],,,1/8w4[8:1],,
{1} 8b>8[4:7]*<8[4:7]Cf,,,,,,,,,,E



`;
enum GameState {
  Standby,
  Play,
  Stop,
  Finish,
}

let timer1: string | number | NodeJS.Timer | undefined, timer2: string | number | NodeJS.Timeout | undefined, timer3: string | number | NodeJS.Timer | undefined;

let tapMoveSpeed: number = 1;
let tapEmergeSpeed: number = 0.2;

let speed: number = 10;

let starttime: number = 0;
let currentTime: number = 0;

let currentDifficulty = 5;

/** 提前绘制了的时间 */
let advancedTime = 0;

const drawBackground = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasMain')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiScreenR, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  const k = 1.02;
  ctx.drawImage(judgeAreaImage, center[0] - maimaiJudgeLineR * k, center[1] - maimaiJudgeLineR * k, maimaiJudgeLineR * k * 2, maimaiJudgeLineR * k * 2);
};

const drawOver = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasOver')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiR, 0, 2 * Math.PI);
  ctx.fillStyle = 'lightgray';
  ctx.fill();
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiScreenR, 0, 2 * Math.PI);
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  clearArcFun(center[0], center[1], maimaiScreenR, ctx);
};

const starttimer = () => {
  readSheet();
  advancedTime = (currentSheet.notes[0].emergeTime ?? 0) < 0 ? -(currentSheet.notes[0].emergeTime ?? 0) : 0;
  starttime = performance.now();

  //console.log(sheet.beats5?.beat);
  timer1 = setInterval(reader_and_updater, timerPeriod);
  //timer2 = setInterval(updater, timerPeriod);
  timer3 = setInterval(drawer, timerPeriod);
};

const finish = () => {
  clearInterval(timer1);
  clearInterval(timer3);
};

let songdata: Song;

let currentSheet: Sheet;

/** 在判定线停留的时间 ms */
let judgeLineRemainTime: number = 100;

/** 初始化谱面 */
const readSheet = () => {
  songdata = ReadMaimaiData(sheetdata);

  currentSheet = songdata.sheets[0];
  currentSheet.notes = calculate_emerge_move_time_of_notes(currentSheet.notes);
};

/** 为Notes计算浮现的时机 */
const calculate_emerge_move_time_of_notes = (notesOri: Note[]) => {
  const notes = notesOri;
  notes.forEach((note: Note, i: number) => {
    if (note.type === NoteType.SlideTrack) {
      const emergingTime = (maimaiJudgeLineR - maimaiSummonLineR) / ((tapMoveSpeed * speed) / timerPeriod);
      notes[i].moveTime = note.time - note.remainTime!;
      notes[i].emergeTime = note.time - note.remainTime! - note.stopTime! - emergingTime;
      notes[i].guideStarEmergeTime = note.time - note.remainTime! - note.stopTime!;
    } else {
      const emergingTime = maimaiTapR / ((tapEmergeSpeed * speed) / timerPeriod);
      const movingTime = (maimaiJudgeLineR - maimaiSummonLineR) / ((tapMoveSpeed * speed) / timerPeriod);
      notes[i].moveTime = note.time - movingTime;
      notes[i].emergeTime = note.time - movingTime - emergingTime;
    }
  });

  notes.sort((a: Note, b: Note) => {
    return a.emergeTime! - b.emergeTime!;
  });

  return notes;
};

/** 当前绘制的Note，包含各类实时变化量 */
interface ShowingNoteProps {
  /** 所在的Beat的index */
  beatIndex: number;
  /** 在所有Notes中的index */
  noteIndex: number;

  /**
   * TAP:
   * -2: stop at judge line -1: die 0: emerge 1:move
   * HOLD:
   * -2: stop at judge line -1: die 0: emerge 1: grow 2: move 3: disappear 4: fill(充满 长度暂时不改变)
   * SLIDE TRACK:
   * -2: stop at judge line -1: die 0: emerge 1: hangup 2: move
   */
  status: number;
  radius: number;
  // 位置
  rho: number;
  // 仅适用于SLIDE TRACK，GUIDE STAR半径
  guideStarRadius?: number;

  // 从生成到消亡的不间断变化量
  timer: number;

  tailRho: number;
  placeTime: number;

  isEach: boolean;
}
/** 当前绘制的所有Notes */
let showingNotes: ShowingNoteProps[] = [];

/** 下一个note标号 */
let nextNoteIndex = 0;

/**
 * TOUCH叶片闭合时的当前位置
 * @param c currentTime
 * @param m moveTime
 * @param t time
 * @returns
 */
const touchConvergeCurrentRho = (c: number, m: number, t: number) => {
  return (touchMaxDistance * c * (c - m)) / (t * (t - m));
};

/*
　いちおう此処にてちょっと解説したげるにゃ！

　このプログラムの基礎がreader・updater・drawerという３つの互いに独立的なtimerなのじゃ
　そしてこれらのtimerが現在表示するノーツの集合showingNotesに対して繰り返し操作しながら、画面を作り出すのじゃ！

　readerはsongdataから次の表示するノーツをshowingNotesに読み込んで、またnextNoteIndexを1加算するヤツなのじゃ
　あとupdaterがshowingNotesのアイテム１つ１つの状態を更新するのじゃ
　最後にdrawerがshowingNotesの値でcanvasに描くのじゃ
　簡単にゃろ！

　ここは便利のためreaderとupdaterを1つのtimerにしたんにゃ
 */
const reader_and_updater = async () => {
  currentTime = performance.now() - starttime - advancedTime;

  //updater

  showingNotes = showingNotes.map((note) => {
    const newNote = note;
    const type = currentSheet.notes[note.noteIndex].type;

    const noteIns = currentSheet.notes[note.noteIndex];

    switch (type) {
      /////////////////////////////// TAP ///////////////////////////////
      case NoteType.Tap:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (newNote.rho > maimaiScreenR + maimaiTapR) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        break;
      /////////////////////////////// HOLD ///////////////////////////////
      case NoteType.Hold:
        if (newNote.status === 0) {
          //emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // grow
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (currentTime >= noteIns.time!) {
            newNote.status = 2;
          }
          if (currentTime >= noteIns.remainTime! + noteIns.moveTime!) {
            newNote.status = 2;
          }
        } else if (newNote.status === 2) {
          // move
          if (noteIns.time! < noteIns.moveTime! + noteIns.remainTime!) {
            // HOLD长度大于maimaiJudgeLine-maimaiSummonLine
            if (currentTime >= noteIns.moveTime! + noteIns.remainTime!) {
              newNote.status = 3;
            }
          } else {
            // HOLD长度小于maimaiJudgeLine-maimaiSummonLine

            newNote.tailRho = ((currentTime - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

            newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

            if (currentTime >= noteIns.time!) {
              if (noteIns.isShortHold) {
                newNote.status = -2;
              } else {
                newNote.status = 3;
              }
            }
          }
        } else if (newNote.status === 3) {
          // die
          newNote.tailRho = ((currentTime - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (currentTime >= noteIns.time! + noteIns.remainTime!) {
            newNote.status = -1;
          }
        } else if (newNote.status === -2) {
          // stop
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      /////////////////////////////// TOUCH HOLD ///////////////////////////////
      case NoteType.TouchHold:
        if (newNote.status === 0) {
          //emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime > noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // converge
          newNote.rho = touchConvergeCurrentRho(currentTime, noteIns.moveTime!, noteIns.time!);

          if (currentTime >= noteIns.time!) {
            if (noteIns.isShortHold) {
              newNote.status = -2;
            } else {
              newNote.status = 2;
            }
          }
        } else if (newNote.status === 2) {
          // save
          newNote.tailRho = ((currentTime - noteIns.time!) / noteIns.remainTime!) * 2 * Math.PI;

          if (currentTime >= noteIns.time! + noteIns.remainTime!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          if (currentTime >= noteIns.time! + (noteIns.remainTime! ?? 0) + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      /////////////////////////////// TOUCH ///////////////////////////////
      case NoteType.Touch:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // converge
          newNote.rho = touchConvergeCurrentRho(currentTime, noteIns.moveTime!, noteIns.time!);

          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          newNote.rho = touchMaxDistance;
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      /////////////////////////////// SLIDE TRACK ///////////////////////////////
      case NoteType.SlideTrack:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = (currentTime - noteIns.emergeTime!) / (noteIns.guideStarEmergeTime! - noteIns.emergeTime!);

          if (currentTime >= noteIns.guideStarEmergeTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // hangup
          newNote.guideStarRadius = ((currentTime - noteIns.guideStarEmergeTime!) / (noteIns.moveTime! - noteIns.guideStarEmergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 2;
          }
        } else if (newNote.status === 2) {
          // move
          newNote.rho = currentTime - noteIns.moveTime!;
          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          newNote.rho = noteIns.time;
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      /////////////////////////////// SLIDE TAP ///////////////////////////////
      case NoteType.Slide:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      default:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          if (currentTime >= noteIns.time! + judgeLineRemainTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
    }

    return newNote;
  });

  // 清除die掉的note
  showingNotes = showingNotes.filter((note) => {
    return note.status !== -1;
    // const type = currentSheet.notes[note.noteIndex].type;
    // if (type === NoteType.Hold) {
    //   return note.tailRho < maimaiScreenR - maimaiSummonLineR + maimaiTapR;
    // } else {
    //   return note.rho < maimaiScreenR - maimaiSummonLineR + maimaiTapR;
    // }
  });

  // reader
  while (currentTime >= currentSheet.notes[nextNoteIndex].emergeTime!) {
    showingNotes.push({
      beatIndex: currentSheet.notes[nextNoteIndex].beatIndex,
      noteIndex: nextNoteIndex,
      status: 0,
      radius: 0,
      rho: 0,
      tailRho: 0,
      timer: 0,
      placeTime: currentTime,
      isEach: currentSheet.notes[nextNoteIndex].isEach ?? false,
    });
    nextNoteIndex++;
  }

  //console.log(nextNoteIndex, showingNotes);
};

let ctx_notes: CanvasRenderingContext2D;

let ctx_slideTrack: CanvasRenderingContext2D;

const initCtx = () => {
  ctx_notes = (document.getElementsByClassName('canvasNotes')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

  ctx_slideTrack = (document.getElementsByClassName('canvasSlideTrack')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
};

const drawer = async () => {
  ctx_notes.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx_slideTrack.clearRect(0, 0, canvasWidth, canvasHeight);

  //不用foreach是为了从里往外，这样外侧的才会绘制在内侧Note之上
  for (let i = showingNotes.length - 1; i >= 0; i--) {
    const note = showingNotes[i];
    drawNote(ctx_notes, ctx_slideTrack, currentSheet.notes[note.noteIndex]!, note.isEach, note);
  }
};

const drawNote = (ctx: CanvasRenderingContext2D, ctx_slideTrack: CanvasRenderingContext2D, note: Note, isEach: boolean = false, props: ShowingNoteProps) => {
  let θ = 0,
    x = 0,
    y = 0,
    tx = 0,
    ty = 0;

  const firstWord = note.pos.substring(0, 1);
  if (!isNaN(Number(firstWord))) {
    // 数字开头的位置
    θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
    x = center[0] + (props.rho + maimaiSummonLineR) * Math.cos(θ);
    y = center[1] + (props.rho + maimaiSummonLineR) * Math.sin(θ);
  } else {
    // 字母开头的位置（TOUCH）
    const touchPos = note.pos.substring(1, 2);
    switch (firstWord) {
      case 'C':
        x = center[0];
        y = center[1];
        break;
      case 'A':
        θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = center[0] + maimaiScreenR * Math.cos(θ);
        y = center[1] + maimaiScreenR * Math.sin(θ);
        break;
      case 'B':
        θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = center[0] + maimaiBR * Math.cos(θ);
        y = center[1] + maimaiBR * Math.sin(θ);
        break;
      case 'D':
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        //console.log('D', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
        x = center[0] + maimaiScreenR * Math.cos(θ);
        y = center[1] + maimaiScreenR * Math.sin(θ);
        break;
      case 'E':
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        //console.log('E', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
        x = center[0] + maimaiER * Math.cos(θ);
        y = center[1] + maimaiER * Math.sin(θ);
        break;
      default:
        break;
    }
  }

  if (note.type === NoteType.Hold) {
    tx = center[0] + (props.tailRho + maimaiSummonLineR) * Math.cos(θ);
    ty = center[1] + (props.tailRho + maimaiSummonLineR) * Math.sin(θ);
  }

  //console.log(props, ty )

  // // 画
  // ctx.beginPath();
  // ctx.arc(x, y, maimaiTapR, 0, 2 * Math.PI);

  let k = 0.8;

  const drawTapImage = (image: HTMLImageElement) => {
    const centerx = x,
      centery = y;
    drawRotationImage(ctx, image, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
  };

  const drawSlideTapImage = (image: HTMLImageElement, rotate: boolean = true) => {
    const centerx = x,
      centery = y;
    drawRotationImage(
      ctx,
      image,
      x - props.radius / k,
      y - props.radius / k,
      (props.radius * 2) / k,
      (props.radius * 2) / k,
      centerx,
      centery,
      -22.5 + Number(note.pos) * 45 + (rotate ? (props.timer * 50000) / note.slideTracks![0]!.remainTime! : 0)
    );
  };

  const drawHoldImage = (image: HTMLImageElement, shortHoldImage?: HTMLImageElement, isShortHold: boolean = false) => {
    //console.log(y, ty);
    const centerx = x,
      centery = y;

    if (isShortHold) {
      drawRotationImage(ctx, shortHoldImage!, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 1.1547 * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
    } else {
      if (props.status === 0) {
        drawRotationImage(
          ctx,
          shortHoldImage!,
          x - props.radius / k,
          y - (props.radius * 1.1547) / k,
          (props.radius * 2) / k,
          (props.radius * 1.1547 * 2) / k,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45
        );
      } else {
        drawRotationImage(
          ctx,
          image,
          x - props.radius / k,
          y - (props.radius * 1.1547) / k,
          (props.radius * 2) / k,
          (props.radius * 1.2) / k,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          1,
          0,
          0,
          image.width,
          holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          x - props.radius / k,
          y - props.radius / k + props.radius,
          (props.radius * 2) / k,
          props.rho - props.tailRho,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          1,
          0,
          holdHeadHeight,
          image.width,
          image.height - 2 * holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          tx - props.radius / k,
          ty - props.radius / k,
          (props.radius * 2) / k,
          (props.radius * 1.2) / k,
          tx,
          ty,
          157.5 + Number(note.pos) * 45,
          1,
          0,
          0,
          image.width,
          holdHeadHeight
        );
      }
    }
  };

  const drawTouchImage = (image: HTMLImageElement, imageCenter: HTMLImageElement) => {
    const centerx = x,
      centery = y;
    const k = 0.5,
      centerk = 0.6;
    for (let i = 0; i < 4; i++) {
      drawRotationImage(ctx, image, x - (image.width * k) / 2, y + touchMaxDistance - 6 - props.rho, image.width * k, image.height * k, x, y, 90 * i, props.radius / maimaiTapR);
    }
    drawRotationImage(ctx, imageCenter, x - (imageCenter.width * centerk) / 2, y - (imageCenter.height * centerk) / 2, imageCenter.width * centerk, imageCenter.height * centerk);
  };

  const drawTouchHoldImage = (isShortHold: boolean = false) => {
    const centerx = x,
      centery = y;

    const k = 0.5,
      centerk = 0.6;

    const touchHoldPieces = [touchHold1, touchHold2, touchHold3, touchHold4];
    if (isShortHold) {
      for (let i = 0; i < 4; i++) {
        drawRotationImage(
          ctx,
          touchHoldPieces[i],
          x - (touchHoldPieces[i].width * k) / 2,
          y + touchMaxDistance - 6 - props.rho,
          touchHoldPieces[i].width * k,
          touchHoldPieces[i].height * k,
          x,
          y,
          135 + 90 * i,
          props.radius / maimaiTapR
        );
      }
      drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);
    } else {
      if (props.status === 0 || props.status === 1) {
        for (let i = 0; i < 4; i++) {
          drawRotationImage(
            ctx,
            touchHoldPieces[i],
            x - (touchHoldPieces[i].width * k) / 2,
            y + touchMaxDistance - 6 - props.rho,
            touchHoldPieces[i].width * k,
            touchHoldPieces[i].height * k,
            x,
            y,
            135 + 90 * i,
            props.radius / maimaiTapR
          );
        }
        drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);
      } else if (props.status === 2) {
        for (let i = 0; i < 4; i++) {
          drawRotationImage(
            ctx,
            touchHoldPieces[i],
            x - (touchHoldPieces[i].width * k) / 2,
            y + touchMaxDistance - 6 - props.rho,
            touchHoldPieces[i].width * k,
            touchHoldPieces[i].height * k,
            x,
            y,
            135 + 90 * i,
            props.radius / maimaiTapR
          );
        }
        drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);

        const cutCircleR = touchHoldGage.width * centerk;
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(x, y - cutCircleR);
        ctx.lineTo(x, y);

        tx = x + cutCircleR * Math.cos(props.tailRho);
        ty = y + cutCircleR * Math.sin(props.tailRho);

        ctx.lineTo(tx, ty);

        if (props.tailRho >= 1.5 * Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x - cutCircleR, y - cutCircleR);
        }
        if (props.tailRho >= Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x - cutCircleR, y + cutCircleR);
        }
        if (props.tailRho >= 0.5 * Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x + cutCircleR, y + cutCircleR);
        }
        if (props.tailRho >= 0 && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x + cutCircleR, y - cutCircleR);
        }

        ctx.lineTo(x, y - cutCircleR);
        ctx.closePath();
        ctx.clip();

        drawRotationImage(ctx, touchHoldGage, x - (touchHoldGage.width * centerk) / 2, y - (touchHoldGage.height * centerk) / 2, touchHoldGage.width * centerk, touchHoldGage.height * centerk);
        ctx.restore();
      }
    }
  };

  const drawSlideTrackImage = (imageTrack: HTMLImageElement, imageStar: HTMLImageElement) => {
    let tempendpos = Number(note.endPos) - (Number(note.pos) - 1);
    if (tempendpos < 1) tempendpos += 8;
    const trackItemGapTime = (trackItemGap * note.remainTime!) / trackLength(note.slideType!, Number(note.pos), Number(note.endPos));

    console.log(trackLength(note.slideType!, Number(note.pos), Number(note.endPos)), trackItemGapTime);

    ctx_slideTrack.save();
    ctx_slideTrack.translate(center[0], center[1]);
    ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

    for (let i = 0; i < note.remainTime!; i += trackItemGapTime) {
      const slideData = getTrackProps(note.slideType!, Number(note.pos), Number(note.endPos), i, note.remainTime!);
      drawRotationImage(
        ctx_slideTrack,
        imageTrack,
        slideData.x - trackItemWidth / 2 - center[0],
        slideData.y - trackItemHeight / 2 - center[1],
        trackItemWidth,
        trackItemHeight,
        slideData.x - center[0],
        slideData.y - center[1],
        slideData.direction,
        props.radius
      );
    }
    ctx_slideTrack.restore();

    ctx.save();
    ctx.translate(center[0], center[1]);
    ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

    const guideStarData = getTrackProps(note.slideType!, Number(note.pos), Number(note.endPos), props.rho, note.remainTime!);
    drawRotationImage(
      ctx,
      imageStar,
      guideStarData.x - props.guideStarRadius! * 2 - center[0],
      guideStarData.y - props.guideStarRadius! * 2 - center[1],
      props.guideStarRadius! * 4,
      props.guideStarRadius! * 4,
      guideStarData.x - center[0],
      guideStarData.y - center[1],
      guideStarData.direction,
      props.guideStarRadius! / maimaiTapR
    );
    ctx.restore();
  };

  switch (note.type) {
    case NoteType.Tap:
      if (isEach) {
        if (note.isBreak) {
          drawTapImage(tapBreak);
        } else {
          drawTapImage(tapEach);
        }
      } else {
        if (note.isBreak) {
          drawTapImage(tapBreak);
        } else {
          drawTapImage(tap);
        }
      }
      if (note.isEx) {
        drawTapImage(tapEx);
      }
      break;
    case NoteType.Hold:
      if (isEach) {
        drawHoldImage(holdEach, holdEachShort, note.isShortHold);
      } else {
        drawHoldImage(hold, holdShort, note.isShortHold);
      }

      if (note.isEx) {
        drawHoldImage(holdEx, holdExShort, note.isShortHold);
      }
      break;
    case NoteType.Slide:
      // console.log(note, note.slideTracks)
      if (note.slideTracks?.length! > 1) {
        // DOUBLE TRACK
        if (isEach) {
          if (note.isBreak) {
            drawTapImage(tapDoubleSlideBreak);
          } else {
            drawTapImage(tapDoubleSlideEach);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(tapDoubleSlideBreak);
          } else {
            drawSlideTapImage(tapDoubleSlide);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(tapDoubleSlideEx);
        }
      } else {
        // SINGLE
        if (isEach) {
          if (note.isBreak) {
            drawSlideTapImage(tapSlideBreak);
          } else {
            drawSlideTapImage(tapSlideEach);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(tapSlideBreak);
          } else {
            drawSlideTapImage(tapSlide);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(tapSlideEx);
        }
      }
      break;
    case NoteType.Touch:
      if (isEach) {
        drawTouchImage(touchEach, touchEachCenter);
      } else {
        drawTouchImage(touch, touchCenter);
      }
      break;
    case NoteType.TouchHold:
      drawTouchHoldImage(note.isShortHold);
      break;
    case NoteType.SlideTrack:
      if (isEach) {
        drawSlideTrackImage(slideTrackEach, tapSlideEach);
      } else {
        drawSlideTrackImage(slideTrack, tapSlide);
      }
      break;
    case NoteType.EndMark:
      //finish();
      break;
  }
};

/**
 * 画图
 * @param ctx
 * @param image
 * @param x
 * @param y
 * @param w
 * @param h
 * @param centerX 旋转中心x
 * @param centerY 旋转中心y
 * @param r 旋转角度
 * @param alpha 透明 0-1
 * @param sx 剪切x
 * @param sy 剪切y
 * @param sw 剪切宽度
 * @param sh 剪切高度
 */
const drawRotationImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  centerX?: number,
  centerY?: number,
  r?: number,
  alpha?: number,
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number
) => {
  const TO_RADIANS = Math.PI / 180;
  if (centerX && centerY && r) {
    ctx.save(); //保存状态
    ctx.translate(centerX, centerY); //设置画布上的(0,0)位置，也就是旋转的中心点
    ctx.rotate(r * TO_RADIANS);
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, sx ?? 0, sy ?? 0, sw ?? image.width, sh ?? image.height, x - centerX, y - centerY, w, h);
    ctx.restore(); //恢复状态
  } else {
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, sx ?? 0, sy ?? 0, sw ?? image.width, sh ?? image.height, x, y, w, h);
  }
};

function clearArcFun(x: number, y: number, r: number, cxt: CanvasRenderingContext2D) {
  //(x,y)为要清除的圆的圆心，r为半径，cxt为context
  var stepClear = 1; //别忘记这一步
  clearArc(x, y, r);
  function clearArc(x: number, y: number, radius: number) {
    var calcWidth = radius - stepClear;
    var calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);
    var posX = x - calcWidth;
    var posY = y - calcHeight;

    var widthX = 2 * calcWidth;
    var heightY = 2 * calcHeight;

    if (stepClear <= radius) {
      cxt.clearRect(posX, posY, widthX, heightY);
      stepClear += 1;
      clearArc(x, y, radius);
    }
  }
}

function App() {
  const [gameState, setGameState] = useState(GameState.Standby);

  useEffect(() => {
    // 暂时用来等待图像加载，後面再解决
    setTimeout(() => {
      initCtx();

      drawBackground();
      drawOver();
    }, 500);
  }, []);

  return (
    <div className="App">
      <div className="canvasContainer">
        <canvas className="canvasMain" height="700" width="700" />
        <canvas className="canvasSlideTrack" height="700" width="700" />
        <canvas className="canvasNotes" height="700" width="700" />
        <canvas className="canvasOver" height="700" width="700" />
      </div>
      <div style={{ position: 'absolute', zIndex: 114514 }}>
        <button
          onClick={() => {
            if (gameState === GameState.Standby) {
              starttimer();
              setGameState(GameState.Play);
            } else if (gameState === GameState.Play) {
              clearInterval(timer1);
              clearInterval(timer3);
              setGameState(GameState.Stop);
            } else if (gameState === GameState.Stop) {
              timer1 = setInterval(reader_and_updater, timerPeriod);
              //timer2 = setInterval(updater, timerPeriod);
              timer3 = setInterval(drawer, timerPeriod);
              setGameState(GameState.Play);
            } else {
            }
          }}
        >
          {gameState === GameState.Play ? 'stop' : 'start'}
        </button>
        <button onClick={() => {}}>read</button>
      </div>
    </div>
  );
}

export default App;
