import React, { useEffect, useState } from 'react';
import { finished } from 'stream';
import './App.css';
import { Beat, Note, NoteType, ReadMaimaiData } from './maireader';

import {
  hold,
  holdBody,
  holdEachBody,
  holdEachHead,
  holdEachShort,
  holdExBody,
  holdExHead,
  holdExShort,
  holdHead,
  holdShort,
  music,
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
} from './resourceReader';

const sheetdata = `
&title=sweet little sister
&wholebpm=168
&lv_5=11
&seek=5
&wait=0
&track=track.mp3
&bg=bg.png
&inote_5=(150){4} ,,,{8} ,
{48}18,27,3/6h[8:11],4,5,,{16},,,,,,,{2}5,
5h[4:1],4h[4:1]/6h[8:3],
{2}3h[4:1]/6h[8:3],2h[4:1]/6h[8:3],
{4}1/6h[2:1],3,{24}4,6,4,6,4,6,3,5,3,5,3,5,

{16}3<6[8:1],,3,4,3,,8,,6,5,7,5,6>3[8:1],,
6,5,6,,1,,3,4,2,4,3>8[8:1],,
3,4,3,,5,,6,5,7,5,6<1[8:1],,
6,5,6,,4,,3,4,2,4,
3<6[8:1],,2,4,3,,
8,,6,5,7,5,
6>3[8:1],,7,5,6,,
1,,3,4,2,4,3>8[8:1],,
2,4,3,,5,,6,5,
7,5,6<1[8:1],,7,5,6,,4,,3,4,2,4,
{8}1>4[8:1],3,7,
8<5[8:1],6,1>4[8:1],
3,7,5<8[8:1],
6,3,,
{24}3,5,4,5,4,5,2,5,4,5,4,5,3,5,4,5,4,5,
{16}4,3,2,1,8,7,6,5,{4}4h[8:1],
8b,,,4b,,,,
{16}4,,,4,,,4,,,4,,,
{24}4,5,4,5,4,5,{32}4,3,2,1,8,7,6,5,{4}4,

(200){8}36,,4h[4:1],,5h[8:1],3h[8:1],
4h[8:1],2h[8:1],8h[4:1],,5,4,
3h[4:1],,4h[8:1],2h[8:1],3h[8:1],1h[8:1],
{16}4,3,5,4,{8}6h[8:1],4h[8:1],5,5,
4h[4:1],,6h[8:1],5h[8:1],8h[8:1],1h[8:1],
{16}6,,6,5,4>1[8:1],,,,{8}8,8,
8,6,4,2,8,6,
{16}3,4,2,6,5,7,3,5,1b,,,,

(150){8}2/5<8[8:1],6,4,1,{24}6,5,6,7,6,,
{8}4>1[8:1]/7,3,5,8,{24}3,4,3,2,3,,
{8}2/5<8[8:1],6,4,1,{24}6,5,6,7,6,,
{24}4/7,,5,,3,,3,5,4,6,5,7,4,6,3,5,2,4,
{8}1-4[8:1],7,5,8-5[8:1],2,4,
1-5[8:1],7,4,8-4[8:1],2,5,
1-6[8:1],7,4,8,2,1-5[8:1]/8-4[8:1],27,
1-3[8:1]/8-6[8:1],,1-5[8:1]/8-4[8:1],,18,,27,
8-5[8:1],2,{16}3,2,1-4[8:1],,7,,6,7,
8-4[8:1],,2,,3,2,1-5[8:1],,7,,4,,
{16}8,,,7,4,,6,,4,5,,,
45,,,3,5,,2,,{32}5,,2,3,4,5,6,7,
{16}8,,,7,,,6,,,1,18,,
{8}18,27,3>1[8:1]/6<8[8:1],45,,,

{48}18,27,36,4h[8:1]/5h[8:1],{8},{48}36,2-6[8:1]/7,{8}1h[48:5]/8h[48:5],{48},27,36,45,,,{4},
{48}78,16,25,3h[8:1]/4h[8:1],{8},{48}25,1/6-2[8:1],{8}7h[8:1]/8h[8:1],{48},16,25,34,,,{4},
{48}12,38,47,5h[8:1]/6h[8:1],{8},{48}47,38,{8}1h[16:5]/2h[8:1],{48},3,4,5h[2:1],{8},{48}8,7,{8}6h[8:1],
{48},7,8,1h[16:5],{8},{48}4-8[8:1],3,{8}2h[8:1],{48},38,47,56,,,{8},,
{8}5p8[8:1]/8q5[8:1],5<8[8:1]/8<5[8:1],,,,
1p4[8:1]/4q1[8:1],1>4[8:1]/4>1[8:1],,,,
{48}78,16,25,3h[8:1]/4h[8:1],{8},{48}25,16,7h[8:1]/8h[16:3],{8},{48}6,5,4h[16:5],{8},{48}1,2,{8}3h[8:1],{32},5,6,7,8,1,2,3,4,5,6,7,8,1,2,3,{8}4,,

{16}2>5[8:1],,1,1,8,,7>2[8:1],,6,6,5,,
4<7[8:1],,3,3,2,,1>4[8:1],,8,8,7,,
6<1[8:1],,5,5,4,,3<6[8:1],,2,2,1,,
8>3[8:1],,7,7,6,,5<8[8:1],,4,4,3,,
{4}2h[4:3],,,{64},13,48,57,6h[16:15],,,,,,,,,,,,{4},,,
{24}4,5,3,6,4,5,4,5,3,6,4,5,4,5,3,6,4,5,4,5,3,6,4,5,{16}4,3,2,1,{8}8,8,8,,45,,

(75)
{48}15,2,3,4,5,6,37,8,1,2,3,4,15,6,7,8,1,2,37,4,5,6,7,8,
15,2,3,4,5,6,37,8,1,2,3,4,15,6,7,8,1,2,37,4,5,6,7,8,
15,2,3,4,5,6,37,8,1,2,3,4,15,6,7,8,1,2,37,4,5,6,7,8,
15,2,3,4,5,6,37,8,1,2,3,4,1b/5,6,7,8,1,2,3/7b,,,8,,,

{64}4h[2560:1]/8,7,6,5,4,{192}3,,7h[2560:1],{64}2,1,8,7,{192}6,2h[1280:1],,{64}5,4,3,2,1,
4h[1280:1]/8,7,6,5,4,{192}3,,7h[1280:1],{64}2,1,8,7,{192}6,1h[1280:1],,{64}5,4,3,2,1,
4h[1280:1]/8,7,6,5,4,{192}3,,7h[1280:1],{64}2,1,8,7,{192}6,2h[1280:1],,{64}5,4,3,2,1,
4h[1280:1]/8,7,6,5,4,{192}3,,7h[1280:1],{64}2,1,8,7,{192}6,1h[1280:1],,{64}5,4,3,2,1,
4h[1280:1]/8,7,6,5,4,{192}3,,7h[1280:1],{64}2,1,8,7,{192}6,2h[1280:1],,{64}5,4,3,2,1,
4h[1280:1]/8,7,6,5,4,{192}3,,7h[1280:1],{64}2,1,8,7,{192}6,1h[1280:1],,{64}5,4,3,2,1,

(150)
{8}8h[8:5],,,,,
{32}4,3,2,1,8,7,6,5,4,,,,
{8}45,37,{16}6<1[8:1],4,{8}1V37[8:1],1,,4,2,14,6,{24}3,4,5,4>1[8:1],5,6,{8},8,8,
18,26,{16}3>8[8:1],5,{8}8V62[8:1],8,,5,7,58,3,{24}6,5,4,5<8[8:1],4,3,{8}2v5[8:1],,,
8,37,{16}6<1[8:1],4,{8}1V37[8:1],1,,4,2,14,6,{24}3,4,5,4>1[8:1],5,6,{8},8,8,
{8}18,26,{16}3>8[8:1],5,{8}8V62[8:1],8,,5,7,58,3,{24}6,5,4,5<8[8:1],4,3,{8}2v5[8:1],,,

8,3-7[8:1]/6,7>2[8:1],{16}8,8,{8}8,6,5,37,{16}4-8[8:1],5,2,3,{8}1-5[8:1],1,8,8,27,
{16}3,4,3,5,3,2,3,4,3,1,3,5,{24}3,5,4,{16}6,5,6,4,6,7,6,5,6,8,6,4,{24}6,4,5,3,5,4,
{8}36,1,{16}3<6[8:1],4,{8}2,7,8,72,{32}3,4,2b/5b,,,,6,5,4b/7b,,,,3,4,1b/5b,,,,6,5,{8}4b/8b-4[8:1],4-8[8:1]/8,,
{8}1,3,{16}6<1[8:1],4,{8}1V37[8:1],1,,4,2,14,6,{24}3,4,5,4>1[8:1],5,6,{8},8,8,

{16}1-5[8:1]/8,,5,5,5,,8-4[8:1],,4,4,4,,
1-5[8:1],,5,5,5,,8,,4,4,45,,
{24}4,5,4,5,4,5,3,5,4,5,4,5,2,5,4,5,4,5,
{16}4,3,2,1,8,7,6,5,{4}4h[8:1],
{4}1-5[8:7],,,1,1>5[4:1]*<5[4:1],,,

(225)4^1[4:1]/5,6,7,8^5[4:1]/1,2,3,
4>1[4:1]/5,6,7,8^5[4:1]/1,2,3,
45,{8}6,3,7,,18,,{6}18,27,36,
{4}45,3,2,18,{8}7,56,,2,
{4}34,4-2[8:1]/5,5,4/5-7[8:1],
{6}4,3,2,18,7,6,
(112.5){16}35,3,3,46,6,6,35,3,3,46,6,6,35,3,3,45,
5,5,34,3,3,46,6,6,25,2,2,37,7,7,36,3,3,45,5,5,
(150){4}45,67,18,23,

(225){8}45,3,3,{24}3,4,5,{8}6,6,
{24}7,6,5,2,3,4,5,,,7,6,5,{16}4,,18,,
3,4,2,6,5,7,3,4,2,6,5,7,
3,4,1,6,5,8,3,4,1,6,5,8,
3,5,1,6,4,8,3,5,1,6,4,8,
{8}3,45,34,23,12,18,
87,67,56,{16}4,4,5,3,5,5,
4,6,3,3,4,2,6,6,5,7,3,6,
{24}4,5,4,5,4,5,3,6,3,6,3,6,2,7,2,7,2,7,
1,8,1,8,1,8,2,7,3,6,4,5,{32}4,3,2,1,8,7,6,5,
4,3,2,1,8,7,6,5,4,3,2,1,8,7,6,5-8[32:57],{8}4-1[4:7],,

{1}4b,{8},,,,,,,{48}18,27,36,45,,,
{1}1b/2,,E
`;
enum GameState {
  Standby,
  Play,
  Stop,
  Finish,
}

let timer1: string | number | NodeJS.Timer | undefined, timer2: string | number | NodeJS.Timeout | undefined, timer3: string | number | NodeJS.Timer | undefined;

const canvasWidth = 700;
const canvasHeight = 700;

const center = [canvasWidth / 2, canvasHeight / 2];

const maimaiR = 350;
const maimaiScreenR = maimaiR * 0.8;
const maimaiJudgeLineR = maimaiScreenR * 0.885;
const maimaiSummonLineR = maimaiScreenR * 0.22;
const maimaiTapR = (maimaiScreenR / 9) * 0.8;
const maimaiBR = maimaiScreenR * 0.418;
const maimaiER = maimaiScreenR * 0.574;

const touchMaxDistance = maimaiTapR * 0.4;

let bpm: number = 170;
let noteNumber: number = 1;

const timerPeriod: number = 1;

let tapMoveSpeed: number = 1;
let tapEmergeSpeed: number = 0.2;

let speed: number = 3.8;

let starttime: number = 0;
let currentTime: number = 0;

let first: boolean = true;

// 提前时间
let advanceTime: number = (maimaiJudgeLineR - maimaiSummonLineR) / speed;

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

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiJudgeLineR, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiSummonLineR, 0, 2 * Math.PI);
  ctx.strokeStyle = '#333333';
  ctx.stroke();

  const ρ = maimaiJudgeLineR;
  const θ = -1 / 8;

  const judgeDotWidth = 5;

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(center[0] + ρ * Math.cos((θ + i / 4) * Math.PI), center[1] + ρ * Math.sin((θ + i / 4) * Math.PI), judgeDotWidth, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
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
  starttime = performance.now();
  console.log(sheet.beats5?.beat);
  timer1 = setInterval(reader, timerPeriod);
  //timer2 = setInterval(updater, timerPeriod);
  timer3 = setInterval(drawer, timerPeriod);
};

const finish = () => {
  clearInterval(timer1);
  clearInterval(timer3);
};

const sheet = ReadMaimaiData(sheetdata);

interface ShowingNoteProps {
  /** 绘制的NoteGroup的index */
  index: number;

  noteIndex: number;

  /**
   * TAP:
   * 0: emerge 1:move
   * HOLD:
   * 0: emerge 1: grow 2: move 3: die
   */
  status: number;
  radius: number;
  // 位置
  rho: number;

  // 从生成到消亡的不间断变化量
  timer: number;

  tailRho: number;
  placeTime: number;

  isEach: boolean;
}

let showingNotes: ShowingNoteProps[] = [];

// 下一个noteGroup标号
let nextNoteGroupIndex = 0;

const reader = async () => {
  currentTime = performance.now() - starttime;

  //updater

  showingNotes = showingNotes.map((note) => {
    const newNote = note;
    const type = sheet.beats5?.beat[note.index].notes[note.noteIndex].type;

    switch (type) {
      case NoteType.Tap:
        if (newNote.status === 0) {
          // emerge
          newNote.radius += tapEmergeSpeed * speed;
          if (newNote.radius >= maimaiTapR) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho += tapMoveSpeed * speed;
        }
        break;
      case NoteType.Hold:
        if (newNote.status === 0) {
          //emerge
          newNote.radius += tapEmergeSpeed * speed;
          if (newNote.radius >= maimaiTapR) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // grow
          newNote.rho += tapMoveSpeed * speed;
          //console.log(currentTime, sheet.beats5?.beat[note.index].time! + sheet.beats5?.beat[note.index].notes[note.noteIndex].remainTime!, sheet.beats5?.beat[note.index].notes[note.noteIndex]);
          if (currentTime >= sheet.beats5?.beat[note.index].time! + sheet.beats5?.beat[note.index].notes[note.noteIndex].remainTime!) {
            newNote.status = 2;
          }
        } else if (newNote.status === 2) {
          // move
          newNote.tailRho += tapMoveSpeed * speed;
          newNote.rho += tapMoveSpeed * speed;
        } else if (newNote.status === 3) {
          // die
          newNote.tailRho += tapMoveSpeed * speed;
          newNote.rho += tapMoveSpeed * speed;
        }
        newNote.timer++;
        break;
      default:
        if (newNote.status === 0) {
          // emerge
          newNote.radius += tapEmergeSpeed * speed;
          if (newNote.radius >= maimaiTapR) {
            newNote.status = 1;
          }
        } else if (newNote.status === 1) {
          // move
          newNote.rho += tapMoveSpeed * speed;
        }
        newNote.timer++;
        break;
    }

    return newNote;
  });

  // 清除大于屏幕的note
  showingNotes = showingNotes.filter((note) => {
    const type = sheet.beats5?.beat[note.index].notes[note.noteIndex].type;
    if (type === NoteType.Hold) {
      return note.tailRho < maimaiScreenR - maimaiSummonLineR + maimaiTapR;
    } else {
      return note.rho < maimaiScreenR - maimaiSummonLineR + maimaiTapR;
    }
  });

  // reader
  if (currentTime >= sheet.beats5?.beat[nextNoteGroupIndex].time!) {
    sheet.beats5?.beat[nextNoteGroupIndex].notes.forEach((note, i) => {
      showingNotes.push({
        index: nextNoteGroupIndex,
        noteIndex: i,
        status: 0,
        radius: 0,
        rho: 0,
        tailRho: 0,
        timer: 0,
        placeTime: currentTime,
        isEach: sheet.beats5?.beat[nextNoteGroupIndex].notes.length! > 1,
      });
    });
    nextNoteGroupIndex++;
  }

  //console.log(nextNoteGroupIndex, showingNotes);
};

const updater = async () => {};

const drawer = async () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasFloat')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  //不用foreach是为了从里往外，这样外侧的才会绘制在内侧Note之上
  for (let i = showingNotes.length - 1; i >= 0; i--) {
    const note = showingNotes[i];
    drawNote(ctx, sheet.beats5?.beat[note.index].notes[note.noteIndex]!, note.isEach, note);
  }
};

const draw_old = () => {
  const el: HTMLCanvasElement = document.getElementsByClassName('canvasFloat')[0] as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  currentTime = performance.now() - starttime;

  console.log(currentTime);

  if (currentTime > advanceTime && first) {
    first = false;
    // 开始
    music.currentTime = 0;
    music.play();
  }

  for (let i = 0; i < sheet?.beats5?.length!; i++) {
    bpm = sheet?.beats5?.beat[i].bpm!;
    noteNumber = sheet?.beats5?.beat[i].notevalue!;
    if (sheet?.beats5?.beat[i].notes.length! > 0) {
      const beat: number = Number(i);

      //理论到达时间
      let theoreticTime = (240 / bpm / noteNumber) * beat * 1000;

      // 位移
      let displacement = (theoreticTime - currentTime + advanceTime) * speed;
      let ρ = maimaiJudgeLineR - maimaiSummonLineR - (displacement + maimaiSummonLineR);

      sheet?.beats5?.beat[i].notes.forEach((note) => {
        let θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;

        let x = center[0] + ρ * Math.cos(θ);
        let y = center[1] + ρ * Math.sin(θ);

        // 画
        if (ρ >= maimaiSummonLineR && ρ <= maimaiScreenR) {
          ctx.beginPath();
          ctx.arc(x, y, maimaiTapR, 0, 2 * Math.PI);

          if (sheet?.beats5?.beat[i].notes.length! > 1) {
            ctx.strokeStyle = 'yellow';
          } else {
            ctx.strokeStyle = 'pink';
          }
          ctx.lineWidth = 10;
          ctx.stroke();
        }
      });

      // // 到判定线时tap音效
      // if (Math.abs(theoreticTime - currentTime + advanceTime) < 5) {
      //   console.log(theoreticTime, currentTime, x, y);
      //   tapSound.play();
      // }
    }
  }
};

const drawNoteGroup = (ctx: CanvasRenderingContext2D, beat: ShowingNoteProps) => {
  const noteGroup = beat;
  sheet.beats5?.beat[noteGroup.index].notes.forEach((note) => {
    drawNote(ctx, note, sheet.beats5?.beat[noteGroup.index].notes.length! > 1, beat);
  });
};

const drawNote = (ctx: CanvasRenderingContext2D, note: Note, isEach: boolean = false, props: ShowingNoteProps) => {
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
        console.log('D', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
        x = center[0] + maimaiScreenR * Math.cos(θ);
        y = center[1] + maimaiScreenR * Math.sin(θ);
        break;
      case 'E':
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        console.log('E', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
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

  const drawHoldImage = (imagehead: HTMLImageElement, imagebody: HTMLImageElement, shortHoldImage?: HTMLImageElement, isShortHold: boolean = false) => {
    //console.log(y, ty);
    const centerx = x,
      centery = y;

    if (isShortHold) {
      drawRotationImage(ctx, shortHoldImage!, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
    } else {
      if (props.status === 0) {
        drawRotationImage(ctx, shortHoldImage!, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
      } else {
        drawRotationImage(ctx, imagehead, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (imagehead.height - 30) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
        drawRotationImage(
          ctx,
          imagebody,
          x - props.radius / k,
          y - props.radius / k + imagehead.height - 30,
          (props.radius * 2) / k,
          props.rho - props.tailRho + (props.radius * 2) / k - (imagehead.height - 30) * 2,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45
        );
        drawRotationImage(ctx, imagehead, tx - props.radius / k, ty - props.radius / k, (props.radius * 2) / k, (imagehead.height - 30) / k, tx, ty, 157.5 + Number(note.pos) * 45);
      }
    }
  };

  const drawTouchImage = (image: HTMLImageElement, imageCenter: HTMLImageElement) => {
    const centerx = x,
      centery = y;
    const k = 0.4,
      centerk = 0.5;
    console.log(note, props, x, y);
    for (let i = 0; i < 4; i++) {
      drawRotationImage(
        ctx,
        image,
        x - (image.width * k) / 2,
        y + (image.height * 0.2) / 2 - touchMaxDistance * (props.rho / (maimaiJudgeLineR - maimaiSummonLineR)),
        image.width * k,
        image.height * k,
        x,
        y,
        90 * i,
        props.radius / maimaiTapR
      );
    }
    drawRotationImage(ctx, imageCenter, x - (imageCenter.width * centerk) / 2, y - (imageCenter.height * centerk) / 2, imageCenter.width * centerk, imageCenter.height * centerk);
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
        drawHoldImage(holdEachHead, holdEachBody, holdEachShort, note.isShortHold);
      } else {
        drawHoldImage(holdHead, holdBody, holdShort, note.isShortHold);
      }

      if (note.isEx) {
        drawHoldImage(holdExHead, holdExBody, holdExShort, note.isShortHold);
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
      break;
    case NoteType.EndMark:
      finish();
      break;
  }
};

const drawSlide = () => {};

const drawRotationImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number, centerX?: number, centerY?: number, r?: number, alpha?: number) => {
  const TO_RADIANS = Math.PI / 180;
  if (centerX && centerY && r) {
    ctx.save(); //保存状态

    ctx.translate(centerX, centerY); //设置画布上的(0,0)位置，也就是旋转的中心点
    ctx.rotate(r * TO_RADIANS);
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, x - centerX, y - centerY, w, h);
    ctx.restore(); //恢复状态
  } else {
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, x, y, w, h);
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
    drawBackground();
    drawOver();
  }, []);

  return (
    <div className="App">
      <div className="canvasContainer">
        <canvas className="canvasMain" height="700" width="700" />
        <canvas className="canvasFloat" height="700" width="700" />
        <canvas className="canvasOver" height="700" width="700" />
      </div>
      <div style={{ position: 'absolute', zIndex: 3 }}>
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
              timer1 = setInterval(reader, timerPeriod);
              //timer2 = setInterval(updater, timerPeriod);
              timer3 = setInterval(drawer, timerPeriod);
              setGameState(GameState.Play);
            } else {
            }
          }}
        >
          {gameState === GameState.Play ? 'stop' : 'start'}
        </button>
        <button
          onClick={() => {
            const sheetdata = `
          &title=sweet little sister
&wholebpm=168
&lv_5=11
&seek=5
&wait=0
&track=track.mp3
&bg=bg.png
&inote_5= (168){4} 
1-5[8:1],,8-4[8:1],,2-5[8:1],,7-4[8:1], 
{8} 
,,,2,,2,,5,,5,,7,,7,,4,,4, 
{4} 
5-7[8:1],,4-2[8:1],,6-8[8:1],,3-1[8:1],, 
{8} 
8-6[8:1],,1-3[8:1],,7-5[8:1],,2-4[8:1],, 
8-4[8:1],,1-5[8:1],,,,,, 
1h[4:1],,2h[4:1],,3h[4:1],,4h[4:1],, 
5h[4:1],,6h[4:1],,7h[4:1],,8,, 
8h[4:1],,7h[4:1],,6h[4:1],,5h[4:1],,4h[4:1],,3h[4:1],,2h[4:1],,1,, 
1v2[8:1],,,,5v6[8:1],,,,3v4[8:1],,,,7v8[8:1],,,, 
1-5[8:1],,8-4[8:1],,2-6[8:1],,7-3[8:1],,1^4[8:1],,8^5[8:1],,1-5[8:1],,,, 
,,7-4[8:1],,1-3[8:1],,5h[4:3],,,,3,,3,, 
1h[4:1],,7h[8:3],,,5h[8:3],,,8,,,,8,,1,2,3,, 
,,8q5[8:1],,2,,1p4[8:1],,7 
,,8q6[8:1],,2,,1p3[8:1],,7 
,,,,,,12,,,,78,,1,8,27,, 
1-5[16:3],82,,,8-4[16:3],17,,, 
2-6[16:3],13,,,7-3[16:3],86,,, 
1-5[16:3],82,,,8-4[16:3],17,,, 
2-6[16:3],13,,,7-3[16:3],86,,, 
2-4[8:1],,1-4[8:1],,8-4[8:1],,7-4[8:1],, 
1-4[8:1],,7-4[8:1],,8-4[8:1],,,, 
{16}3,2,1,8,7,6,5,4,3,2,1,8,7,6,5,4, 
3h[4:3]{8},,,,7h[4:1],,,,15,,73,, 
8v6[8:1]/4v2[8:1],,,, 
8^3[8:1],7,6,,4^7[8:1],3,2,,4,8,6,2,8,1,27,, 
{16}6,,8,,1,,3,,24,,6,5,6,,57,, 
{8}45,45,34,34,56,,,, 
1-3[8:1],7,5,,8-6[8:1],2,4,,3,7,5,1,8,1,27,, 
{16}2h[4:2],,3,,4,,5,,7,,5,6,5,,4,, 
{8}5-1[8:1],,,,1b/2b,,7b/8b,, 
1^6[8:1],2,3,,5^2[8:1],6,7,,5,1,3,7,1,8,27,, 
{16}3,,1,,8,,6,,75,,3,4,3,,24,, 
{8}45,45,56,56,34,,,, 
2-6[8:1],8,4,,7-3[8:1],1,5,,2,4,7,5,3,6,18,, 
{16}3h[4:2],,2,,1,,8,,6,,8,7,8,,1,, 
{12}2b/7b,,,,,,,,,,,, 
3,4,3,6,5,6,3,4,3,6b/7b,,3b/4b,,1b/8b,, 
3,4,2,6,5,7,3,6,3,1b/8b,,6b/7b,,3b/4b,, 
2,4,3,7,5,6,2,7,2,6b/8b,,4b/5b,,1b/3b,, 
2,8,1,7,1,8,4,5,4,3b/7b,,1b/5b,,2b/6b,, 
{8}2h[4:3],,1,,3,,8h[4:4],,7,,1,,6,,3,, 
3h[4:3],,4,,2,,6h[4:3],,5,,7,,4h[4:1],,2,, 
8h[4:2],,7,,1h[4:2],,2,, 
8h[4:1],,6h[4:1],,4h[4:1],,2,, 
1h[4:1],,2h[4:1],,5h[4:1],,6h[4:1],, 
7h[4:1],,8h[4:1],,3h[4:1],,4,, 
2^4[8:1],,5,,6^8[8:1],,1,, 
1-5[8:1],,7,,7-4[8:1],,2,, 
5^7[8:1],,4,,3^1[8:1],,8,, 
2-6[8:1],,1-5[8:1],,8-4[8:1],,1,, 
1-5[16:3],,1/8-4[16:3],,8/2-5[16:3],,5,, 
7-4[16:3],,7/1-5[16:3],,1/8-4[16:3],,8,, 
1-3[16:3],,1/7-5[16:3],,7/4-8[16:3],,4,, 
37,, 
1z5[4:1],,,,,, 
3-7[8:1],,1,,5-1[8:1],,3,, 
2,2,8^3[8:1],7,6,,34,56,(175),1,5,3,7, 
{16} 
1,6,4,,8,, 
{8}2^5[4:1],,6,7,8^3[4:1],,4,, 
(176)2q7[8:1],,8,,6^3[8:1],,1,, 
8,1,8-4[8:1],1,8-5[8:1],,,7h[8:3], 
,5,2h[4:1],4,7, 
{16} 
1,8,1,,36,, 
{8} 
(177)7-5[8:1],,1-5[8:1],,8-5[8:1],,,, 
(181)2-6[8:1],1,8,7,(182)6^1[8:1],5,4,3 
(183),2,8,4,6,15,,37(184),4^7[8:1]/8 
,,3,2,1,82, 
{16}1,6,4,,35,, 
(185){8}45,45,34,34,56,,18,, 
(186)6^3[8:1],7,8,1,2q7[8:1],3,4,5, 
(187)6,5,4,3,18,,12,78, 
(188),7,5,3,17,1{16}8,3,5,,46,, 
(189){8}15,37,26,48,12,57,25,78, 
(190)2,,1,,8,,2>7[1:1]/5z1[1:1] 
{1},, 
E

          `;

            const res = ReadMaimaiData(sheetdata);
            console.log(res);
          }}
        >
          read
        </button>
      </div>
    </div>
  );
}

export default App;
