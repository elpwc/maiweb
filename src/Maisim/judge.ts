import { abs } from '../math';
import { JudgeTimeStatus, JudgeStatus } from '../utils/judgeStatus';
import { NoteType } from '../utils/noteType';
import { Sheet } from '../utils/sheet';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import { TouchArea } from '../utils/touchArea';
import { timerPeriod } from './const';
import { updateRecord } from './recordUpdater';
import { section_wifi, section } from './slideTracks/section';

export const judge = (showingNotes: ShowingNoteProps[], currentSheet: Sheet, currentTime: number, area: TouchArea, currentTouchingArea: TouchArea[]) => {
	/** 是否已经判定过一个TAP/TOUCH/BREAK了，避免一次触摸重复判定距离过近的Note */
	let judged = false;

	for (let i = 0; i < showingNotes.length; i++) {
		const note = showingNotes[i];
		const noteIns = currentSheet.notes[note.noteIndex];

		console.log(noteIns.type);
		let timeD = noteIns.time - currentTime;

		if (noteIns.type === NoteType.Tap || noteIns.type === NoteType.Slide) {
			console.log(area.area.id, Number(noteIns.pos));

			// 已经判定过一个NOTE就不再判定了
			if (judged) break;

			if ((area.area.type === 'K' || area.area.type === 'A') && area.area.id === Number(noteIns.pos) && abs(timeD) <= timerPeriod * 9) {
				// 设置标志位
				showingNotes[i].touched = true;
				showingNotes[i].touchedTime = currentTime;
				showingNotes[i].isTouching = true;

				showingNotes[i].status = -4;

				judged = true;

				console.log('timeD: ', timeD);

				// FAST LATE
				if (timeD >= 0) {
					showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
				} else {
					showingNotes[i].judgeTime = JudgeTimeStatus.Late;
				}
				console.log(showingNotes);
				timeD = abs(timeD);

				// PERFECT GOOD GREAT
				if (timeD <= timerPeriod * 1) {
					// CRITICAL PERFECT
					showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
				} else if (timeD <= timerPeriod * 3 && timeD > timerPeriod * 1) {
					// PERFECT
					showingNotes[i].judgeStatus = JudgeStatus.Perfect;
				} else if (timeD <= timerPeriod * 6 && timeD > timerPeriod * 3) {
					// GREAT
					showingNotes[i].judgeStatus = JudgeStatus.Great;
				} else if (timeD <= timerPeriod * 9 && timeD > timerPeriod * 6) {
					// GOOD
					showingNotes[i].judgeStatus = JudgeStatus.Good;
				} else {
				}

				//TAP BREAK细分
				if (noteIns.isBreak) {
					showingNotes[i].judgeLevel = Math.ceil(abs(timeD) / timerPeriod);
					console.log(showingNotes[i].judgeLevel, abs(timeD), timerPeriod);
				}

				// 更新game record
				if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
					updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation);
				}
			}
		} else if (noteIns.type === NoteType.Hold) {
			// 已经判定过一个NOTE就不再判定了
			if (judged) break;

			if ((area.area.type === 'K' || area.area.type === 'A') && area.area.id === Number(noteIns.pos)) {
				if (abs(timeD) <= timerPeriod * 9) {
					// 头部
					// 设置标志位
					showingNotes[i].touched = true;
					showingNotes[i].touchedTime = currentTime;
					showingNotes[i].isTouching = true;
					showingNotes[i].holdPress = true;

					judged = true;

					console.log('timeD: ', timeD);

					// FAST LATE
					if (timeD >= 0) {
						showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
					} else {
						showingNotes[i].judgeTime = JudgeTimeStatus.Late;
					}
					console.log(showingNotes);

					// PERFECT GOOD GREAT
					if (abs(timeD) <= timerPeriod * 1) {
						// CRITICAL PERFECT
						showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
					} else if (abs(timeD) <= timerPeriod * 3 && abs(timeD) > timerPeriod * 1) {
						// PERFECT
						showingNotes[i].judgeStatus = JudgeStatus.Perfect;
					} else if (abs(timeD) <= timerPeriod * 6 && abs(timeD) > timerPeriod * 3) {
						// GREAT
						showingNotes[i].judgeStatus = JudgeStatus.Great;
					} else if (abs(timeD) <= timerPeriod * 9 && abs(timeD) > timerPeriod * 6) {
						// GOOD
						showingNotes[i].judgeStatus = JudgeStatus.Good;
					} else {
					}

					if (noteIns.isShortHold) {
						//SHORT的话就直接判定了喵
						updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation);
						showingNotes[i].status = -4;
					} else {
						// 按压声音
						if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
							updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, true);
						}
					}
				}
				if (timeD < -timerPeriod * 6 && timeD >= -(noteIns.remainTime! - 12 * timerPeriod)) {
					// HOLD体
					console.log(timeD);
					showingNotes[i].touched = true;
					showingNotes[i].touchedTime = currentTime;
					showingNotes[i].isTouching = true;
					showingNotes[i].holdPress = true;
				}
			}
		} else if (noteIns.type === NoteType.Touch || (timeD >= timerPeriod * 9 && timeD <= timerPeriod * 18)) {
			// 已经判定过一个NOTE就不再判定了
			if (judged) break;

			if (area.area.name === noteIns.pos) {
				// 设置标志位
				showingNotes[i].touched = true;
				showingNotes[i].touchedTime = currentTime;
				showingNotes[i].isTouching = true;

				showingNotes[i].status = -4;

				judged = true;

				let timeD = noteIns.time - currentTime;

				console.log('timeD: ', timeD);

				// FAST LATE
				if (timeD >= 0) {
					showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
				} else {
					showingNotes[i].judgeTime = JudgeTimeStatus.Late;
				}

				// PERFECT GOOD GREAT
				if (abs(timeD) <= timerPeriod * 9) {
					// CRITICAL PERFECT
					showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
				} else if (timeD <= timerPeriod * 12 && timeD > timerPeriod * 9) {
					// PERFECT
					showingNotes[i].judgeStatus = JudgeStatus.Perfect;
				} else if (timeD <= timerPeriod * 15 && timeD > timerPeriod * 12) {
					// GREAT
					showingNotes[i].judgeStatus = JudgeStatus.Great;
				} else if (timeD <= timerPeriod * 18 && timeD > timerPeriod * 15) {
					// GOOD
					showingNotes[i].judgeStatus = JudgeStatus.Good;
				} else {
				}

				if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
					// touch group
					if (noteIns.inTouchGroup) {
						currentSheet.beats[noteIns.beatIndex].touchGroupTouched!++;
						if (currentSheet.beats[noteIns.beatIndex].touchGroupTouched! > currentSheet.beats[noteIns.beatIndex].touchGroupStatus?.length! / 2) {
							currentSheet.beats[noteIns.beatIndex].touchGroupStatus?.forEach((touchGroupMemberIndex) => {
								for (let j = 0; j < showingNotes.length; j++) {
									if (showingNotes[j].noteIndex === touchGroupMemberIndex && !showingNotes[j].touched) {
										showingNotes[j].touched = true;
										showingNotes[j].touchedTime = showingNotes[i].touchedTime;
										showingNotes[j].isTouching = true;
										showingNotes[j].judgeTime = showingNotes[i].judgeTime;
										showingNotes[j].judgeStatus = showingNotes[i].judgeStatus;

										// 更新touch group自动判定的TOUCH的game record
										updateRecord(currentSheet.notes[touchGroupMemberIndex], showingNotes[j], currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
									}
								}
							});
						}
					}

					// 更新game record
					updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
				}
			}
		} else if (noteIns.type === NoteType.TouchHold) {
			// 已经判定过一个NOTE就不再判定了
			if (judged) break;

			if (area.area.name === noteIns.pos) {
				if (abs(timeD) <= timerPeriod * 18) {
					// 头部
					// 设置标志位
					showingNotes[i].touched = true;
					showingNotes[i].touchedTime = currentTime;
					showingNotes[i].isTouching = true;

					judged = true;

					console.log('timeD: ', timeD);

					// FAST LATE
					if (timeD >= 0) {
						showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
					} else {
						showingNotes[i].judgeTime = JudgeTimeStatus.Late;
					}

					// PERFECT GOOD GREAT
					if (abs(timeD) <= timerPeriod * 9) {
						// CRITICAL PERFECT
						showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
					} else if (timeD <= timerPeriod * 12 && timeD > timerPeriod * 9) {
						// PERFECT
						showingNotes[i].judgeStatus = JudgeStatus.Perfect;
					} else if (timeD <= timerPeriod * 15 && timeD > timerPeriod * 12) {
						// GREAT
						showingNotes[i].judgeStatus = JudgeStatus.Great;
					} else if (timeD <= timerPeriod * 18 && timeD > timerPeriod * 15) {
						// GOOD
						showingNotes[i].judgeStatus = JudgeStatus.Good;
					} else {
					}
				}

				if (noteIns.isShortHold) {
					//SHORT的话就直接判定了喵
					updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation);
					showingNotes[i].status = -4;
				} else {
					// 按压声音
					updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, true, true);
				}

				if (timeD < -timerPeriod * 15 && timeD >= -(noteIns.remainTime! - 12 * timerPeriod)) {
					// HOLD体
					showingNotes[i].touchedTime = currentTime;
					showingNotes[i].isTouching = true;
				}
			}
		} else if (noteIns.type === NoteType.SlideTrack) {
			if (noteIns.isChain) {
				// 人体蜈蚣
				const currentLine = noteIns.slideLines![note.currentLineIndex];
				if (currentLine.slideType === 'w') {
					// 如果是WIFI
					// SLIDE分段信息
					const sectionInfoWifi = section_wifi(currentLine.pos!, currentLine.endPos ?? '');
					console.log(sectionInfoWifi);
					// 可供点击的下一个段的区域
					const nextPositionsWifi = sectionInfoWifi.map((sec, j) => {
						console.log(123123, note.currentSectionIndexWifi, j);
						if (note.currentSectionIndexWifi[j] === -1) {
							return [];
						} else {
							return sec[note.currentSectionIndexWifi[j]].areas;
						}
					});
					console.log(nextPositionsWifi);

					// 三条TRACK分别处理喵
					nextPositionsWifi.forEach((nextPositions, j) => {
						// 如果点了任意一个区域
						if (nextPositions.includes(area.area.name)) {
							if (note.currentSectionIndexWifi[j] === 4) {
								// 如果是最後一个区域，那就设为-1，然後判断其他的是不是也都-1

								if (note.currentLineIndex === noteIns.slideLines?.length! - 1) {
									// 如果是最後一个LINE

									note.currentSectionIndexWifi[j] = -1;

									// 如果三个全是最后一个区域（-1），那么结束
									if (note.currentSectionIndexWifi[0] === -1 && note.currentSectionIndexWifi[1] === -1 && note.currentSectionIndexWifi[2] === -1) {
										// 设置标志位
										showingNotes[i].touched = true;
										showingNotes[i].touchedTime = currentTime;
										showingNotes[i].isTouching = true;

										showingNotes[i].status = -4;

										/** 走完最後一段的时间ms */
										const finalSectionTime = currentLine.remainTime! * (1 - sectionInfoWifi![j][4].start);

										let timeD = noteIns.time - finalSectionTime - currentTime;

										// FAST LATE
										if (timeD >= 0) {
											showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
										} else {
											showingNotes[i].judgeTime = JudgeTimeStatus.Late;
										}

										// TOO FAST GOOD (提前划完)
										if (timeD > finalSectionTime) {
											showingNotes[i].judgeStatus = JudgeStatus.Good;
											showingNotes[i].tooFast = true;
										} else {
											// 正常判断
											// SLIDE TRACK的Perfect判定时间
											const perfectJudgeTime = 14 + finalSectionTime / timerPeriod / 4;

											timeD = abs(timeD);

											if (perfectJudgeTime < 26) {
												// PERFECT GOOD GREAT
												if (timeD <= timerPeriod * perfectJudgeTime) {
													// CRITICAL PERFECT
													showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
												} else if (timeD <= timerPeriod * 26 && timeD > timerPeriod * perfectJudgeTime) {
													// GREAT
													showingNotes[i].judgeStatus = JudgeStatus.Great;
												} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * 26) {
													// GOOD
													showingNotes[i].judgeStatus = JudgeStatus.Good;
												} else {
												}
											} else if (perfectJudgeTime >= 26 && perfectJudgeTime < 36) {
												// PERFECT GOOD GREAT
												if (timeD <= timerPeriod * perfectJudgeTime) {
													// CRITICAL PERFECT
													showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
												} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * perfectJudgeTime) {
													// GOOD
													showingNotes[i].judgeStatus = JudgeStatus.Good;
												} else {
												}
											} else if (perfectJudgeTime >= 36) {
												// PERFECT GOOD GREAT
												if (timeD <= timerPeriod * perfectJudgeTime) {
													// CRITICAL PERFECT
													showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
												} else {
												}
											}
										}
										// game record
										if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
											updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
										}
									}
								} else {
									// 还不是最後一个区域，进入下一个
									note.currentSectionIndexWifi[j] = 0;
									note.currentSectionIndex = 0;
									note.currentSectionIndexWifi = [0, 0, 0];
									note.currentLineIndex++;
								}
							} else {
								// 当前分段位追加
								note.currentSectionIndexWifi[j]++;

								// 跳区机制
								if (note.currentSectionIndexWifi[j] <= sectionInfoWifi![j].length - 2) {
									// 下一个分段信息
									const nextNextPositions = sectionInfoWifi![j][note.currentSectionIndexWifi[j] + 1].areas;
									// 如果已经按住了下个分段的任意一个区域
									for (let i = 0; i < currentTouchingArea.length; i++) {
										if (nextNextPositions.includes(currentTouchingArea[i].area.name)) {
											// 跳区激活
											note.currentSectionIndexWifi[j]++;
											break;
										}
									}
								}
							}
						}
					});
					console.log(note.currentSectionIndexWifi);
				} else {
					// 正常SLIDE TRACK,除了WIFI以外的

					// SLIDE分段信息
					const sectionInfo = section(currentLine.slideType, currentLine.pos!, currentLine.endPos ?? '', currentLine.turnPos);
					console.log(sectionInfo);
					// 可供点击的下一个段的区域
					const nextPositions = sectionInfo![note.currentSectionIndex].areas;
					// 如果点了任意一个区域
					if (nextPositions.includes(area.area.name)) {
						if (note.currentSectionIndex === sectionInfo?.length! - 1) {
							// 如果是最後一个区域
							if (note.currentLineIndex === noteIns.slideLines?.length! - 1) {
								// 如果是最後一个LINE

								note.currentSectionIndex = -1;
								note.currentLineIndex = -1;

								// 设置标志位
								showingNotes[i].touched = true;
								showingNotes[i].touchedTime = currentTime;
								showingNotes[i].isTouching = true;

								showingNotes[i].status = -4;

								/** 走完最後一段的时间ms */
								const finalSectionTime = currentLine.remainTime! * (1 - sectionInfo![sectionInfo?.length! - 1].start);

								let timeD = noteIns.time - finalSectionTime - currentTime;

								console.log('timeD: ', timeD);

								// FAST LATE
								if (timeD >= 0) {
									showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
								} else {
									showingNotes[i].judgeTime = JudgeTimeStatus.Late;
								}

								// TOO FAST GOOD (提前划完)
								if (timeD > finalSectionTime) {
									showingNotes[i].judgeStatus = JudgeStatus.Good;
									showingNotes[i].tooFast = true;
								} else {
									// 正常判断
									// SLIDE TRACK的Perfect判定时间
									const perfectJudgeTime = 14 + finalSectionTime / timerPeriod / 4;
									console.log(timeD, perfectJudgeTime);
									timeD = abs(timeD);

									if (perfectJudgeTime < 26) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else if (timeD <= timerPeriod * 26 && timeD > timerPeriod * perfectJudgeTime) {
											// GREAT
											showingNotes[i].judgeStatus = JudgeStatus.Great;
										} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * 26) {
											// GOOD
											showingNotes[i].judgeStatus = JudgeStatus.Good;
										} else {
										}
									} else if (perfectJudgeTime >= 26 && perfectJudgeTime < 36) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * perfectJudgeTime) {
											// GOOD
											showingNotes[i].judgeStatus = JudgeStatus.Good;
										} else {
										}
									} else if (perfectJudgeTime >= 36) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else {
										}
									}
								}

								// game record
								if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
									updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
								}
							} else {
								// 还不是最後一个区域，进入下一个
								note.currentSectionIndex = 0;
								note.currentLineIndex++;
							}
						} else {
							// 当前分段位追加
							note.currentSectionIndex++;

							// 跳区机制
							if (note.currentSectionIndex <= sectionInfo!.length - 2) {
								// 下一个分段信息
								const nextNextPositions = sectionInfo![note.currentSectionIndex + 1].areas;
								// 如果已经按住了下个分段的任意一个区域
								for (let i = 0; i < currentTouchingArea.length; i++) {
									if (nextNextPositions.includes(currentTouchingArea[i].area.name)) {
										// 跳区激活
										note.currentSectionIndex++;
										break;
									}
								}
							}
						}
					}
				}
			} else {
				// 正常 不是人体蜈蚣
				if (noteIns.slideType === 'w') {
					// 如果是WIFI
					// SLIDE分段信息
					const sectionInfoWifi = section_wifi(noteIns.pos, noteIns.endPos ?? '');
					console.log(sectionInfoWifi);
					// 可供点击的下一个段的区域
					const nextPositionsWifi = sectionInfoWifi.map((sec, j) => {
						console.log(123123, note.currentSectionIndexWifi, j);
						if (note.currentSectionIndexWifi[j] === -1) {
							return [];
						} else {
							return sec[note.currentSectionIndexWifi[j]].areas;
						}
					});
					console.log(nextPositionsWifi);

					// 三条TRACK分别处理喵
					nextPositionsWifi.forEach((nextPositions, j) => {
						// 如果点了任意一个区域
						if (nextPositions.includes(area.area.name)) {
							if (note.currentSectionIndexWifi[j] === 4) {
								// 如果是最後一个区域，那就设为-1，然後判断其他的是不是也都-1
								note.currentSectionIndexWifi[j] = -1;

								// 如果三个全是最后一个区域（-1），那么结束
								if (note.currentSectionIndexWifi[0] === -1 && note.currentSectionIndexWifi[1] === -1 && note.currentSectionIndexWifi[2] === -1) {
									// 设置标志位
									showingNotes[i].touched = true;
									showingNotes[i].touchedTime = currentTime;
									showingNotes[i].isTouching = true;

									showingNotes[i].status = -4;

									/** 走完最後一段的时间ms */
									const finalSectionTime = noteIns.remainTime! * (1 - sectionInfoWifi![j][4].start);

									let timeD = noteIns.time - finalSectionTime - currentTime;

									// FAST LATE
									if (timeD >= 0) {
										showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
									} else {
										showingNotes[i].judgeTime = JudgeTimeStatus.Late;
									}

									// TOO FAST GOOD (提前划完)
									if (timeD > finalSectionTime) {
										showingNotes[i].judgeStatus = JudgeStatus.Good;
										showingNotes[i].tooFast = true;
									} else {
										// 正常判断
										// SLIDE TRACK的Perfect判定时间
										const perfectJudgeTime = 14 + finalSectionTime / timerPeriod / 4;

										timeD = abs(timeD);

										if (perfectJudgeTime < 26) {
											// PERFECT GOOD GREAT
											if (timeD <= timerPeriod * perfectJudgeTime) {
												// CRITICAL PERFECT
												showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
											} else if (timeD <= timerPeriod * 26 && timeD > timerPeriod * perfectJudgeTime) {
												// GREAT
												showingNotes[i].judgeStatus = JudgeStatus.Great;
											} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * 26) {
												// GOOD
												showingNotes[i].judgeStatus = JudgeStatus.Good;
											} else {
											}
										} else if (perfectJudgeTime >= 26 && perfectJudgeTime < 36) {
											// PERFECT GOOD GREAT
											if (timeD <= timerPeriod * perfectJudgeTime) {
												// CRITICAL PERFECT
												showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
											} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * perfectJudgeTime) {
												// GOOD
												showingNotes[i].judgeStatus = JudgeStatus.Good;
											} else {
											}
										} else if (perfectJudgeTime >= 36) {
											// PERFECT GOOD GREAT
											if (timeD <= timerPeriod * perfectJudgeTime) {
												// CRITICAL PERFECT
												showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
											} else {
											}
										}
									}
									// game record
									if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
										updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
									}
								}
							} else {
								// 当前分段位追加
								note.currentSectionIndexWifi[j]++;

								// 跳区机制
								if (note.currentSectionIndexWifi[j] <= sectionInfoWifi![j].length - 2) {
									// 下一个分段信息
									const nextNextPositions = sectionInfoWifi![j][note.currentSectionIndexWifi[j] + 1].areas;
									// 如果已经按住了下个分段的任意一个区域
									for (let i = 0; i < currentTouchingArea.length; i++) {
										if (nextNextPositions.includes(currentTouchingArea[i].area.name)) {
											// 跳区激活
											note.currentSectionIndexWifi[j]++;
											break;
										}
									}
								}
							}
						}
					});
					console.log(note.currentSectionIndexWifi);
				} else {
					// 正常SLIDE TRACK,除了WIFI以外的

					// SLIDE分段信息
					const sectionInfo = section(noteIns.slideType, noteIns.pos, noteIns.endPos ?? '', noteIns.turnPos);
					console.log(note.currentSectionIndex, sectionInfo);

					if (note.currentSectionIndex !== -1) {
						// 如果不是最後一个区域

						// 可供点击的下一个段的区域
						const nextPositions = sectionInfo![note.currentSectionIndex].areas;
						// 如果点了任意一个区域
						if (nextPositions.includes(area.area.name)) {
							if (note.currentSectionIndex === sectionInfo?.length! - 1) {
								// 如果是最後一个区域
								note.currentSectionIndex = -1;

								// 设置标志位
								showingNotes[i].touched = true;
								showingNotes[i].touchedTime = currentTime;
								showingNotes[i].isTouching = true;

								showingNotes[i].status = -4;

								/** 走完最後一段的时间ms */
								const finalSectionTime = noteIns.remainTime! * (1 - sectionInfo![sectionInfo?.length! - 1].start);

								let timeD = noteIns.time - finalSectionTime - currentTime;

								console.log('timeD: ', timeD);

								// FAST LATE
								if (timeD >= 0) {
									showingNotes[i].judgeTime = JudgeTimeStatus.Fast;
								} else {
									showingNotes[i].judgeTime = JudgeTimeStatus.Late;
								}

								// TOO FAST GOOD (提前划完)
								if (timeD > finalSectionTime) {
									showingNotes[i].judgeStatus = JudgeStatus.Good;
									showingNotes[i].tooFast = true;
								} else {
									// 正常判断
									// SLIDE TRACK的Perfect判定时间
									const perfectJudgeTime = 14 + finalSectionTime / timerPeriod / 4;
									console.log(timeD, perfectJudgeTime);
									timeD = abs(timeD);

									if (perfectJudgeTime < 26) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else if (timeD <= timerPeriod * 26 && timeD > timerPeriod * perfectJudgeTime) {
											// GREAT
											showingNotes[i].judgeStatus = JudgeStatus.Great;
										} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * 26) {
											// GOOD
											showingNotes[i].judgeStatus = JudgeStatus.Good;
										} else {
										}
									} else if (perfectJudgeTime >= 26 && perfectJudgeTime < 36) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else if (timeD <= timerPeriod * 36 && timeD > timerPeriod * perfectJudgeTime) {
											// GOOD
											showingNotes[i].judgeStatus = JudgeStatus.Good;
										} else {
										}
									} else if (perfectJudgeTime >= 36) {
										// PERFECT GOOD GREAT
										if (timeD <= timerPeriod * perfectJudgeTime) {
											// CRITICAL PERFECT
											showingNotes[i].judgeStatus = JudgeStatus.CriticalPerfect;
										} else {
										}
									}
								}

								// game record
								if (showingNotes[i].judgeStatus !== JudgeStatus.Miss) {
									updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, false);
								}
							} else {
								// 当前分段位追加
								note.currentSectionIndex++;

								// 跳区机制
								if (note.currentSectionIndex <= sectionInfo!.length - 2) {
									// 下一个分段信息
									const nextNextPositions = sectionInfo![note.currentSectionIndex + 1].areas;
									// 如果已经按住了下个分段的任意一个区域
									for (let i = 0; i < currentTouchingArea.length; i++) {
										if (nextNextPositions.includes(currentTouchingArea[i].area.name)) {
											// 跳区激活
											note.currentSectionIndex++;
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

/** 抬起时的判定 */
export const judge_up = (showingNotes: ShowingNoteProps[], currentSheet: Sheet, currentTime: number, area: TouchArea) => {
	showingNotes.forEach((note, i) => {
		const noteIns = currentSheet.notes[note.noteIndex];

		let timeD = noteIns.time - currentTime;
		switch (noteIns.type) {
			case NoteType.Hold:
				if ((area.area.type === 'K' || area.area.type === 'A') && area.area.id === Number(noteIns.pos)) {
					if (timeD < -timerPeriod * 6 && timeD >= -(noteIns.remainTime! - 12 * timerPeriod)) {
						// 设置标志位
						showingNotes[i].isTouching = false;
						showingNotes[i].holdPress = false;
						showingNotes[i].holdingTime += currentTime - (showingNotes[i].touchedTime ?? 0);
					}
				}
				break;
			case NoteType.TouchHold:
				if (area.area.name === 'C') {
					if (timeD < -timerPeriod * 15 && timeD >= -(noteIns.remainTime! - 12 * timerPeriod)) {
						// 设置标志位
						showingNotes[i].isTouching = false;
						showingNotes[i].holdPress = false;
						showingNotes[i].holdingTime += currentTime - (showingNotes[i].touchedTime ?? 0);
					}

					// 暂停按压声音
					updateRecord(noteIns, note, currentSheet.basicEvaluation, currentSheet.exEvaluation, true, false);
				}
				break;
		}
	});
};
