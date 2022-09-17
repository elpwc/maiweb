import React, { useEffect, useState } from 'react';
import './index.css';
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
  judgeLineRemainTime,
} from './global';
import { Note, NoteType, ReadMaimaiData, Sheet, Song } from './maireader';

import { GameState } from '../utils/gamestate';

import { sheetdata } from './devNotes';
import { TouchArea } from '../utils/touchArea';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import { clearArcFun } from './drawUtils/_base';
import { drawNote } from './drawUtils/drawNotes';
import { Area, areas, initAreas, whichArea } from './areas';
import { drawAllKeys, drawAllTouchingAreas } from './drawUtils/drawTouchingAreas';
import { KeyState } from '../utils/keyState';
import { drawOutRing } from './drawUtils/drawOurRing';
import { initResources } from './resourceReaders/_init';
import { OutlineIcon } from './resourceReaders/outlineIconReader';

let timer1: string | number | NodeJS.Timer | undefined, timer2: string | number | NodeJS.Timeout | undefined, timer3: string | number | NodeJS.Timer | undefined;

let tapMoveSpeed: number = 1;
let tapEmergeSpeed: number = 0.2;

let speed: number = 10;

let starttime: number = 0;
let currentTime: number = 0;

let currentDifficulty = 5;

let currentTouchingArea: TouchArea[] = [];

let keyStates: KeyState[] = [];

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

  ctx.drawImage(OutlineIcon.Outline_03, center[0] - maimaiJudgeLineR * k, center[1] - maimaiJudgeLineR * k, maimaiJudgeLineR * k * 2, maimaiJudgeLineR * k * 2);

  // 判定区的线
  // areas.forEach((area: Area) => {
  //   if (area.type !== 'C') {
  //     ctx.beginPath();
  //     area.points.forEach((p: [number, number], i) => {
  //       ctx.lineTo(p[0], p[1]);
  //     });
  //     ctx.lineTo(area.points[0][0], area.points[0][1]);
  //     ctx.strokeStyle = 'red';
  //     ctx.stroke();
  //   }
  // });
};

const drawKeys = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasKeys')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawAllKeys(ctx, currentTouchingArea, keyStates);
};

const drawOver = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasOver')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  drawOutRing(ctx);
};

const starttimer = () => {
  readSheet();
  advancedTime = (currentSheet.notes[0].emergeTime ?? 0) < 0 ? -(currentSheet.notes[0].emergeTime ?? 0) : 0;
  starttime = performance.now();

  //console.log(sheet.beats5?.beat);
  timer1 = setInterval(reader_and_updater, timerPeriod);
  timer3 = setInterval(drawer, timerPeriod);
};

const finish = () => {
  clearInterval(timer1);
  clearInterval(timer3);
};

let songdata: Song;

let currentSheet: Sheet;

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

  // 高亮点击的区域
  drawAllTouchingAreas(ctx_notes, currentTouchingArea);

  // 不用foreach是为了从里往外，这样外侧的才会绘制在内侧Note之上
  for (let i = showingNotes.length - 1; i >= 0; i--) {
    const note = showingNotes[i];
    drawNote(ctx_notes, ctx_slideTrack, currentSheet.notes[note.noteIndex]!, note.isEach, note);
  }
};

const onMouseDown = (e: Event) => {
  // @ts-ignore
  const area = whichArea(e.clientX, e.clientY);
  if (area) {
    currentTouchingArea.push({
      area,
      pressTime: currentTime,
    });
  }

  console.log(currentTouchingArea);
};
const onMouseUp = (e: Event) => {
  // @ts-ignore
  const area = whichArea(e.clientX, e.clientY);
  if (area) {
    currentTouchingArea = currentTouchingArea.filter((ta) => {
      return ta.area.name !== area.name;
    });
  }
  console.log(currentTouchingArea);
};

const onTouchStart = (ev: Event) => {
  ev.preventDefault(); //阻止事件的默认行为
  const e = ev as TouchEvent;
  const touches: TouchList = e.targetTouches;

  for (let i = 0; i < touches.length; i++) {
    const area = whichArea(touches[i].clientX, touches[i].clientY);
    if (area) {
      if (
        currentTouchingArea.find((ta) => {
          return ta.area.name === area.name;
        }) === undefined
      ) {
        currentTouchingArea.push({
          area,
          pressTime: currentTime,
        });
      }
    }
  }
  console.log(currentTouchingArea);
};
const onTouchEnd = (ev: Event) => {
  ev.preventDefault(); //阻止事件的默认行为
  const e = ev as TouchEvent;
  const touches: TouchList = e.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const area = whichArea(touches[i].clientX, touches[i].clientY);
    if (area) {
      currentTouchingArea = currentTouchingArea.filter((ta) => {
        return ta.area.name !== area.name;
      });
    }
  }
  console.log(e);
};
const onTouchCancel = (ev: Event) => {
  ev.preventDefault(); //阻止事件的默认行为
  const e = ev as TouchEvent;
  const touches: TouchList = e.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const area = whichArea(touches[i].clientX, touches[i].clientY);
    if (area) {
      currentTouchingArea = currentTouchingArea.filter((ta) => {
        return ta.area.name !== area.name;
      });
    }
  }
};
const onTouchLeave = (ev: Event) => {
  ev.preventDefault(); //阻止事件的默认行为
  const e = ev as TouchEvent;
  const touches: TouchList = e.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const area = whichArea(touches[i].clientX, touches[i].clientY);
    if (area) {
      currentTouchingArea = currentTouchingArea.filter((ta) => {
        return ta.area.name !== area.name;
      });
    }
  }
};
const onTouchMove = (ev: Event) => {
  ev.preventDefault(); //阻止事件的默认行为
  const e = ev as TouchEvent;
  const touches: TouchList = e.targetTouches;

  let tempTouchingArea: TouchArea[] = [];

  for (let i = 0; i < touches.length; i++) {
    const area = whichArea(touches[i].clientX, touches[i].clientY);
    if (area) {
      if (
        tempTouchingArea.find((ta) => {
          return ta.area.name === area.name;
        }) === undefined
      ) {
        tempTouchingArea.push({
          area,
          pressTime: currentTime,
        });
      }
    }
    // 新增的
    for (let i = 0; i < tempTouchingArea.length; i++) {
      if (
        currentTouchingArea.find((ta) => {
          return ta.area.name === tempTouchingArea[i].area.name;
        }) === undefined
      ) {
        currentTouchingArea.push(tempTouchingArea[i]);
      }
    }
    // 离开的
    for (let i = 0; i < currentTouchingArea.length; i++) {
      if (
        // eslint-disable-next-line no-loop-func
        tempTouchingArea.find((ta) => {
          return ta.area.name === currentTouchingArea[i].area.name;
        }) === undefined
      ) {
        currentTouchingArea = currentTouchingArea.filter((ta, j) => {
          return j !== i;
        });
      }
    }
  }
};

//设置事件处理程序
function initEvent() {
  const el = document.getElementsByClassName('canvasEvent')[0];
  el.addEventListener('mousedown', onMouseDown, false);
  el.addEventListener('mouseup', onMouseUp, false);
  el.addEventListener('touchstart', onTouchStart, false);
  el.addEventListener('touchend', onTouchEnd, false);
  el.addEventListener('touchcancel', onTouchCancel, false);
  el.addEventListener('touchleave', onTouchLeave, false);
  el.addEventListener('touchmove', onTouchMove, false);
}

interface Props {
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}

// React18生产环境useEffect运行两次 https://juejin.cn/post/7137654077743169573
let hasinit = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
  useEffect(() => {
    if (!hasinit) {
      initResources(() => {
        initCtx();
        initAreas();
        initEvent();

        drawBackground();
        drawOver();
        timer2 = setInterval(drawKeys, timerPeriod);
      });
      hasinit = true;
    }

    return () => {};
  }, []);

  return (
    <div className="maisim">
      <div className="canvasContainer">
        <canvas className="canvasMain" height={canvasHeight} width={canvasWidth} />
        <canvas className="canvasSlideTrack" height={canvasHeight} width={canvasWidth} />
        <canvas className="canvasNotes" height={canvasHeight} width={canvasWidth} />
        <canvas className="canvasOver" height={canvasHeight} width={canvasWidth} />
        <canvas className="canvasKeys" height={canvasHeight} width={canvasWidth} />

        <canvas className="canvasEvent" height={canvasHeight} width={canvasWidth} />
      </div>
      <div style={{ position: 'absolute', zIndex: 114514 }}>
        <button
          onClick={() => {
            if (props.gameState === GameState.Standby) {
              starttimer();
              props.setGameState(GameState.Play);
            } else if (props.gameState === GameState.Play) {
              clearInterval(timer1);
              clearInterval(timer3);
              props.setGameState(GameState.Stop);
            } else if (props.gameState === GameState.Stop) {
              timer1 = setInterval(reader_and_updater, timerPeriod);
              //timer2 = setInterval(updater, timerPeriod);
              timer3 = setInterval(drawer, timerPeriod);
              props.setGameState(GameState.Play);
            } else {
            }
          }}
        >
          {props.gameState === GameState.Play ? 'stop' : 'start'}
        </button>
        <button onClick={() => {}}>read</button>
      </div>
    </div>
  );
};