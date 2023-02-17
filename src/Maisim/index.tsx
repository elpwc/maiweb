import React, { useEffect, useRef, useState } from 'react';
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
  judgeLineRemainTimeTouch,
  setCanvasSize,
  judgeResultShowTime,
  judgeLineRemainTimeHold,
} from './const';
import { ReadMaimaiData } from './maiReader/maiReaderMain';

import { GameState } from '../utils/gamestate';

import { sheetdata } from './_notesInDev';
import { TouchArea } from '../utils/touchArea';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import { drawNote, updateIcons } from './drawUtils/drawNotes';
import { Area, areas, getArea, initAreas, whichArea } from './areas';
import { drawAllKeys, drawAllTouchingAreas } from './drawUtils/drawTouchingAreas';
import { KeyState } from '../utils/keyState';
import { drawOutRing } from './drawUtils/drawOutRing';
import { initResources } from './resourceReaders/_init';
import { APositions, ppqqAnglCalc, pqTrackJudgeCalc, updateVarAfterSizeChanged } from './slideTracks/_global';
import { abs, cos, sin, sqrt, π } from '../math';
import { JudgeStatus, JudgeTimeStatus } from '../utils/judgeStatus';
import { Note } from '../utils/note';
import { isNormalNoteType, NoteType } from '../utils/noteType';
import { Sheet } from '../utils/sheet';
import { Song } from '../utils/song';
import { gameRecord } from './global';
import { section, section_wifi } from './slideTracks/section';
import { judge, judge_up } from './judge';
import { updateRecord } from './recordUpdater';
import { NoteSound } from './resourceReaders/noteSoundReader';
import testsong_taiyoukei from './resource/sound/track/太陽系デスコ.mp3';
import testbgi from './resource/maimai_img/ui/UI_Chara_105810.png';
import { RegularStyles, SlideColor, TapStyles } from '../utils/noteStyles';
import { uiIcon } from './resourceReaders/uiIconReader';
import { drawAnimations, initAnimations } from './drawUtils/animation';
import { JudgeEffectAnimation_Circle, JudgeEffectAnimation_Hex_or_Star, JudgeEffectAnimation_Touch } from './drawUtils/judgeEffectAnimations';
import { calculate_speed_related_params_for_notes } from './maiReader/inoteReader';
import { VirtualTime } from './drawUtils/virtualTime';
import { fireworkAt } from './drawUtils/firework';
import { AutoType } from './utils/autoType';

const SongTrack = new Audio();
SongTrack.volume = 0.5;
SongTrack.src = testsong_taiyoukei;
SongTrack!.oncanplaythrough = e => {
  console.log(e);
  //alert('rua!');
};

/** 是否启用自动播放谱面 */
let auto = false;
/** 自动播放谱面的方式 */
let autoType: AutoType = AutoType.Directly;

/** 读入数据和更新绘制信息的Timer */
let timer1: string | number | NodeJS.Timer | undefined;
/** 未启用 */
let timer2: string | number | NodeJS.Timeout | undefined;
/** 根据绘制信息去绘制的Timer */
let timer3: string | number | NodeJS.Timer | undefined;

/** NOTE移动速度 */
let tapMoveSpeed: number = 0.85; // 0.85
/** NOTE浮现时的速度 */
let tapEmergeSpeed: number = 0.2; // 0.2

/** 谱面流速 */
let speed: number = 0.65;

let virtualTime: VirtualTime = new VirtualTime();
initAnimations(virtualTime);

/** 谱面已经经过的时间 */
let currentTime: number = 0;

let currentDifficulty = 5;

/** 当前被按下的所有判定区 */
let currentTouchingArea: TouchArea[] = [];

/** 所有外键的状态 */
let keyStates: KeyState[] = [];

/** 根据谱面流速，应该提前开始绘制的时间 */
let advancedTime = 0;

/** 触发一个烟花 */
export const fireworkTrigger = (triggerNote: Note) => {
  fireworkAt(triggerNote.pos, ctx_effect_back);
};

/** 绘制外键 */
const drawKeys = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasKeys')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawAllKeys(ctx, currentTouchingArea, keyStates);

  drawFrame(ctx, canvasWidth - 100, 30);
};

/** 绘制最上遮盖层（外键底层和周围白色） */
const drawOver = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasOver')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  drawOutRing(ctx);
};

/** 启动绘制器 */
const starttimer = () => {
  readSheet();
  showingNotes = [];
  nextNoteIndex = 0;
  advancedTime = (currentSheet.notes[0].emergeTime ?? 0) < 0 ? -(currentSheet.notes[0].emergeTime ?? 0) : 0;
  // console.log({ advancedTime })
  setTimeout(
    () => {
      SongTrack.play();
    },
    advancedTime / virtualTime.speedFactor // 苟且做法（无法动态调整 timeout 的速度）
  );

  const duration = advancedTime + SongTrack.duration * 1000;
  // console.log({ duration: duration/1000 })
  virtualTime.init(duration, advancedTime);
  virtualTime.onSeek((progress: number) => {
    // 进度条被拖动，重置音符状态
    showingNotes = [];
    nextNoteIndex = 0;
    const time = duration * progress;
    while ((currentSheet.notes[nextNoteIndex]?.emergeTime ?? Infinity) < time) {
      nextNoteIndex++;
    }
    reader_and_updater();
    drawer();
  });

  //console.log(sheet.beats5?.beat);
  timer1 = setInterval(reader_and_updater, timerPeriod);
  timer3 = setInterval(drawer, timerPeriod);
};

const changeSongTrackPlaybackrate = (rate: number) => {
  SongTrack.playbackRate = rate;
};
const seekSongTrack = (progress: number): boolean => {
  let duration = virtualTime.duration;
  let time = progress * duration;
  if (time < advancedTime) {
    return false;
  } else {
    SongTrack.currentTime = (time - advancedTime) / 1000;
    return true;
  }
};
const handleSongTrackFinish = (callback: () => void): (() => void) => {
  SongTrack.addEventListener('ended', callback);
  return () => {
    SongTrack.removeEventListener('ended', callback);
  };
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
  // 第三次谱面处理
  currentSheet.notes = calculate_speed_related_params_for_notes(currentSheet.notes, tapMoveSpeed, tapEmergeSpeed, speed, currentSheet);
};

/** 当前绘制在画布上的所有Notes */
let showingNotes: ShowingNoteProps[] = [];

/** 下一个note标号 */
let nextNoteIndex = 0;

/**
 * 计算TOUCH叶片闭合位置的函数
 * @param c currentTime
 * @param m moveTime
 * @param t time
 * @returns
 */
const touchConvergeCurrentRho = (c: number, m: number, t: number) => {
  const a = 1 - ((c - m) / (t - m)) ** 1.8;
  return touchMaxDistance * (1 - sqrt(a < 0 ? 0 : a)) /* 判断小于0是为了防止出现根-1导致叶片闭合後不被绘制 */;
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
  currentTime = virtualTime.read();

  //updater

  showingNotes = showingNotes.map(note => {
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
            newNote.radius = maimaiTapR;
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (auto) {
            if (newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
              judge(
                showingNotes,
                currentSheet,
                currentTime,
                {
                  area: getArea('K' + noteIns.pos)!,
                  pressTime: currentTime,
                },
                currentTouchingArea,
                autoType === AutoType.Directly
              );
            }
          }

          if (newNote.rho > maimaiScreenR + maimaiTapR) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= noteIns.time! + judgeResultShowTime) {
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
            newNote.radius = maimaiTapR;
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // grow
          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          // HOLD长度大于maimaiJudgeLine-maimaiSummonLine
          if (currentTime >= noteIns.time!) {
            newNote.rho = maimaiJudgeLineR - maimaiSummonLineR;
            newNote.status = 2;
          }

          // HOLD长度小于maimaiJudgeLine-maimaiSummonLine
          // 也就是刚刚全部冒出来，但头部距离判定线还很远的时刻()
          if (currentTime >= noteIns.remainTime! + noteIns.moveTime!) {
            newNote.status = 2;
          }
        } else if (newNote.status === 2) {
          // move

          if (newNote.isTouching) {
            JudgeEffectAnimation_Circle(ctx_effect_over, noteIns.pos, note.noteIndex);
          }

          if (auto) {
            if (!note.touched && newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
              judge(
                showingNotes,
                currentSheet,
                currentTime,
                {
                  area: getArea('K' + noteIns.pos)!,
                  pressTime: currentTime,
                },
                currentTouchingArea,
                autoType === AutoType.Directly
              );
              if (noteIns.isShortHold) {
                break;
              }
            }
          }

          if (noteIns.time! < noteIns.moveTime! + noteIns.remainTime!) {
            // HOLD长度大于maimaiJudgeLine-maimaiSummonLine
            newNote.rho = ((noteIns.time! - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);
            if (currentTime >= noteIns.moveTime! + noteIns.remainTime!) {
              newNote.status = 3;
            }
          } else {
            // HOLD长度小于maimaiJudgeLine-maimaiSummonLine

            newNote.tailRho = ((currentTime - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

            newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

            if (currentTime >= noteIns.time!) {
              newNote.rho = ((noteIns.time! - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

              if (auto) {
                if (!note.touched && newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
                  judge(
                    showingNotes,
                    currentSheet,
                    currentTime,
                    {
                      area: getArea('K' + noteIns.pos)!,
                      pressTime: currentTime,
                    },
                    currentTouchingArea,
                    autoType === AutoType.Directly
                  );
                  if (noteIns.isShortHold) {
                    break;
                  }
                }
              }
              if (noteIns.isShortHold) {
                newNote.status = -4;
              } else {
                newNote.status = 3;
              }
            }
          }
        } else if (newNote.status === 3) {
          // disappear

          newNote.tailRho = ((currentTime - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (newNote.isTouching) {
            JudgeEffectAnimation_Circle(ctx_effect_over, noteIns.pos, note.noteIndex);
          }

          if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeLineRemainTimeHold) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge
          if (currentTime >= (noteIns.time ?? 0) + (noteIns.remainTime ?? 0) + judgeResultShowTime) {
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

          if (auto) {
            if (currentTime >= noteIns.time!) {
              judge(
                showingNotes,
                currentSheet,
                currentTime,
                {
                  area: areas.filter(a => {
                    return a.name === noteIns.pos;
                  })[0],
                  pressTime: currentTime,
                },
                currentTouchingArea,
                autoType === AutoType.Directly
              );
            }
          }

          if (currentTime >= noteIns.time!) {
            // @ts-ignore
            NoteSound.touch.cloneNode().play();
            if (noteIns.isShortHold) {
              newNote.status = -4;
            } else {
              newNote.status = 2;
            }
          }
        } else if (newNote.status === 2) {
          // save

          newNote.tailRho = ((currentTime - noteIns.time!) / noteIns.remainTime!) * 2 * Math.PI;

          if (newNote.isTouching) {
            JudgeEffectAnimation_Circle(ctx_effect_over, noteIns.pos, note.noteIndex);
          }

          if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeLineRemainTimeHold) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= (noteIns.time ?? 0) + (noteIns.remainTime ?? 0) + judgeResultShowTime) {
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
          if (auto) {
            if (newNote.rho >= touchMaxDistance) {
              //if (currentTime >= noteIns.time! - timerPeriod * 5) {
              judge(
                showingNotes,
                currentSheet,
                currentTime,
                {
                  area: areas.filter(a => {
                    return a.name === noteIns.pos;
                  })[0],
                  pressTime: currentTime,
                },
                currentTouchingArea,
                autoType === AutoType.Directly
              );
            }
          }

          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop

          newNote.rho = touchMaxDistance;
          if (currentTime >= noteIns.time! + judgeLineRemainTimeTouch) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= noteIns.time! + judgeResultShowTime) {
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
            // @ts-ignore
            NoteSound.slide_track.cloneNode().play();
            newNote.status = 2;
          }
        } else if (newNote.status === 2) {
          // move
          newNote.rho = currentTime - noteIns.moveTime!;

          // 更新人体蜈蚣的GuideStarLineIndex
          if (noteIns.isChain && newNote.currentGuideStarLineIndex !== -1) {
            const currentGuideStarLine = noteIns.slideLines![newNote.currentGuideStarLineIndex];
            const guideStarEndTick = currentGuideStarLine.beginTime! + noteIns.moveTime! + currentGuideStarLine.remainTime!;
            if (currentTime >= guideStarEndTick) {
              newNote.currentGuideStarLineIndex++;
              if (newNote.currentGuideStarLineIndex === noteIns.slideLines?.length) {
                newNote.currentGuideStarLineIndex = -1;
              }
            }
          }

          // auto 自动画线
          if (auto) {
            if (noteIns.isChain) {
              // 人体蜈蚣
              const currentLine = noteIns.slideLines![note.currentLineIndex];
              if (currentLine.slideType === 'w') {
                // SLIDE分段信息
                const sectionInfoWifi = section_wifi(currentLine.pos!, currentLine.endPos ?? '');
                sectionInfoWifi.forEach((sectionInfo, j) => {
                  for (let i = 0; i < sectionInfo!.length; i++) {
                    const section = sectionInfo![i];
                    if (
                      currentTime - noteIns.moveTime! >= currentLine.beginTime! + section.start * currentLine.remainTime! &&
                      currentTime - noteIns.moveTime! < currentLine.beginTime! + (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * currentLine.remainTime!
                    ) {
                      note.currentSectionIndexWifi[j] = i;
                    } else if (currentTime - noteIns.moveTime! >= currentLine.beginTime! + currentLine.remainTime!) {
                      // 一条LINE画完
                      if (j === sectionInfoWifi.length - 1) {
                        note.currentLineIndex++;
                        note.currentSectionIndexWifi = [0, 0, 0];
                        note.currentSectionIndex = 0;
                        break;
                      }
                    }
                  }
                });
              } else {
                // SLIDE分段信息
                const sectionInfo = section(currentLine.slideType, currentLine.pos!, currentLine.endPos ?? '', currentLine.turnPos);
                for (let i = 0; i < sectionInfo!.length; i++) {
                  const section = sectionInfo![i];
                  if (
                    currentTime - noteIns.moveTime! >= currentLine.beginTime! + section.start * currentLine.remainTime! &&
                    currentTime - noteIns.moveTime! < currentLine.beginTime! + (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * currentLine.remainTime!
                  ) {
                    note.currentSectionIndex = i;
                  } else if (currentTime - noteIns.moveTime! >= currentLine.beginTime! + currentLine.remainTime!) {
                    // 一条LINE画完
                    note.currentLineIndex++;
                    note.currentSectionIndexWifi = [0, 0, 0];
                    note.currentSectionIndex = 0;
                    break;
                  }
                }
              }
            } else {
              // 不是人体蜈蚣
              if (noteIns.slideType === 'w') {
                // SLIDE分段信息
                const sectionInfoWifi = section_wifi(noteIns.pos, noteIns.endPos ?? '');
                sectionInfoWifi.forEach((sectionInfo, j) => {
                  for (let i = 0; i < sectionInfo!.length; i++) {
                    const section = sectionInfo![i];
                    if (
                      currentTime - noteIns.moveTime! >= section.start * noteIns.remainTime! &&
                      currentTime - noteIns.moveTime! < (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * noteIns.remainTime!
                    ) {
                      note.currentSectionIndexWifi[j] = i;
                    }
                  }
                });
              } else {
                // SLIDE分段信息
                const sectionInfo = section(noteIns.slideType, noteIns.pos, noteIns.endPos ?? '', noteIns.turnPos);
                for (let i = 0; i < sectionInfo!.length; i++) {
                  const section = sectionInfo![i];
                  if (
                    currentTime - noteIns.moveTime! >= section.start * noteIns.remainTime! &&
                    currentTime - noteIns.moveTime! < (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * noteIns.remainTime!
                  ) {
                    note.currentSectionIndex = i;
                  }
                }
              }
            }
          }

          if (currentTime >= noteIns.time!) {
            newNote.status = -2;
          }
        } else if (newNote.status === -2) {
          // stop
          newNote.rho = noteIns.time;
          if (currentTime >= noteIns.time! + judgeLineRemainTimeHold) {
            newNote.status = -3;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= noteIns.time! + judgeResultShowTime) {
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

          if (auto) {
            if (newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
              judge(
                showingNotes,
                currentSheet,
                currentTime,
                {
                  area: getArea('K' + noteIns.pos)!,
                  pressTime: currentTime,
                },
                currentTouchingArea
              );
            }
          }

          if (currentTime >= noteIns.time!) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= noteIns.time! + judgeResultShowTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
      /////////////////////////////// default ///////////////////////////////
      default:
        if (newNote.status === 0) {
          // emerge
          newNote.radius = ((currentTime - noteIns.emergeTime!) / (noteIns.time! - noteIns.emergeTime!)) * maimaiTapR;

          if (currentTime >= noteIns.moveTime!) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move

          newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

          if (currentTime >= noteIns.time!) {
            newNote.status = -4;
          }
        } else if (newNote.status === -3) {
          // judge

          if (currentTime >= noteIns.time! + judgeResultShowTime) {
            newNote.status = -1;
          }
        }
        newNote.timer++;
        break;
    }

    return newNote;
  });

  // 清除die掉的 和 按过的 note
  showingNotes = showingNotes.filter(note => {
    const noteIns = currentSheet.notes[note.noteIndex];

    // MISS的
    if (isNormalNoteType(noteIns.type)) {
      // SLIDE TRACK 划过一半但沒划完修正为GOOD
      if (noteIns.type === NoteType.SlideTrack && note.judgeStatus === JudgeStatus.Miss) {
        if (noteIns.slideType === 'w') {
          if (
            note.currentSectionIndexWifi.sort((a, b) => {
              return b - a;
            })[0] +
              1 >
            noteIns.sectionCount! / 2
          ) {
            note.judgeStatus = JudgeStatus.Good;
          }
        } else {
          if (note.currentSectionIndex + 1 > noteIns.sectionCount! / 2) {
            note.judgeStatus = JudgeStatus.Good;
          }
        }
      }
      if (auto && autoType === AutoType.Directly) {
        note.judgeStatus = JudgeStatus.CriticalPerfect;
      }
      if (note.status === -1 && !note.touched) {
        updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation);
      }
    }

    // 修正判定，并updateRecord（更新分数），return的是filt出的还没按的
    if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide || noteIns.type === NoteType.SlideTrack) {
      if (note.status === -4) {
        if (auto && autoType === AutoType.Directly) {
          note.judgeStatus = JudgeStatus.CriticalPerfect;
        }
        if (noteIns.isEx) {
          if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
        }

        // 判定特效
        if (note.judgeStatus !== JudgeStatus.Miss) {
          if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide) {
            // 特效图像
            JudgeEffectAnimation_Hex_or_Star(ctx_effect_over, noteIns.pos, noteIns.isBreak ? 'star' : 'hex');
          }
        }
        note.status = -3;
      }
      return note.status !== -1;
    } else if (noteIns.type === NoteType.Touch) {
      if (note.status === -4) {
        if (auto && autoType === AutoType.Directly) {
          note.judgeStatus = JudgeStatus.CriticalPerfect;
        }
        if (note.judgeStatus !== JudgeStatus.Miss) {
          JudgeEffectAnimation_Touch(ctx_effect_over, noteIns.pos);
        }
        note.status = -3;
      }
      return note.status !== -1;
    } else if (noteIns.type === NoteType.Hold || noteIns.type === NoteType.TouchHold) {
      if (note.status === -4) {
        if (auto && autoType === AutoType.Directly) {
          note.judgeStatus = JudgeStatus.CriticalPerfect;
        }
        if (noteIns.isEx) {
          if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
        }

        // 特效图像
        if (note.touched) {
          JudgeEffectAnimation_Hex_or_Star(ctx_effect_over, noteIns.pos, noteIns.isBreak ? 'star' : 'hex');
        }

        if (noteIns.isShortHold || (noteIns.type === NoteType.Hold && noteIns.remainTime! <= timerPeriod * 18) || (noteIns.type === NoteType.TouchHold && noteIns.remainTime! <= timerPeriod * 27)) {
          // 超短HOLD, TOUCH HOLD直接判定

          note.status = -3;
        } else {
          if (note.touched && note.holdPress) {
            note.holdingTime += currentTime - (note.touchedTime ?? 0);
          }
          /** 按下时长占总时长的比例 */
          let holdingPercent = note.holdingTime / (noteIns.remainTime! - (12 + (noteIns.type === NoteType.Hold ? 6 : 15)) * timerPeriod);

          if (note.judgeStatus === JudgeStatus.Miss) {
            //MISS修正为GOOD
            if (holdingPercent >= 0.05) {
              note.judgeStatus = JudgeStatus.Good;
            }
          } else {
            console.log(holdingPercent);
            if (holdingPercent >= 1) {
            } else if (holdingPercent >= 0.67 && holdingPercent < 1) {
              if (note.judgeStatus === JudgeStatus.CriticalPerfect) {
                note.judgeStatus = JudgeStatus.Perfect;
              }
            } else if (holdingPercent >= 0.33 && holdingPercent < 0.67) {
              if (note.judgeStatus === JudgeStatus.CriticalPerfect || note.judgeStatus === JudgeStatus.Perfect) {
                note.judgeStatus = JudgeStatus.Great;
              }
            } else {
              note.judgeStatus = JudgeStatus.Good;
            }
          }

          note.status = -3;

          // 停掉可能的TOUCH HOLD声音
          if (noteIns.type === NoteType.TouchHold) {
            updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, true, false);
          }
        }
      }
      return note.status !== -1;
    } else {
      // 之後开发可能出现的其他功能性Note, 之前这边是FIREWORK，现在没了
      return note.status !== -1;
    }
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
      judgeStatus: JudgeStatus.Miss,
      judgeTime: JudgeTimeStatus.Late,
      touched: false,
      isTouching: false,
      holdingTime: 0,
      currentSectionIndex: 0,
      currentSectionIndexWifi: [0, 0, 0],
      judgeLevel: 0,
      currentLineIndex: 0,
      currentGuideStarLineIndex: 0,
    });
    nextNoteIndex++;
  }

  //console.log(nextNoteIndex, showingNotes);
};

// CTX
let ctx_notes: CanvasRenderingContext2D;

let ctx_slideTrack: CanvasRenderingContext2D;

let ctx_effect_back: CanvasRenderingContext2D;

let ctx_effect_over: CanvasRenderingContext2D;

let ctx_game_record: CanvasRenderingContext2D;

/** 初始化CTX */
const initCtx = () => {
  ctx_notes = (document.getElementsByClassName('canvasNotes')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

  ctx_slideTrack = (document.getElementsByClassName('canvasSlideTrack')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

  ctx_effect_back = (document.getElementsByClassName('canvasEffectBack')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

  ctx_effect_over = (document.getElementsByClassName('canvasEffectOver')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

  ctx_game_record = (document.getElementsByClassName('canvasGameRecord')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
};

/** 上一帧开始的时间 */
let lastFrameBeginTime = -1;
/** 当前帧数 */
let frame = 0;

/** 绘制帧率 */
const drawFrame = (ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0) => {
  ctx.strokeStyle = 'red';
  ctx.font = '20px Arial';
  ctx.strokeText(frame.toFixed(2) + 'fps', x, y);
  ctx.strokeText(currentTime.toString(), x, y + 20);
};

/** 画一帧！ */
const drawer = async () => {
  // 计算帧率
  const currentFrameBeginTime = performance.now();
  if (lastFrameBeginTime !== -1) {
    frame = 1000 / (currentFrameBeginTime - lastFrameBeginTime);
  }
  lastFrameBeginTime = currentFrameBeginTime;

  // 清空画布
  ctx_notes.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx_slideTrack.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx_effect_over.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx_effect_back.clearRect(0, 0, canvasWidth, canvasHeight);

  // 高亮点击的区域
  drawAllTouchingAreas(ctx_notes, currentTouchingArea);

  // 不用foreach是为了从里往外，这样外侧的才会绘制在内侧Note之上
  for (let i = showingNotes.length - 1; i >= 0; i--) {
    const note = showingNotes[i];
    drawNote(
      ctx_notes,
      ctx_slideTrack,
      currentSheet.notes[note.noteIndex]!,
      note.isEach,
      note,
      true,
      ctx_effect_back,
      ctx_effect_over,
      currentTapStyle,
      currentHoldStyle,
      currentSlideStyle,
      currentSlideColor
    );
  }

  drawAnimations();

  // game record
  ctx_game_record.clearRect(0, 0, canvasWidth, canvasHeight);
  drawGameRecord(ctx_game_record);
};

/** 临时画出分数 */
const drawGameRecord = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = 'red';
  ctx.font = '20px Arial';
  ctx.strokeText(`Critical: ${gameRecord.criticalPerfect}, Perfect: ${gameRecord.perfect}, Great: ${gameRecord.great}, Good: ${gameRecord.good}, Miss: ${gameRecord.miss}`, 50, 250);
  ctx.strokeStyle = 'white';
  ctx.font = '30px Arial';
  ctx.strokeText(`COMBO ${gameRecord.combo}`, center[0] - 50, center[1] - 30);
  const record = abs(100 - gameRecord.achieving_rate_lost + gameRecord.achieving_rate_ex).toFixed(4);
  ctx.strokeText(`${record}%`, center[0] - 60, center[1]);
};

const onPressDown = (area: TouchArea) => {
  console.log(area);
  judge(showingNotes, currentSheet, currentTime, area, currentTouchingArea);

  console.log(gameRecord, showingNotes);
};

const onPressUp = (area: TouchArea) => {
  judge_up(showingNotes, currentSheet, currentTime, area);
  console.log('up', gameRecord, showingNotes);
};

interface Props {
  w: number;
  h: number;

  /** 以下两个是为了计算按下的偏移 */
  t: number;
  l: number;

  tapStyle: TapStyles;
  holdStyle: RegularStyles;
  slideStyle: RegularStyles;
  slideColor: SlideColor;

  /** 左右镜像 */
  leftRightMirror: boolean;
  /** 上下镜像 */
  upDownMirror: boolean;

  /** 显示特效 */
  showEffect: boolean;

  /** 自动 */
  autoMode: boolean;

  /** 外键 */
  showKeys: boolean;

  /** 中央显示 */
  centerText: number;

  gameState: GameState;
  setGameState: (gameState: GameState) => void;
  /** 谱 */
  sheet: string;
  onGameStart: () => void;
  onGameRecordChange: (gameRecord: object) => void;
  onGameFinish: () => void;

  /** 是否显示UI */
  showUIContent: boolean;

  /** UI */
  uiContent: JSX.Element;

  /** 屏幕/按钮点击事件 */
  onPressDown: (key: string) => void;
  onPressUp: (key: string) => void;

  /** 按钮灯光控制 */
  lightStatus: string[];
}

let currentTapStyle: TapStyles = TapStyles.Concise;
let currentHoldStyle: RegularStyles = RegularStyles.Concise;
let currentSlideStyle: RegularStyles = RegularStyles.Concise;
let currentSlideColor: SlideColor = SlideColor.Blue;

// React18+ 开发环境 useEffect 运行两次 https://juejin.cn/post/7137654077743169573
let hasinit = false;

// React Devtools 需要函数名作为显示的组件名。
// 既然将来要把 Maisim 独立成一个库，那么就需要一个有名字的函数。
export default function Maisim(props: Props): JSX.Element {
  const onMouseDown = (e: Event) => {
    // @ts-ignore
    const area = whichArea(e.offsetX, e.offsetY);
    if (area) {
      currentTouchingArea.push({
        area,
        pressTime: currentTime,
      });
      onPressDown({
        area,
        pressTime: currentTime,
      });
    }

    const testdiv = document.getElementsByClassName('uiContainer')[0];

    // @ts-ignore
    imitateClick(testdiv, e.offsetX, e.offsetY);

    function imitateClick(oElement: Element, iClientX: number, iClientY: number) {
      var oEvent;
      oEvent = document.createEvent('MouseEvents');
      oEvent.initMouseEvent('click', true, true, window, 0, 0, 0, iClientX, iClientY, false, false, false, false, 0, null);
      oElement.dispatchEvent(oEvent);
    }

    //console.log(currentTouchingArea);
  };
  const onMouseUp = (e: Event) => {
    // @ts-ignore
    const area = whichArea(e.offsetX, e.offsetY);
    if (area) {
      currentTouchingArea = currentTouchingArea.filter(ta => {
        return ta.area.name !== area.name;
      });
      onPressUp({
        area,
        pressTime: currentTime,
      });
    }
    //console.log(currentTouchingArea);
  };

  const onTouchStart = (ev: Event) => {
    ev.preventDefault(); //阻止事件的默认行为
    const e = ev as TouchEvent;
    const touches: TouchList = e.targetTouches;

    for (let i = 0; i < touches.length; i++) {
      // @ts-ignore
      const area = whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        if (
          currentTouchingArea.find(ta => {
            return ta.area.name === area.name;
          }) === undefined
        ) {
          currentTouchingArea.push({
            area,
            pressTime: currentTime,
          });
          onPressDown({
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
      // @ts-ignore
      const area = whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea = currentTouchingArea.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime,
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
      // @ts-ignore
      const area = whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea = currentTouchingArea.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime,
        });
      }
    }
  };
  const onTouchLeave = (ev: Event) => {
    ev.preventDefault(); //阻止事件的默认行为
    const e = ev as TouchEvent;
    const touches: TouchList = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      // @ts-ignore
      const area = whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea = currentTouchingArea.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime,
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
      // @ts-ignore
      const area = whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        if (
          tempTouchingArea.find(ta => {
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
          currentTouchingArea.find(ta => {
            return ta.area.name === tempTouchingArea[i].area.name;
          }) === undefined
        ) {
          currentTouchingArea.push(tempTouchingArea[i]);
          onPressDown(tempTouchingArea[i]);
        }
      }
      // 离开的
      for (let i = 0; i < currentTouchingArea.length; i++) {
        if (
          // eslint-disable-next-line no-loop-func
          tempTouchingArea.find(ta => {
            return ta.area.name === currentTouchingArea[i].area.name;
          }) === undefined
        ) {
          onPressUp(
            currentTouchingArea.find((ta, j) => {
              return j === i;
            }) as TouchArea
          );
          currentTouchingArea = currentTouchingArea.filter((ta, j) => {
            return j !== i;
          });
        }
      }
    }
  };

  // const onClick = (e: Event) => {
  // 	const area = whichArea((e as PointerEvent).x, (e as PointerEvent).y);
  // 	props.onClick(area?.name ?? '');
  // };

  const onMouseDown1 = (e: Event) => {
    const area = whichArea((e as PointerEvent).offsetX, (e as PointerEvent).offsetY);
    props.onPressDown(area?.name ?? '');
  };

  const onMouseUp1 = (e: Event) => {
    const area = whichArea((e as PointerEvent).offsetX, (e as PointerEvent).offsetY);
    props.onPressUp(area?.name ?? '');
  };

  const onTouch = () => {};

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
    //el.addEventListener('touch', ontouch, false);
    //el.addEventListener('click', onClick, false);
    el.addEventListener('mousedown', onMouseDown1, false);
    el.addEventListener('mouseup', onMouseUp1, false);
  }

  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(800);
  const [loadMsg, setloadMsg] = useState('Loading');

  useEffect(() => {
    if (!hasinit) {
      initResources(
        (type: string, amount: number, loaded: number, name: string) => {
          setloadMsg(`Loading:${type} ${loaded}/${amount} ${name}`);
        },
        () => {
          setloadMsg('');
          initCtx();
          initAreas();
          initEvent();

          drawOver();
          timer2 = setInterval(drawKeys, timerPeriod);

          // 计算用
          //ppqqAnglCalc();
          //pqTrackJudgeCalc();
        }
      );
      hasinit = true;
    }

    return () => {};
  }, []);

  const containerDivRef = useRef(null);

  useEffect(() => {
    console.log(props.w, props.h);
    setCanvasSize(props.w, props.h);
    setCanvasH(props.h);
    setCanvasW(props.w);

    setTimeout(() => {
      initAreas();
      updateVarAfterSizeChanged();
      drawOver();
    }, 50);
  }, [props.w, props.h]);

  useEffect(() => {
    currentTapStyle = props.tapStyle;
    currentHoldStyle = props.holdStyle;
    currentSlideStyle = props.slideStyle;
    currentSlideColor = props.slideColor;

    updateIcons(currentTapStyle, currentHoldStyle, currentSlideStyle, currentSlideColor);
  }, [props.tapStyle, props.holdStyle, props.slideColor, props.slideStyle]);

  const judgeLineK = 0.88;

  // 变速相关
  const [speedFactor, setSpeedFactor] = useState(1.0);
  const changeSpeedFactor = () => {
    setSpeedFactor(speedFactor == 1 ? 0.75 : speedFactor == 0.75 ? 0.5 : 1);
  };
  useEffect(() => {
    changeSongTrackPlaybackrate(speedFactor);
    virtualTime.setSpeedFactor(speedFactor);
  }, [speedFactor]);

  // 进度条相关
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef(null as any as HTMLInputElement); // 很脏……
  const sliderMax = 10000;
  useEffect(() => {
    let slider = sliderRef.current;
    let lastUpdatedValue = 0;
    let clearBinding = virtualTime.onProgress((progress: number, _: string) => {
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      let newValue = progress * sliderMax;
      slider.value = newValue as any;
      lastUpdatedValue = newValue;
    });
    let onChange = (ev: Event) => {
      let value = Number((ev.target as HTMLInputElement).value);
      let progress = value / sliderMax;
      if (props.gameState !== GameState.Begin) {
        let ok = seekSongTrack(progress);
        if (ok) {
          virtualTime.seek(progress);
        } else {
          slider.value = lastUpdatedValue as any; // 使 slider 回到原位
        }
      }
    };
    slider.addEventListener('change', onChange);
    return () => {
      slider.removeEventListener('change', onChange);
      clearBinding();
    };
  }, [props.gameState]);

  // 音乐播放完後，同步暂停状态
  useEffect(() => {
    return handleSongTrackFinish(() => {
      virtualTime.pause();
      clearInterval(timer1);
      clearInterval(timer3);
      props.setGameState(GameState.Pause);
    });
  }, []);

  return (
    <div
      className="maisim"
      style={{
        left: `${props.l}px`,
      }}
      ref={containerDivRef}
    >
      <div className="canvasContainer">
        <div className="bottomContainer" style={{ height: canvasH, width: canvasW }}>
          {/** 背景图 */}
          <img
            alt="background"
            className="bottomItem bgi"
            src={testbgi}
            style={{
              top: maimaiR - maimaiJudgeLineR / judgeLineK,
              left: maimaiR - maimaiJudgeLineR / judgeLineK,
              height: (maimaiJudgeLineR / judgeLineK) * 2,
              width: (maimaiJudgeLineR / judgeLineK) * 2,
            }}
          />
          {/** bga */}
          <video
            className="bottomItem bga"
            src=""
            style={{
              top: maimaiR - maimaiJudgeLineR / judgeLineK,
              left: maimaiR - maimaiJudgeLineR / judgeLineK,
              height: (maimaiJudgeLineR / judgeLineK) * 2,
              width: (maimaiJudgeLineR / judgeLineK) * 2,
            }}
          />
          {/** 半透明遮罩 */}
          <div className="bottomItem transperantDiv" style={{ height: canvasH, width: canvasW, opacity: 0.7 }}></div>
          {/** 判定线 */}
          <img
            alt="judgeline"
            className="bottomItem judgeLine"
            src={uiIcon.Outline_03}
            style={{
              top: maimaiR - maimaiJudgeLineR / judgeLineK,
              left: maimaiR - maimaiJudgeLineR / judgeLineK,
              height: (maimaiJudgeLineR / judgeLineK) * 2,
              width: (maimaiJudgeLineR / judgeLineK) * 2,
            }}
          />
        </div>

        <canvas className="canvasGameRecord" height={canvasH} width={canvasW} />
        <canvas className="canvasEffectBack" height={canvasH} width={canvasW} />
        <canvas className="canvasSlideTrack" height={canvasH} width={canvasW} />
        <canvas className="canvasNotes" height={canvasH} width={canvasW} />
        <canvas className="canvasEffectOver" height={canvasH} width={canvasW} />

        <div
          className="uiContainer"
          style={{
            top: maimaiR - maimaiJudgeLineR / judgeLineK,
            left: maimaiR - maimaiJudgeLineR / judgeLineK,
            height: (maimaiJudgeLineR / judgeLineK) * 2,
            width: (maimaiJudgeLineR / judgeLineK) * 2,
          }}
        >
          {props.showUIContent ? <>{props.uiContent}</> : <></>}
        </div>

        <canvas className="canvasOver" height={canvasH} width={canvasW} />
        <canvas className="canvasKeys" height={canvasH} width={canvasW} />

        <canvas className="canvasEvent" height={canvasH} width={canvasW} />
        {loadMsg !== '' ? (
          <p className="maisimLoadMsg" style={{ height: canvasH, width: canvasW }}>
            {loadMsg}
          </p>
        ) : (
          <></>
        )}
      </div>
      <div style={{ position: 'relative', zIndex: 114514 }}>
        <div>
          <button
            onClick={() => {
              //testmusic.play();
              if (props.gameState === GameState.Begin) {
                starttimer();
                props.setGameState(GameState.Play);
              } else if (props.gameState === GameState.Play) {
                virtualTime.pause();
                clearInterval(timer1);
                clearInterval(timer3);
                SongTrack.pause();
                props.setGameState(GameState.Pause);
              } else if (props.gameState === GameState.Pause) {
                virtualTime.resume();
                timer1 = setInterval(reader_and_updater, timerPeriod);
                timer3 = setInterval(drawer, timerPeriod);
                SongTrack.play();
                props.setGameState(GameState.Play);
              } else {
              }
            }}
          >
            {props.gameState === GameState.Play ? 'stop' : 'start'}
          </button>
          <button onClick={() => {}}>read</button>
        </div>
        <div>
          <button
            onClick={() => {
              changeSpeedFactor();
            }}
          >
            {speedFactor.toFixed(2)}×
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              setShowSlider(!showSlider);
            }}
          >
            ⇄
          </button>
        </div>
        <div className="slider" style={{ top: '100%', left: '0', padding: '10px 20px', width: `${canvasW}px`, backgroundColor: '#d3d3d3cc', display: showSlider ? 'block' : 'none' }}>
          <input type="range" min="0" max={sliderMax} style={{ width: '100%' }} ref={sliderRef} />
        </div>
      </div>
    </div>
  );
}
