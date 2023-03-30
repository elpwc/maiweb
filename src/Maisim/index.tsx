import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { TouchArea } from './utils/touchArea';
import { drawNote, updateIcons } from './drawUtils/drawNotes';
import { Area, AreaUtils } from './areas';
import { drawAllKeys, drawAllTouchingAreas } from './drawUtils/drawTouchingAreas';
import { drawOutRing } from './drawUtils/drawOutRing';
import { initResources } from './resourceReaders/_init';
import { abs, cos, sin, sqrt, π } from './utils/math';
import { judge, judge_up } from './judge';
import { TouchHoldSoundsManager, updateRecord } from './recordUpdater';
import { NoteSound } from './resourceReaders/noteSoundReader';
import { uiIcon } from './resourceReaders/uiIconReader';
import { JudgeEffectAnimation_Circle, JudgeEffectAnimation_Hex_or_Star, JudgeEffectAnimation_Touch } from './drawUtils/judgeEffectAnimations';
import { calculate_speed_related_params_for_notes } from './maiReader/inoteReader';
import { VirtualTime } from './drawUtils/virtualTime';
import { fireworkAt } from './drawUtils/firework';
import { AutoType } from './utils/types/autoType';
import { FlipMode } from './utils/types/flipMode';
import { GameState } from './utils/types/gamestate';
import { ScoreCalculationType, JudgeStatus, JudgeTimeStatus } from './utils/types/judgeStatus';
import { KeyState } from './utils/types/keyState';
import { SectionInfo } from './utils/note';
import { TapStyles, RegularStyles, SlideColor } from './utils/types/noteStyles';
import { NoteType, isNormalNoteType, isInnerScreenNoteType } from './utils/types/noteType';
import { ShowingNoteProps } from './utils/showingNoteProps';
import { BackgroundType } from './utils/types/backgroundType';
import { MaisimProps } from './utils/maisimProps';
import { Sheet } from './utils/sheet';
import { getSheet } from './maiReader/maiReaderMain';
import AnimationUtils from './drawUtils/animation';
import MaimaiValues from './maimaiValues';

export default function Maisim(
  //#region Maisim Props
  {
    /** 唯一标识，当有多个Maisim时，请为每个Maisim分配不同的id */
    id = '',
    w,
    h,

    tapStyle = TapStyles.Concise,
    holdStyle = RegularStyles.Concise,
    slideStyle = RegularStyles.Concise,
    slideColor = SlideColor.Blue,

    /** 镜像模式 */
    flipMode = FlipMode.None,

    /** 是否显示特效 */
    doShowEffect = true,
    /** 是否显示判定 */
    doShowJudgement = true,
    /**  */
    outerColor = '#ffffff',
    /** 自动 */
    isAuto,
    /** 自动的模式 */
    autoType = AutoType.Directly,
    /** 外键 */
    doShowKeys = true,
    /** 中央显示 */
    centerText = 0,

    /** 谱 */
    sheet,
    /** 谱面属性 */
    sheetProps = {},
    /** 曲 */
    track = undefined,
    /** 背景显示方式 */
    backgroundType = BackgroundType.Image,
    /** 背景图 */
    backgroundImage = undefined,
    /** BGA */
    backgroundAnime = undefined,
    /** 背景色 */
    backgroundColor = '#000000',

    gameState,
    setGameState = undefined,
    onPlayStart = undefined,
    onGameRecordChange = undefined,
    onPlayFinish = undefined,

    /** 是否显示UI遮盖层 */
    doShowUIContent = false,
    /** UI遮盖层 */
    uiContent = undefined,

    /** 屏幕/按钮点击事件 */
    onScreenPressDown = undefined,
    onScreenPressUp = undefined,

    /** 按钮灯光控制 */
    lightStatus = [],

    /** 是否启用键盘打歌，启用的话，内屏NOTE都会auto */
    doEnableKeyboard = true,
    /** 谱面流速TAP */
    speedTap = 7,
    /** 谱面流速TOUCH */
    speedTouch = 6.5,
    /** 计分方式 */
    scoreCalculationType = ScoreCalculationType.maimaiDX,
    /** SLIDE显示时机 -1~1*/
    slideTrackOffset = 0,
    /** 播放倍速 */
    playSpeedFactor = 1,
    /** 当前播放时刻 */
    songTrackTick = 0,
    /** 播放进度前进 */
    onTrackProcess = undefined,
    /** 调试mode */
    isInDev = false,
  }: //#endregion Maisim Props
  MaisimProps
): JSX.Element {
  //#region 喵

  //#region Global
  const animationFactory: React.MutableRefObject<AnimationUtils> = useRef(new AnimationUtils());

  const maimaiValues: React.MutableRefObject<MaimaiValues> = useRef(new MaimaiValues());

  const areaFactory: React.MutableRefObject<AreaUtils> = useRef(new AreaUtils(maimaiValues.current));

  /** 游戏记录 */
  const gameRecord = useRef({
    criticalPerfect: 0,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
    fast: 0,
    late: 0,
    /** 最大COMBO */
    max_combo: 0,
    /** 当前COMBO */
    combo: 0,
    /** 达成率 0-100 */
    achieving_rate: 0,
    /** extra达成率 (BREAK) 0-1 */
    achieving_rate_ex: 0,
    /** 已丢失达成率 */
    achieving_rate_lost: 0,
    /** DX分数 */
    dx_point: 0,
    /** 旧框计分  */
    old_score: 0,
    /** 旧框达成率  */
    old_achieving_rate: 0,
    tap: {
      criticalPerfect: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      fast: 0,
      late: 0,
    },
    hold: {
      criticalPerfect: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      fast: 0,
      late: 0,
    },
    slide: {
      criticalPerfect: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      fast: 0,
      late: 0,
    },
    touch: {
      criticalPerfect: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      fast: 0,
      late: 0,
    },
    break: {
      criticalPerfect: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      fast: 0,
      late: 0,
    },
  });

  const touchHoldSoundsManager: React.MutableRefObject<TouchHoldSoundsManager> = useRef(new TouchHoldSoundsManager());

  //#endregion Global

  const SongTrack: React.MutableRefObject<HTMLAudioElement> = useRef(new Audio());
  SongTrack.current.volume = 0.5;
  SongTrack.current.src = track ?? '';

  const BGA: React.LegacyRef<HTMLVideoElement> = useRef(null);

  /** 读入数据和更新绘制信息的Timer */
  const timer_readAndUpdate: React.MutableRefObject<string | number | NodeJS.Timer | undefined> = useRef(undefined);
  /** 画外键 */
  const timer_drawkeys: React.MutableRefObject<string | number | NodeJS.Timeout | undefined> = useRef(undefined);
  /** 根据绘制信息去绘制的Timer */
  const timer_draw: React.MutableRefObject<string | number | NodeJS.Timer | undefined> = useRef(undefined);

  /** NOTE移动速度调整量 */
  const tapMoveSpeed: number = 1; // 0.85
  /** NOTE浮现时的速度调整量 */
  const tapEmergeSpeed: number = 0.2; // 0.2

  /** 判定调整A */
  let offsetA = 0;
  /** 判定调整B */
  let offsetB = 0;

  const virtualTime: React.MutableRefObject<VirtualTime> = useRef(new VirtualTime());

  /** 谱面已经经过的时间 */
  const currentTime = useRef(0);

  /** 当前被按下的所有判定区 */
  const currentTouchingArea: React.MutableRefObject<TouchArea[]> = useRef([]);

  /** 所有外键的状态 */
  let keyStates: KeyState[] = [];

  /** 根据谱面流速，应该提前开始绘制的时间 */
  const advancedTime = useRef(0);

  /** 绘制外键 */
  const drawKeys = () => {
    const el: HTMLCanvasElement = document.getElementsByClassName('canvasKeys' + id)[0] as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);
    drawAllKeys(ctx, maimaiValues.current, areaFactory.current.keys, currentTouchingArea.current, keyStates);

    drawFrame(ctx, maimaiValues.current.canvasWidth - 100, 30);
  };

  /** 绘制最上遮盖层（外键底层和周围白色） */
  const drawOver = () => {
    const el: HTMLCanvasElement = document.getElementsByClassName('canvasOver' + id)[0] as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

    drawOutRing(maimaiValues.current, doShowKeys, outerColor, areaFactory.current.keys, ctx);
  };

  /** 启动绘制器 */
  const starttimer = () => {
    readSheet();
    if (currentSheet.current) {
      showingNotes.current = [];
      nextNoteIndex.current = 0;
      advancedTime.current = (currentSheet.current.notes[0].emergeTime ?? 0) < 0 ? -(currentSheet.current.notes[0].emergeTime ?? 0) : 0;
      // console.log({ advancedTime.current })
      setTimeout(
        () => {
          SongTrack.current.play();
          BGA.current!.play();
        },
        advancedTime.current / virtualTime.current.speedFactor // 苟且做法（无法动态调整 timeout 的速度）
      );

      const duration = advancedTime.current + SongTrack.current.duration * 1000;
      // console.log({ duration: duration/1000 })

      //console.log(currentSheet.beats5?.beat);
      setTimeout(() => {
        virtualTime.current.init(duration, advancedTime.current);
        virtualTime.current.onSeek((progress: number) => {
          if (currentSheet.current) {
            // 进度条被拖动，重置音符状态
            showingNotes.current = [];
            nextNoteIndex.current = 0;
            const time = duration * progress;
            while ((currentSheet.current.notes[nextNoteIndex.current]?.emergeTime ?? Infinity) < time) {
              nextNoteIndex.current++;
            }
            reader_and_updater();
            drawer();
          }
        });

        timer_readAndUpdate.current = setInterval(reader_and_updater, maimaiValues.current.timerPeriod);
        timer_draw.current = setInterval(drawer, maimaiValues.current.timerPeriod);
      }, currentSheet.current.first ?? 0 * 1000);
    }
  };

  const changeSongTrackPlaybackrate = (rate: number) => {
    SongTrack.current.playbackRate = rate;
  };
  const seekSongTrack = (progress: number): boolean => {
    let duration = virtualTime.current.duration;
    let time = progress * duration;
    if (time < advancedTime.current) {
      return false;
    } else {
      SongTrack.current.currentTime = (time - advancedTime.current) / 1000;
      return true;
    }
  };
  const handleSongTrackFinish = (callback: () => void): (() => void) => {
    SongTrack.current.addEventListener('ended', callback);
    return () => {
      SongTrack.current.removeEventListener('ended', callback);
    };
  };

  const currentSheet: React.MutableRefObject<Sheet | undefined> = useRef(undefined);
  /** 初始化谱面 */
  const readSheet = () => {
    //const songdata = ReadMaimaiData(sheetdata, flipMode);

    currentSheet.current = getSheet(sheet, flipMode, sheetProps);
    // 第三次谱面处理
    currentSheet.current.notes = calculate_speed_related_params_for_notes(
      maimaiValues.current,
      currentSheet.current.notes,
      tapMoveSpeed,
      tapEmergeSpeed,
      (speedTap + 1) * 0.07,
      (speedTouch + 1) * 0.07,
      slideTrackOffset,
      currentSheet.current
    );
  };

  /** 当前绘制在画布上的所有Notes */
  const showingNotes: React.MutableRefObject<ShowingNoteProps[]> = useRef([]);

  /** 下一个note标号 */
  const nextNoteIndex = useRef(0);

  /**
   * 计算TOUCH叶片闭合位置的函数
   * @param c currentTime.current
   * @param m moveTime
   * @param t time
   * @returns
   */
  const touchConvergeCurrentRho = (c: number, m: number, t: number) => {
    const a = 1 - ((c - m) / (t - m)) ** 1.8;
    return maimaiValues.current.touchMaxDistance * (1 - sqrt(a < 0 ? 0 : a)) /* 判断小于0是为了防止出现根-1导致叶片闭合後不被绘制 */;
  };

  const initAnimation = () => {
    animationFactory.current = new AnimationUtils(virtualTime.current);
  };

  /** 终止播放，清除变量，恢复到初始状态 */
  const finish = () => {
    clearInterval(timer_readAndUpdate.current);
    clearInterval(timer_draw.current);
    SongTrack.current.pause();
    seekSongTrack(0);
    virtualTime.current = new VirtualTime();
    initAnimation();

    showingNotes.current = [];
    currentTouchingArea.current = [];
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
    currentTime.current = virtualTime.current.read();

    //updater

    showingNotes.current = showingNotes.current.map(note => {
      const newNote = note;
      const type = currentSheet.current!.notes[note.noteIndex].type;

      const noteIns = currentSheet.current!.notes[note.noteIndex];

      switch (type) {
        /////////////////////////////// TAP ///////////////////////////////
        case NoteType.Tap:
          if (newNote.status === 0) {
            // emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              newNote.radius = maimaiValues.current.maimaiTapR;
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // move
            newNote.rho = ((currentTime.current - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

            if (isAuto) {
              if (newNote.rho >= maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR) {
                judge(
                  gameRecord.current,
                  touchHoldSoundsManager.current,
                  showingNotes.current,
                  maimaiValues.current.timerPeriod,
                  currentSheet.current!,
                  currentTime.current,
                  {
                    area: areaFactory.current.getArea('K' + noteIns.pos)!,
                    pressTime: currentTime.current,
                  },
                  currentTouchingArea.current,
                  autoType === AutoType.Directly
                );
              }
            }

            if (newNote.rho > maimaiValues.current.maimaiScreenR + maimaiValues.current.maimaiTapR) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          break;
        /////////////////////////////// HOLD ///////////////////////////////
        case NoteType.Hold:
          if (newNote.status === 0) {
            //emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              newNote.radius = maimaiValues.current.maimaiTapR;
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // grow
            newNote.rho = ((currentTime.current - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

            // HOLD长度大于maimaiJudgeLine-maimaiSummonLine
            if (currentTime.current >= noteIns.time!) {
              newNote.rho = maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR;
              newNote.status = 2;
            }

            // HOLD长度小于maimaiJudgeLine-maimaiSummonLine
            // 也就是刚刚全部冒出来，但头部距离判定线还很远的时刻()
            if (currentTime.current >= noteIns.remainTime! + noteIns.moveTime!) {
              newNote.status = 2;
            }
          } else if (newNote.status === 2) {
            // move

            if (doShowEffect && newNote.isTouching) {
              JudgeEffectAnimation_Circle(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos, note.noteIndex);
            }

            if (isAuto) {
              if (!note.touched && newNote.rho >= maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR) {
                judge(
                  gameRecord.current,
                  touchHoldSoundsManager.current,
                  showingNotes.current,
                  maimaiValues.current.timerPeriod,
                  currentSheet.current!,
                  currentTime.current,
                  {
                    area: areaFactory.current.getArea('K' + noteIns.pos)!,
                    pressTime: currentTime.current,
                  },
                  currentTouchingArea.current,
                  autoType === AutoType.Directly
                );
                if (noteIns.isShortHold) {
                  break;
                }
              }
            }

            if (noteIns.time! < noteIns.moveTime! + noteIns.remainTime!) {
              // HOLD长度大于maimaiJudgeLine-maimaiSummonLine
              newNote.rho = ((noteIns.time! - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);
              if (currentTime.current >= noteIns.moveTime! + noteIns.remainTime!) {
                newNote.status = 3;
              }
            } else {
              // HOLD长度小于maimaiJudgeLine-maimaiSummonLine

              newNote.tailRho =
                ((currentTime.current - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) *
                (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

              newNote.rho = ((currentTime.current - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

              if (currentTime.current >= noteIns.time!) {
                newNote.rho = ((noteIns.time! - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

                if (isAuto) {
                  if (!note.touched && newNote.rho >= maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR) {
                    judge(
                      gameRecord.current,
                      touchHoldSoundsManager.current,
                      showingNotes.current,
                      maimaiValues.current.timerPeriod,
                      currentSheet.current!,
                      currentTime.current,
                      {
                        area: areaFactory.current.getArea('K' + noteIns.pos)!,
                        pressTime: currentTime.current,
                      },
                      currentTouchingArea.current,
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

            newNote.tailRho =
              ((currentTime.current - noteIns.moveTime! - noteIns.remainTime!) / (noteIns.time! - noteIns.moveTime!)) *
              (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

            if (doShowEffect && newNote.isTouching) {
              JudgeEffectAnimation_Circle(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos, note.noteIndex);
            }

            if (currentTime.current >= noteIns.time! + noteIns.remainTime! + maimaiValues.current.judgeLineRemainTimeHold) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge
            if (currentTime.current >= (noteIns.time ?? 0) + (noteIns.remainTime ?? 0) + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
        /////////////////////////////// TOUCH HOLD ///////////////////////////////
        case NoteType.TouchHold:
          if (newNote.status === 0) {
            //emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current > noteIns.moveTime!) {
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // converge

            newNote.rho = touchConvergeCurrentRho(currentTime.current, noteIns.moveTime!, noteIns.time!);

            if (isAuto || doEnableKeyboard) {
              if (currentTime.current >= noteIns.time!) {
                judge(
                  gameRecord.current,
                  touchHoldSoundsManager.current,
                  showingNotes.current,
                  maimaiValues.current.timerPeriod,
                  currentSheet.current!,
                  currentTime.current,
                  {
                    area: areaFactory.current.areas.filter(a => {
                      return a.name === noteIns.pos;
                    })[0],
                    pressTime: currentTime.current,
                  },
                  currentTouchingArea.current,
                  autoType === AutoType.Directly
                );
              }
            }

            if (currentTime.current >= noteIns.time!) {
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

            newNote.tailRho = ((currentTime.current - noteIns.time!) / noteIns.remainTime!) * 2 * Math.PI;

            if (doShowEffect && newNote.isTouching) {
              JudgeEffectAnimation_Circle(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos, note.noteIndex);
            }

            if (currentTime.current >= noteIns.time! + noteIns.remainTime! + maimaiValues.current.judgeLineRemainTimeHold) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= (noteIns.time ?? 0) + (noteIns.remainTime ?? 0) + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
        /////////////////////////////// TOUCH ///////////////////////////////
        case NoteType.Touch:
          if (newNote.status === 0) {
            // emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // converge

            newNote.rho = touchConvergeCurrentRho(currentTime.current, noteIns.moveTime!, noteIns.time!);
            if (isAuto || doEnableKeyboard) {
              if (newNote.rho >= maimaiValues.current.touchMaxDistance) {
                //if (currentTime.current >= noteIns.time! -  maimaiValues.current.timerPeriod * 5) {
                judge(
                  gameRecord.current,
                  touchHoldSoundsManager.current,
                  showingNotes.current,
                  maimaiValues.current.timerPeriod,
                  currentSheet.current!,
                  currentTime.current,
                  {
                    area: areaFactory.current.areas.filter(a => {
                      return a.name === noteIns.pos;
                    })[0],
                    pressTime: currentTime.current,
                  },
                  currentTouchingArea.current,
                  autoType === AutoType.Directly
                );
              }
            }

            if (currentTime.current >= noteIns.time!) {
              newNote.status = -2;
            }
          } else if (newNote.status === -2) {
            // stop

            newNote.rho = maimaiValues.current.touchMaxDistance;
            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeLineRemainTimeTouch) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
        /////////////////////////////// SLIDE TRACK ///////////////////////////////
        case NoteType.SlideTrack:
          if (newNote.status === 0) {
            // emerge
            newNote.radius = (currentTime.current - noteIns.emergeTime!) / (noteIns.guideStarEmergeTime! - noteIns.emergeTime!);

            if (currentTime.current >= noteIns.guideStarEmergeTime!) {
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // hangup
            newNote.guideStarRadius = ((currentTime.current - noteIns.guideStarEmergeTime!) / (noteIns.moveTime! - noteIns.guideStarEmergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              // @ts-ignore
              NoteSound.slide_track.cloneNode().play();
              newNote.status = 2;
            }
          } else if (newNote.status === 2) {
            // move
            newNote.rho = currentTime.current - noteIns.moveTime!;

            // 更新人体蜈蚣的GuideStarLineIndex
            if (noteIns.isChain && newNote.currentGuideStarLineIndex !== -1) {
              const currentGuideStarLine = noteIns.slideLines![newNote.currentGuideStarLineIndex];
              const guideStarEndTick = currentGuideStarLine.beginTime! + noteIns.moveTime! + currentGuideStarLine.remainTime!;
              if (currentTime.current >= guideStarEndTick) {
                newNote.currentGuideStarLineIndex++;
                if (newNote.currentGuideStarLineIndex === noteIns.slideLines?.length) {
                  newNote.currentGuideStarLineIndex = -1;
                }
              }
            }

            // auto 自动画线
            if (isAuto || doEnableKeyboard) {
              if (noteIns.isChain) {
                // 人体蜈蚣
                const currentLine = noteIns.slideLines![note.currentLineIndex];
                if (currentLine.slideType === 'w') {
                  // SLIDE分段信息
                  const sectionInfoWifi = currentLine.sections as SectionInfo[][];
                  sectionInfoWifi.forEach((sectionInfo, j) => {
                    for (let i = 0; i < sectionInfo!.length; i++) {
                      const section = sectionInfo![i];
                      if (
                        currentTime.current - noteIns.moveTime! >= currentLine.beginTime! + section.start * currentLine.remainTime! &&
                        currentTime.current - noteIns.moveTime! < currentLine.beginTime! + (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * currentLine.remainTime!
                      ) {
                        note.currentSectionIndexWifi[j] = i;
                      } else if (currentTime.current - noteIns.moveTime! >= currentLine.beginTime! + currentLine.remainTime!) {
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
                  const sectionInfo: SectionInfo[] = currentLine.sections as SectionInfo[];
                  for (let i = 0; i < sectionInfo!.length; i++) {
                    const section = sectionInfo![i];
                    if (
                      currentTime.current - noteIns.moveTime! >= currentLine.beginTime! + section.start * currentLine.remainTime! &&
                      currentTime.current - noteIns.moveTime! < currentLine.beginTime! + (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * currentLine.remainTime!
                    ) {
                      note.currentSectionIndex = i;
                    } else if (currentTime.current - noteIns.moveTime! >= currentLine.beginTime! + currentLine.remainTime!) {
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
                  const sectionInfoWifi = noteIns.sections as SectionInfo[][];
                  sectionInfoWifi.forEach((sectionInfo, j) => {
                    for (let i = 0; i < sectionInfo!.length; i++) {
                      const section = sectionInfo![i];
                      if (
                        currentTime.current - noteIns.moveTime! >= section.start * noteIns.remainTime! &&
                        currentTime.current - noteIns.moveTime! < (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * noteIns.remainTime!
                      ) {
                        note.currentSectionIndexWifi[j] = i;
                      }
                    }
                  });
                } else {
                  // SLIDE分段信息
                  const sectionInfo: SectionInfo[] = noteIns.sections as SectionInfo[];
                  for (let i = 0; i < sectionInfo!.length; i++) {
                    const section = sectionInfo![i];
                    if (
                      currentTime.current - noteIns.moveTime! >= section.start * noteIns.remainTime! &&
                      currentTime.current - noteIns.moveTime! < (i === sectionInfo!.length - 1 ? 1 : sectionInfo![i + 1].start) * noteIns.remainTime!
                    ) {
                      note.currentSectionIndex = i;
                    }
                  }
                }
              }
            }

            if (currentTime.current >= noteIns.time!) {
              newNote.status = -2;
            }
          } else if (newNote.status === -2) {
            // stop
            newNote.rho = noteIns.time;
            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeLineRemainTimeHold) {
              newNote.status = -3;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
        /////////////////////////////// SLIDE TAP ///////////////////////////////
        case NoteType.Slide:
          if (newNote.status === 0) {
            // emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.moveTime! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // move

            newNote.rho = ((currentTime.current - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

            if (isAuto) {
              if (newNote.rho >= maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR) {
                judge(
                  gameRecord.current,
                  touchHoldSoundsManager.current,
                  showingNotes.current,
                  maimaiValues.current.timerPeriod,
                  currentSheet.current!,
                  currentTime.current,
                  {
                    area: areaFactory.current.getArea('K' + noteIns.pos)!,
                    pressTime: currentTime.current,
                  },
                  currentTouchingArea.current
                );
              }
            }

            if (currentTime.current >= noteIns.time!) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
        /////////////////////////////// E ///////////////////////////////
        case NoteType.EndMark:
          if (currentTime.current >= noteIns.time) {
            //finish();
            // 应该播放结算动画
          }
          break;
        /////////////////////////////// default ///////////////////////////////
        default:
          if (newNote.status === 0) {
            // emerge
            newNote.radius = ((currentTime.current - noteIns.emergeTime!) / (noteIns.time! - noteIns.emergeTime!)) * maimaiValues.current.maimaiTapR;

            if (currentTime.current >= noteIns.moveTime!) {
              newNote.status = 1;
            }
          } else if (newNote.status === 1) {
            // move

            newNote.rho = ((currentTime.current - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiValues.current.maimaiJudgeLineR - maimaiValues.current.maimaiSummonLineR);

            if (currentTime.current >= noteIns.time!) {
              newNote.status = -4;
            }
          } else if (newNote.status === -3) {
            // judge

            if (currentTime.current >= noteIns.time! + maimaiValues.current.judgeResultShowTime) {
              newNote.status = -1;
            }
          }
          newNote.timer++;
          break;
      }

      return newNote;
    });

    // 清除die掉的 和 按过的 note
    showingNotes.current = showingNotes.current.filter(note => {
      const noteIns = currentSheet.current!.notes[note.noteIndex];

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
        if ((isAuto && autoType === AutoType.Directly) || (doEnableKeyboard && isInnerScreenNoteType(noteIns.type))) {
          note.judgeStatus = JudgeStatus.CriticalPerfect;
        }
        if (note.status === -1 && !note.touched) {
          updateRecord(gameRecord.current, noteIns, note, currentSheet.current!.basicEvaluation, currentSheet.current!.exEvaluation, currentSheet.current!.oldTheoreticalScore);
        }
      }

      // 修正判定，并updateRecord（更新分数），return的是filt出的还没按的
      if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide || noteIns.type === NoteType.SlideTrack) {
        if (note.status === -4) {
          if (isAuto && autoType === AutoType.Directly) {
            note.judgeStatus = JudgeStatus.CriticalPerfect;
          }
          if (noteIns.isEx) {
            if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
          }

          // 判定特效
          if (doShowEffect && note.judgeStatus !== JudgeStatus.Miss) {
            if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide) {
              // 特效图像
              JudgeEffectAnimation_Hex_or_Star(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos, noteIns.isBreak ? 'star' : 'hex');
            }
          }
          note.status = -3;
        }
        return note.status !== -1;
      } else if (noteIns.type === NoteType.Touch) {
        if (note.status === -4) {
          if ((isAuto && autoType === AutoType.Directly) || doEnableKeyboard) {
            note.judgeStatus = JudgeStatus.CriticalPerfect;
          }
          // 判定特效
          if (doShowEffect && note.judgeStatus !== JudgeStatus.Miss) {
            JudgeEffectAnimation_Touch(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos);
            if (noteIns.hasFirework) {
              fireworkAt(maimaiValues.current, noteIns.pos, ctx_effect_back.current, animationFactory.current);
            }
          }
          note.status = -3;
        }
        return note.status !== -1;
      } else if (noteIns.type === NoteType.Hold || noteIns.type === NoteType.TouchHold) {
        if (note.status === -4) {
          if ((isAuto && autoType === AutoType.Directly) || (doEnableKeyboard && isInnerScreenNoteType(noteIns.type))) {
            note.judgeStatus = JudgeStatus.CriticalPerfect;
          }
          if (noteIns.isEx) {
            if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
          }

          // 特效图像
          if (doShowEffect && note.touched) {
            JudgeEffectAnimation_Hex_or_Star(maimaiValues.current, animationFactory.current, ctx_effect_over.current, noteIns.pos, noteIns.isBreak ? 'star' : 'hex');
          }

          if (
            noteIns.isShortHold ||
            (noteIns.type === NoteType.Hold && noteIns.remainTime! <= maimaiValues.current.timerPeriod * 18) ||
            (noteIns.type === NoteType.TouchHold && noteIns.remainTime! <= maimaiValues.current.timerPeriod * 27)
          ) {
            // 超短HOLD, TOUCH HOLD直接判定

            note.status = -3;
          } else {
            if (note.touched && note.holdPress) {
              note.holdingTime += currentTime.current - (note.touchedTime ?? 0);
            }
            /** 按下时长占总时长的比例 */
            let holdingPercent = note.holdingTime / (noteIns.remainTime! - (12 + (noteIns.type === NoteType.Hold ? 6 : 15)) * maimaiValues.current.timerPeriod);

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

            // HOLD和TOUCH HOLD的真判定（修正後的
            updateRecord(gameRecord.current, noteIns, note, currentSheet.current!.basicEvaluation, currentSheet.current!.exEvaluation, currentSheet.current!.oldTheoreticalScore);

            note.status = -3;

            // 停掉可能的TOUCH HOLD声音
            if (noteIns.type === NoteType.TouchHold) {
              updateRecord(
                gameRecord.current,
                noteIns,
                note,
                currentSheet.current!.basicEvaluation,
                currentSheet.current!.exEvaluation,
                currentSheet.current!.oldTheoreticalScore,
                true,
                false,
                touchHoldSoundsManager.current
              );
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
    while (nextNoteIndex.current < currentSheet.current!.notes.length && currentTime.current >= currentSheet.current!.notes[nextNoteIndex.current].emergeTime!) {
      showingNotes.current.push({
        beatIndex: currentSheet.current!.notes[nextNoteIndex.current].beatIndex,
        noteIndex: nextNoteIndex.current,
        status: 0,
        radius: 0,
        rho: 0,
        tailRho: 0,
        timer: 0,
        placeTime: currentTime.current,
        isEach: currentSheet.current!.notes[nextNoteIndex.current].isEach ?? false,
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
      nextNoteIndex.current++;

      if (currentSheet.current!.notes[nextNoteIndex.current].type === NoteType.EndMark) {
        // 终止
        break;
      }
    }

    //console.log(nextNoteIndex, showingNotes.current);
  };

  // CTX
  const ctx_notes: React.MutableRefObject<CanvasRenderingContext2D> = useRef(CanvasRenderingContext2D.prototype);
  const ctx_slideTrack: React.MutableRefObject<CanvasRenderingContext2D> = useRef(CanvasRenderingContext2D.prototype);
  const ctx_effect_back: React.MutableRefObject<CanvasRenderingContext2D> = useRef(CanvasRenderingContext2D.prototype);
  const ctx_effect_over: React.MutableRefObject<CanvasRenderingContext2D> = useRef(CanvasRenderingContext2D.prototype);
  const ctx_game_record: React.MutableRefObject<CanvasRenderingContext2D> = useRef(CanvasRenderingContext2D.prototype);

  /** 初始化CTX */
  const initCtx = () => {
    ctx_notes.current = (document.getElementsByClassName('canvasNotes' + id)[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

    ctx_slideTrack.current = (document.getElementsByClassName('canvasSlideTrack' + id)[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

    ctx_effect_back.current = (document.getElementsByClassName('canvasEffectBack' + id)[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

    ctx_effect_over.current = (document.getElementsByClassName('canvasEffectOver' + id)[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

    ctx_game_record.current = (document.getElementsByClassName('canvasGameRecord' + id)[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
  };

  /** 上一帧开始的时间 */
  const lastFrameBeginTime = useRef(-1);
  /** 当前帧数 */
  const frame = useRef(0);

  /** 绘制帧率 */
  const drawFrame = (ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0) => {
    ctx.strokeStyle = 'red';
    ctx.font = '20px Arial';
    ctx.strokeText(frame.current.toFixed(2) + 'fps', x, y);
    ctx.strokeText(currentTime.current.toString(), x, y + 20);
  };

  /** 画一帧！ */
  const drawer = async () => {
    // 计算帧率
    const currentFrameBeginTime = performance.now();
    if (lastFrameBeginTime.current !== -1) {
      frame.current = 1000 / (currentFrameBeginTime - lastFrameBeginTime.current);
    }
    lastFrameBeginTime.current = currentFrameBeginTime;

    // 清空画布
    ctx_notes.current.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);
    ctx_slideTrack.current.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);
    ctx_effect_over.current.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);
    ctx_effect_back.current.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);

    // 高亮点击的区域
    drawAllTouchingAreas(ctx_notes.current, maimaiValues.current, currentTouchingArea.current);

    // 不用foreach是为了从里往外，这样外侧的才会绘制在内侧Note之上
    for (let i = showingNotes.current.length - 1; i >= 0; i--) {
      const note = showingNotes.current[i];
      drawNote(
        animationFactory.current,
        maimaiValues.current,
        ctx_notes.current,
        ctx_slideTrack.current,
        currentSheet.current!.notes[note.noteIndex]!,
        note.isEach,
        note,
        true,
        doShowJudgement,
        ctx_effect_back.current,
        ctx_effect_over.current,
        tapStyle,
        holdStyle,
        slideStyle,
        slideColor
      );
    }

    animationFactory.current.drawAnimations();

    // game record
    ctx_game_record.current.clearRect(0, 0, maimaiValues.current.canvasWidth, maimaiValues.current.canvasHeight);
    drawGameRecord(ctx_game_record.current);
  };

  /** 临时画出分数 */
  const drawGameRecord = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'red';
    ctx.font = '20px Arial';
    ctx.strokeText(
      `Critical: ${gameRecord.current.criticalPerfect}, Perfect: ${gameRecord.current.perfect}, Great: ${gameRecord.current.great}, Good: ${gameRecord.current.good}, Miss: ${gameRecord.current.miss}`,
      50,
      250
    );
    ctx.strokeStyle = 'white';
    ctx.font = '30px Arial';
    ctx.strokeText(`COMBO ${gameRecord.current.combo}`, maimaiValues.current.center[0] - 50, maimaiValues.current.center[1] - 30);
    const record = abs(100 - gameRecord.current.achieving_rate_lost + gameRecord.current.achieving_rate_ex).toFixed(4);
    const old_record = abs(gameRecord.current.old_achieving_rate).toFixed(4);
    ctx.strokeText(`${record}%`, maimaiValues.current.center[0] - 60, maimaiValues.current.center[1]);
    ctx.strokeText(`旧:${old_record}%`, maimaiValues.current.center[0] - 60, maimaiValues.current.center[1] + 50);
  };

  const onPressDown = (area: TouchArea) => {
    console.log(area);
    judge(gameRecord.current, touchHoldSoundsManager.current, showingNotes.current, maimaiValues.current.timerPeriod, currentSheet.current!, currentTime.current, area, currentTouchingArea.current);

    console.log(gameRecord.current, showingNotes.current);
  };

  const onPressUp = (area: TouchArea) => {
    judge_up(gameRecord.current, touchHoldSoundsManager.current, showingNotes.current, maimaiValues.current.timerPeriod, currentSheet.current!, currentTime.current, area);
    console.log('up', gameRecord.current, showingNotes.current);
  };

  //#endregion 喵

  //#region 事件 Event
  //#region 指针事件 MouseEvent
  const onMouseDown = (e: Event) => {
    // @ts-ignore
    const area = areaFactory.current.whichArea(e.offsetX, e.offsetY);
    if (area) {
      currentTouchingArea.current.push({
        area,
        pressTime: currentTime.current,
      });
      onPressDown({
        area,
        pressTime: currentTime.current,
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

    //console.log(currentTouchingArea.current);
  };
  const onMouseUp = (e: Event) => {
    // @ts-ignore
    const area = areaFactory.current.whichArea(e.offsetX, e.offsetY);
    if (area) {
      currentTouchingArea.current = currentTouchingArea.current.filter(ta => {
        return ta.area.name !== area.name;
      });
      onPressUp({
        area,
        pressTime: currentTime.current,
      });
    }
    //console.log(currentTouchingArea.current);
  };
  //#endregion 指针事件 MouseEvent

  //#region Touch事件 TouchEvent
  const onTouchStart = (ev: Event) => {
    ev.preventDefault(); //阻止事件的默认行为
    const e = ev as TouchEvent;
    const touches: TouchList = e.targetTouches;

    for (let i = 0; i < touches.length; i++) {
      // @ts-ignore
      const area = areaFactory.current.whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        if (
          currentTouchingArea.current.find(ta => {
            return ta.area.name === area.name;
          }) === undefined
        ) {
          currentTouchingArea.current.push({
            area,
            pressTime: currentTime.current,
          });
          onPressDown({
            area,
            pressTime: currentTime.current,
          });
        }
      }
    }
    console.log(currentTouchingArea.current);
  };
  const onTouchEnd = (ev: Event) => {
    ev.preventDefault(); //阻止事件的默认行为
    const e = ev as TouchEvent;
    const touches: TouchList = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      // @ts-ignore
      const area = areaFactory.current.whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea.current = currentTouchingArea.current.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime.current,
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
      const area = areaFactory.current.whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea.current = currentTouchingArea.current.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime.current,
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
      const area = areaFactory.current.whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        currentTouchingArea.current = currentTouchingArea.current.filter(ta => {
          return ta.area.name !== area.name;
        });
        onPressUp({
          area,
          pressTime: currentTime.current,
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
      const area = areaFactory.current.whichArea(touches[i].clientX - containerDivRef.current?.offsetLeft, touches[i].clientY - containerDivRef.current?.offsetTop);
      if (area) {
        if (
          tempTouchingArea.find(ta => {
            return ta.area.name === area.name;
          }) === undefined
        ) {
          tempTouchingArea.push({
            area,
            pressTime: currentTime.current,
          });
        }
      }
      // 新增的
      for (let i = 0; i < tempTouchingArea.length; i++) {
        if (
          currentTouchingArea.current.find(ta => {
            return ta.area.name === tempTouchingArea[i].area.name;
          }) === undefined
        ) {
          currentTouchingArea.current.push(tempTouchingArea[i]);
          onPressDown(tempTouchingArea[i]);
        }
      }
      // 离开的
      for (let i = 0; i < currentTouchingArea.current.length; i++) {
        if (
          // eslint-disable-next-line no-loop-func
          tempTouchingArea.find(ta => {
            return ta.area.name === currentTouchingArea.current[i].area.name;
          }) === undefined
        ) {
          onPressUp(
            currentTouchingArea.current.find((ta, j) => {
              return j === i;
            }) as TouchArea
          );
          currentTouchingArea.current = currentTouchingArea.current.filter((ta, j) => {
            return j !== i;
          });
        }
      }
    }
  };

  //#endregion Touch事件 TouchEvent

  //#region Keyboard事件 KeyboardEvent
  const onKeyDown = (key: string) => {
    console.log(key);
    let area;
    switch (key) {
      case 'KeyG':
        area = areaFactory.current.getArea('K1');
        break;
      case 'KeyH':
        area = areaFactory.current.getArea('K2');
        break;
      case 'KeyN':
        area = areaFactory.current.getArea('K3');
        break;
      case 'KeyB':
        area = areaFactory.current.getArea('K4');
        break;
      case 'KeyV':
        area = areaFactory.current.getArea('K5');
        break;
      case 'KeyC':
        area = areaFactory.current.getArea('K6');
        break;
      case 'KeyD':
        area = areaFactory.current.getArea('K7');
        break;
      case 'KeyF':
        area = areaFactory.current.getArea('K8');
        break;
      default:
        break;
    }
    if (area) {
      currentTouchingArea.current.push({
        area,
        pressTime: currentTime.current,
      });
      onPressDown({
        area,
        pressTime: currentTime.current,
      });
    }
  };

  const onKeyUp = (key: string) => {
    let area: Area | undefined;
    switch (key) {
      case 'KeyG':
        area = areaFactory.current.getArea('K1');
        break;
      case 'KeyH':
        area = areaFactory.current.getArea('K2');
        break;
      case 'KeyN':
        area = areaFactory.current.getArea('K3');
        break;
      case 'KeyB':
        area = areaFactory.current.getArea('K4');
        break;
      case 'KeyV':
        area = areaFactory.current.getArea('K5');
        break;
      case 'KeyC':
        area = areaFactory.current.getArea('K6');
        break;
      case 'KeyD':
        area = areaFactory.current.getArea('K7');
        break;
      case 'KeyF':
        area = areaFactory.current.getArea('K8');
        break;
      default:
        break;
    }
    if (area) {
      currentTouchingArea.current = currentTouchingArea.current.filter(ta => {
        return ta.area.name !== area!.name;
      });
      onPressUp({
        area,
        pressTime: currentTime.current,
      });
    }
  };
  //#endregion Keyboard事件 KeyboardEvent

  //设置事件处理程序
  function initEvent() {
    const el = document.getElementsByClassName('canvasEvent' + id)[0];
    el.addEventListener('mousedown', onMouseDown, false);
    el.addEventListener('mouseup', onMouseUp, false);
    el.addEventListener('touchstart', onTouchStart, false);
    el.addEventListener('touchend', onTouchEnd, false);
    el.addEventListener('touchcancel', onTouchCancel, false);
    el.addEventListener('touchleave', onTouchLeave, false);
    el.addEventListener('touchmove', onTouchMove, false);
  }

  if (doEnableKeyboard) {
    document.onkeydown = e => {
      onKeyDown(e.code);
    };
    document.onkeyup = e => {
      onKeyUp(e.code);
    };
  }

  //#endregion 事件 Event

  //#region States
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(800);
  const [loadMsg, setloadMsg] = useState('Loading');

  //#endregion States

  //#region Refs

  //#endregion Refs

  //#region useEffect
  useEffect(() => {
    initResources(
      async (type: string, amount: number, loaded: number, name: string) => {
        setloadMsg(`Loading:${type} ${loaded}/${amount} ${name}`);
      },
      async () => {
        // 首次完成加载後
        setloadMsg('');
        initCtx();
        initEvent();

        // 画外部遮罩和外键底色
        drawOver();

        if (doShowKeys) {
          timer_drawkeys.current = setInterval(drawKeys, maimaiValues.current.timerPeriod);
        }

        // 计算用
        //ppqqAnglCalc();
        //pqTrackJudgeCalc();
      }
    );

    return () => {};
  }, []);

  useEffect(() => {
    console.log(w, h);
    maimaiValues.current = new MaimaiValues(w, h, doShowKeys);
    setCanvasH(h);
    setCanvasW(w);

    setTimeout(() => {
      areaFactory.current = new AreaUtils(maimaiValues.current);
      //drawOver();
    }, 50);
  }, [w, h]);

  useEffect(() => {
    updateIcons(tapStyle, holdStyle, slideStyle, slideColor);
  }, [tapStyle, holdStyle, slideColor, slideStyle]);

  //#endregion useEffect

  const judgeLineK = 0.89;

  // 初始化动画
  useEffect(() => {
    initAnimation();
    maimaiValues.current = new MaimaiValues(w, h, doShowKeys);
  }, []);

  // 变速相关
  const [speedFactor, setSpeedFactor] = useState(1.0);
  const changeSpeedFactor = () => {
    setSpeedFactor(speedFactor === 1 ? 0.75 : speedFactor === 0.75 ? 0.5 : 1);
  };
  useEffect(() => {
    changeSongTrackPlaybackrate(speedFactor);
    virtualTime.current.setSpeedFactor(speedFactor);
  }, [speedFactor]);

  // 进度条相关
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef(null as any as HTMLInputElement); // 很脏……（确实...（）
  const sliderMax = 10000;
  useEffect(() => {
    let slider = sliderRef.current;
    let lastUpdatedValue = 0;
    let clearBinding = virtualTime.current.onProgress((progress: number, _: string) => {
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      let newValue = progress * sliderMax;
      slider.value = newValue as any;
      lastUpdatedValue = newValue;
    });
    let onChange = (ev: Event) => {
      let value = Number((ev.target as HTMLInputElement).value);
      let progress = value / sliderMax;
      if (gameState !== GameState.Begin) {
        let ok = seekSongTrack(progress);
        if (ok) {
          virtualTime.current.seek(progress);
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
  }, [gameState]);

  // 音乐播放完後，同步暂停状态
  useEffect(() => {
    return handleSongTrackFinish(() => {
      virtualTime.current.pause();
      clearInterval(timer_readAndUpdate.current);
      clearInterval(timer_draw.current);
      setGameState?.(GameState.Pause);
    });
  }, []);

  return (
    <div className="maisim" style={{}}>
      <div className="canvasContainer">
        <div className="bottomContainer" style={{ height: canvasH, width: canvasW, backgroundColor: backgroundType === BackgroundType.Color ? backgroundColor : '#000000' }}>
          {/** 背景图 */}
          {backgroundType === BackgroundType.Image ? (
            <img
              alt="background"
              className="bottomItem bgi"
              src={backgroundImage ?? ''}
              style={{
                top: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
                left: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
                height: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
                width: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
              }}
            />
          ) : (
            <></>
          )}

          {/** bga */}
          {backgroundType === BackgroundType.Video ? (
            <video
              ref={BGA}
              className="bottomItem bga"
              src={backgroundAnime ?? ''}
              autoPlay={false}
              style={{
                top: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
                left: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
                height: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
                width: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
              }}
            />
          ) : (
            <></>
          )}

          {/** 半透明遮罩 */}
          <div className="bottomItem transperantDiv" style={{ height: canvasH, width: canvasW, opacity: 0.7 }}></div>
          {/** 判定线 */}
          <img
            alt="judgeline"
            className="bottomItem judgeLine"
            src={uiIcon.Outline_03}
            style={{
              top: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
              left: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
              height: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
              width: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
            }}
          />
        </div>

        <canvas className={'canvasGameRecord canvasGameRecord' + id} height={canvasH} width={canvasW} />
        <canvas className={'canvasEffectBack canvasEffectBack' + id} height={canvasH} width={canvasW} />
        <canvas className={'canvasSlideTrack canvasSlideTrack' + id} height={canvasH} width={canvasW} />
        <canvas className={'canvasNotes canvasNotes' + id} height={canvasH} width={canvasW} />
        <canvas className={'canvasEffectOver canvasEffectOver' + id} height={canvasH} width={canvasW} />

        <div
          className="uiContainer"
          style={{
            top: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
            left: maimaiValues.current.maimaiR - maimaiValues.current.maimaiJudgeLineR / judgeLineK,
            height: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
            width: (maimaiValues.current.maimaiJudgeLineR / judgeLineK) * 2,
          }}
        >
          {doShowUIContent ? <>{uiContent}</> : <></>}
        </div>

        <canvas className={'canvasOver canvasOver' + id} height={canvasH} width={canvasW} />
        <canvas className={'canvasKeys canvasKeys' + id} height={canvasH} width={canvasW} />

        <canvas className={'canvasEvent canvasEvent' + id} height={canvasH} width={canvasW} />
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
              if (gameState === GameState.Begin) {
                starttimer();
                setGameState?.(GameState.Play);
                console.log(114);
              } else if (gameState === GameState.Play) {
                console.log(1143);
                virtualTime.current.pause();
                clearInterval(timer_readAndUpdate.current);
                clearInterval(timer_draw.current);
                SongTrack.current.pause();
                setGameState?.(GameState.Pause);
              } else if (gameState === GameState.Pause) {
                virtualTime.current.resume();
                timer_readAndUpdate.current = setInterval(reader_and_updater, maimaiValues.current.timerPeriod);
                timer_draw.current = setInterval(drawer, maimaiValues.current.timerPeriod);
                SongTrack.current.play();
                BGA.current!.play();
                setGameState?.(GameState.Play);
              } else {
              }
            }}
          >
            {gameState === GameState.Play ? 'stop' : 'start'}
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
