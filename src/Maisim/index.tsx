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
	maimaiBR,
	maimaiER,
	trackItemWidth,
	trackItemHeight,
	trackItemGap,
	judgeLineRemainTimeTouch,
	fireworkLength,
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
import { Area, areas, initAreas, whichArea } from './areas';
import { drawAllKeys, drawAllTouchingAreas } from './drawUtils/drawTouchingAreas';
import { KeyState } from '../utils/keyState';
import { drawOutRing } from './drawUtils/drawOutRing';
import { initResources } from './resourceReaders/_init';
import { APositions, ppqqAnglCalc, pqTrackJudgeCalc, updateVarAfterSizeChanged } from './slideTracks/_global';
import { abs } from '../math';
import { JudgeStatus, JudgeTimeStatus } from '../utils/judgeStatus';
import { Note } from '../utils/note';
import { NoteType } from '../utils/noteType';
import { Sheet } from '../utils/sheet';
import { Song } from '../utils/song';
import { gameRecord } from './global';
import { section, section_wifi } from './slideTracks/section';
import { judge, judge_up } from './judge';
import { updateRecord } from './recordUpdater';
import { NoteSound } from './resourceReaders/noteSoundReader';
import testsong_taiyoukei from './resource/sound/track/太陽系デスコ.mp3';
import testbgi from './resource/maimai_img/ui/UI_Chara_105810.png';
import { JudgeLineStyle, RegularStyles, SlideColor, TapStyles } from '../utils/noteStyles';
import { uiIcon } from './resourceReaders/uiIconReader';

const SongTrack = new Audio();
SongTrack.volume = 0.5;
SongTrack.src = testsong_taiyoukei;
SongTrack!.oncanplaythrough = (e) => {
	console.log(e);
	//alert('rua!');
};

let auto = true;

let timer1: string | number | NodeJS.Timer | undefined, timer2: string | number | NodeJS.Timeout | undefined, timer3: string | number | NodeJS.Timer | undefined;

let tapMoveSpeed: number = 0.85; // 0.85
let tapEmergeSpeed: number = 0.2; // 0.2

let speed: number = 10;

let starttime: number = 0;
let currentTime: number = 0;

let currentDifficulty = 5;

let currentTouchingArea: TouchArea[] = [];

let keyStates: KeyState[] = [];

/** 提前绘制了的时间 */
let advancedTime = 0;

export const fireworkTrigger = (triggerNote: Note) => {
	// @ts-ignore
	NoteSound.firework.cloneNode().play();
	const fireworkNote = currentSheet.notes?.findIndex((n) => {
		return n.serial !== triggerNote.serial && n.fireworkTriggerIndex === triggerNote.serial;
	});
	if (fireworkNote !== -1) {
		const fireworkNoteProps = showingNotes.findIndex((n) => {
			return n.noteIndex === fireworkNote;
		});
		console.log(fireworkNoteProps, showingNotes[fireworkNoteProps]);
		if (fireworkNoteProps !== -1) {
			showingNotes[fireworkNoteProps].fireworkTrigged = true;
		}
	}
};

const drawKeys = () => {
	const el: HTMLCanvasElement = document.getElementsByClassName('canvasKeys')[0] as HTMLCanvasElement;
	const ctx: CanvasRenderingContext2D = el.getContext('2d') as CanvasRenderingContext2D;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawAllKeys(ctx, currentTouchingArea, keyStates);

	drawFrame(ctx, canvasWidth - 100, 30);
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

// 三次处理谱面
/**
 * 根据速度计算emergeTime, moveTime, guideStarEmergeTime
 * 判断所有黄色SLIDE TRACK
 * @param notesOri
 * @returns
 */
const calculate_emerge_move_time_of_notes = (notesOri: Note[]) => {
	/** 为Notes计算浮现的时机 */
	const notes = notesOri;
	notes.forEach((note: Note, i: number) => {
		if (note.type === NoteType.SlideTrack) {
			const emergingTime = (maimaiJudgeLineR - maimaiSummonLineR) / ((tapMoveSpeed * speed) / timerPeriod);
			notes[i].moveTime = note.time - note.remainTime!;
			notes[i].emergeTime = note.time - note.remainTime! - note.stopTime! - emergingTime;
			notes[i].guideStarEmergeTime = note.time - note.remainTime! - note.stopTime!;
		} else if (note.type === NoteType.FireWork) {
			const trigger = currentSheet.notes.find((n) => {
				return n.serial === note.fireworkTriggerIndex;
			});
			if (trigger) {
				notes[i].emergeTime = trigger.emergeTime;
				// 开始描画时间
				notes[i].moveTime = trigger.time + (trigger.type === NoteType.TouchHold ? trigger.remainTime ?? 0 : 0);
				// 整体存续时间
				notes[i].remainTime = trigger.time + (trigger.type === NoteType.TouchHold ? trigger.remainTime ?? 0 : 0) - trigger.emergeTime! + fireworkLength;
			}
		} else {
			const emergingTime = maimaiTapR / ((tapEmergeSpeed * speed) / timerPeriod);
			const movingTime = (maimaiJudgeLineR - maimaiSummonLineR) / ((tapMoveSpeed * speed) / timerPeriod);
			notes[i].moveTime = note.time - movingTime;
			notes[i].emergeTime = note.time - movingTime - emergingTime;
		}

		// isEach for SLIDE TRACK
		notes.forEach((note2, j) => {
			if (note.type === NoteType.SlideTrack && note2.type === NoteType.SlideTrack && i !== j && note.emergeTime === note2.emergeTime) {
				notes[i].isEach = true;
				notes[j].isEach = true;
			}
		});
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

let songPlaying = false;

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

					if (auto) {
						if (newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
							judge(
								showingNotes,
								currentSheet,
								currentTime,
								{
									area: areas.filter((a) => {
										return a.name === 'A' + noteIns.pos;
									})[0],
									pressTime: currentTime,
								},
								currentTouchingArea
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
						newNote.status = 1;
					}
				} else if (newNote.status === 1) {
					// grow
					newNote.rho = ((currentTime - noteIns.moveTime!) / (noteIns.time! - noteIns.moveTime!)) * (maimaiJudgeLineR - maimaiSummonLineR);

					// HOLD长度大于maimaiJudgeLine-maimaiSummonLine
					if (currentTime >= noteIns.time!) {
						newNote.status = 2;
					}

					// HOLD长度小于maimaiJudgeLine-maimaiSummonLine
					if (currentTime >= noteIns.remainTime! + noteIns.moveTime!) {
						newNote.status = 2;
					}
				} else if (newNote.status === 2) {
					// move

					if (auto) {
						if (newNote.rho >= maimaiJudgeLineR - maimaiSummonLineR) {
							judge(
								showingNotes,
								currentSheet,
								currentTime,
								{
									area: areas.filter((a) => {
										return a.name === 'A' + noteIns.pos;
									})[0],
									pressTime: currentTime,
								},
								currentTouchingArea
							);
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

					if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeLineRemainTimeHold) {
						newNote.status = -4;
					}
				} else if (newNote.status === -3) {
					// judge

					if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeResultShowTime) {
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
									area: areas.filter((a) => {
										return a.name === noteIns.pos;
									})[0],
									pressTime: currentTime,
								},
								currentTouchingArea
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

					if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeLineRemainTimeHold) {
						newNote.status = -4;
					}
				} else if (newNote.status === -3) {
					// judge

					if (currentTime >= noteIns.time! + noteIns.remainTime! + judgeResultShowTime) {
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
						if (currentTime >= noteIns.time!) {
							judge(
								showingNotes,
								currentSheet,
								currentTime,
								{
									area: areas.filter((a) => {
										return a.name === noteIns.pos;
									})[0],
									pressTime: currentTime,
								},
								currentTouchingArea
							);
						}
					}

					if (currentTime >= noteIns.time!) {
						// @ts-ignore
						NoteSound.touch.cloneNode().play();
						newNote.status = -2;
					}
				} else if (newNote.status === -2) {
					// stop

					newNote.rho = touchMaxDistance;
					if (currentTime >= noteIns.time! + judgeLineRemainTimeTouch) {
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
									area: areas.filter((a) => {
										return a.name === 'A' + noteIns.pos;
									})[0],
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
			/////////////////////////////// FIREWORK ///////////////////////////////
			case NoteType.FireWork:
				if (newNote.status === 0) {
					// wait for trigging

					if (currentTime >= noteIns.moveTime!) {
						newNote.status = 1;
					}
				} else if (newNote.status === 1) {
					// change

					newNote.rho = (currentTime - noteIns.moveTime!) / fireworkLength;
					if (currentTime >= noteIns.time) {
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
	showingNotes = showingNotes.filter((note) => {
		const noteIns = currentSheet.notes[note.noteIndex];
		// MISS
		if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide || noteIns.type === NoteType.Touch || noteIns.type === NoteType.SlideTrack) {
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
			if (note.status === -1 && !note.touched) {
				updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation);
			}
		}
		// 按过的，return的是filt出的还没按的
		if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide || noteIns.type === NoteType.SlideTrack) {
			if (note.status === -4) {
				if (noteIns.isEx) {
					if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
				}
				note.status = -3;
			}
			return note.status !== -1;
		} else if (noteIns.type === NoteType.Touch) {
			if (note.status === -4) {
				note.status = -3;
			}
			return note.status !== -1;
		} else if (noteIns.type === NoteType.Hold || noteIns.type === NoteType.TouchHold) {
			if (note.status === -4) {
				if (noteIns.isEx) {
					if (note.judgeStatus !== JudgeStatus.Miss) note.judgeStatus = JudgeStatus.CriticalPerfect;
				}

				if (note.touched && note.holdPress) {
					note.holdingTime += currentTime - (note.touchedTime ?? 0);
				}
				const holdingPercent = note.holdingTime / (noteIns.remainTime! - (12 + (noteIns.type === NoteType.Hold ? 6 : 15)) * timerPeriod);

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
				updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
			}
			return note.status !== -1;
		} else {
			// FIREWORK
			return note.status !== -1;
		}
	});

	// reader

	//播放
	if (currentTime >= advancedTime && !songPlaying) {
		songPlaying = true;
		SongTrack.play();
	}

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

// 绘制帧率
const drawFrame = (ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0) => {
	ctx.strokeStyle = 'red';
	ctx.font = '20px Arial';
	ctx.strokeText(frame.toFixed(2) + 'fps', x, y);
};

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

	// game record
	ctx_game_record.clearRect(0, 0, canvasWidth, canvasHeight);
	drawGameRecord(ctx_game_record);
};

const drawGameRecord = (ctx: CanvasRenderingContext2D) => {
	ctx.strokeStyle = 'red';
	ctx.font = '20px Arial';
	ctx.strokeText(`Critical: ${gameRecord.criticalPerfect}, Perfect: ${gameRecord.perfect}, Great: ${gameRecord.great}, Good: ${gameRecord.good}, Miss: ${gameRecord.miss}`, 50, 250);
	ctx.strokeStyle = 'white';
	ctx.font = '30px Arial';
	ctx.strokeText(`COMBO ${gameRecord.combo}`, center[0] - 50, center[1] - 30);
	ctx.strokeText(`${(100 - gameRecord.achieving_rate_lost + gameRecord.achieving_rate_ex).toFixed(4)}%`, center[0] - 60, center[1]);
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
	judgeLineStyle: JudgeLineStyle;

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

// React18生产环境useEffect运行两次 https://juejin.cn/post/7137654077743169573
let hasinit = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
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
			currentTouchingArea = currentTouchingArea.filter((ta) => {
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
					currentTouchingArea.find((ta) => {
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
				currentTouchingArea = currentTouchingArea.filter((ta) => {
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
				currentTouchingArea = currentTouchingArea.filter((ta) => {
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
				currentTouchingArea = currentTouchingArea.filter((ta) => {
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
					onPressDown(tempTouchingArea[i]);
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
				<button
					onClick={() => {
						//testmusic.play();
						if (props.gameState === GameState.Begin) {
							starttimer();
							props.setGameState(GameState.Play);
						} else if (props.gameState === GameState.Play) {
							clearInterval(timer1);
							clearInterval(timer3);
							props.setGameState(GameState.Pause);
						} else if (props.gameState === GameState.Pause) {
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
