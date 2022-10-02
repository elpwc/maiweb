import { abs } from '../../math';
import { Note, Beat, SlideTrack } from '../../utils/note';
import { NoteType } from '../../utils/noteType';
import { fireworkLength } from '../const';
// 仅仅用来计算分段数量
import { section } from '../slideTracks/section';
import { analyse_note_original_data } from './noteStrAnalyser';

/**
 * 读取maimaiDX谱面文件的inote属性
 * @param inoteOri inote内容
 * @returns
 */
export const read_inote = (inoteOri: string): { notes: Note[]; beats: Beat[] } => {
	let currentBPM: number = 0;
	let currentNoteNumber: number = 0;

	let beatRes: Beat[] = [];
	let notesRes: Note[] = [];

	let inote = inoteOri;

	//清除空格Tab
	inote = inote.replaceAll(' ', '').replaceAll('\t', '');

	//清除注释和结束符
	inote = inote
		.split('\n')
		.map((line) => {
			if (line.substring(0, 2) !== '||' || line === 'E') {
				return line;
			}
		})
		.join('');

	//所有note
	const allNotes: string[][] = inote
		.replaceAll('\n', '')
		.replaceAll('\r', '')
		// 伪EACH
		.replaceAll('`', '`速')
		.split(/,|`/)
		.map((e) => {
			if (e.includes('(') || e.includes('{')) {
				// 针对 (4)12 这样的情况（即简写的TAP EACH前带了拍数或BPM变换）
				let endpos1 = e.lastIndexOf('}');
				const endpos2 = e.lastIndexOf(')');
				if (endpos2 > endpos1) endpos1 = endpos2;
				const notesdata = e.substring(endpos1 + 1, e.length);
				if (/^[0-9]+$/.test(notesdata)) {
					//连续数字为TAP EACH
					const tempRes = notesdata.split('');
					tempRes[0] = e.substring(0, endpos1 + 1) + tempRes[0];
					return tempRes;
				} else {
					//EACH
					return e.split('/');
				}
			} else {
				if (/^[0-9]+$/.test(e)) {
					//连续数字为TAP EACH
					return e.split('');
				} else {
					//EACH
					return e.split('/');
				}
			}
		});

	let currentTime: number = 0;

	/** 上一拍所有TOUCH的位置，用来处理多TOUCH白线 */
	let lastlastTouch: { index: number; pos: string }[] = [];
	let lastTouch: { index: number; pos: string }[] = [];

	let serial: number = 0;

	//处理所有
	allNotes.forEach((noteGroup: string[], index) => {
		// 一次处理一个拍的
		let beatT: Beat = {
			//notes: [],
			notevalue: 0,
			bpm: 0,
			time: currentTime,
			noteIndexes: [],
		};

		// (){}
		const bpmSign = noteGroup[0].indexOf('(');

		if (bpmSign > -1) {
			currentBPM = Number(noteGroup[0].substring(bpmSign + 1, noteGroup[0].indexOf(')')));
			noteGroup[0] = noteGroup[0].substring(0, noteGroup[0].indexOf('(')) + noteGroup[0].substring(noteGroup[0].indexOf(')') + 1, noteGroup[0].length);
		}

		const noteSign = noteGroup[0].indexOf('{');
		if (noteSign > -1) {
			if (noteGroup[0].substring(noteSign, noteSign + 1) === '#') {
				const second = Number(noteGroup[0].substring(noteSign + 2, noteGroup[0].indexOf('}')));
				currentNoteNumber = 240 / (currentBPM * second);
			} else {
				currentNoteNumber = Number(noteGroup[0].substring(noteSign + 1, noteGroup[0].indexOf('}')));
			}
			noteGroup[0] = noteGroup[0].substring(0, noteGroup[0].indexOf('{')) + noteGroup[0].substring(noteGroup[0].indexOf('}') + 1, noteGroup[0].length);
		}

		beatT.bpm = currentBPM;
		beatT.notevalue = currentNoteNumber;
		beatT.time = currentTime;

		let isNiseEach = false;

		//处理一组Note
		// （二次处理）
		noteGroup.forEach((noteStr: string) => {
			// 一次处理一拍里的一个
			/** 要加入Notes列表的note */
			const res: Note | null = analyse_note_original_data(noteStr, index, currentBPM);
			//console.log(res);

			isNiseEach = res?.isNiseEach ?? false;
			if (res?.isNiseEach) {
				beatT.time = beatRes[beatRes.length - 1].time + 3 / currentBPM;
			}

			if (noteGroup.length > 1 && res) {
				res.isEach = true;
			}

			// 终止标记
			if (noteStr === 'E' && res) {
				res.type = NoteType.EndMark;
			}

			if (res !== null) {
				res.beatIndex = beatRes.length;
				res.time = beatT.time;
				res.bpm = beatT.bpm;
				res.partnotevalue = beatT.notevalue;

				// 处理前的type
				const foreType = res.type;

				// 处理伪TAP 伪SLIDE
				if (res.isStarTap) {
					res.type = NoteType.Slide;
				}
				if (res.isTapStar) {
					res.type = NoteType.Tap;
				}

				// 处理好的res加入Notes列表
				// 并分离掉？！SLIDE的头
				if (!(res.isNoTapSlide || res.isNoTapNoTameTimeSlide)) {
					res.serial = serial;
					notesRes.push(res);
					serial++;
					beatT.noteIndexes.push(notesRes.length - 1);
				}

				// 加入SLIDE TRACK
				if (foreType === NoteType.Slide) {
					res.slideTracks?.forEach((slideTrack: SlideTrack) => {
						const tempSlideTrackNote: Note = {
							index: res.index,
							serial,
							pos: res.pos,
							type: NoteType.SlideTrack,
							beatIndex: -1,
							partnotevalue: res.partnotevalue,
							bpm: res.bpm,
							time: res.time + slideTrack.stopTime! + slideTrack.remainTime!,
							slideType: slideTrack.slideType,
							endPos: slideTrack.endPos,
							turnPos: slideTrack.turnPos,
							/**  ため時間 */
							stopTime: slideTrack.stopTime,
							remainTime: slideTrack.remainTime,
							notenumber: slideTrack.notenumber,
							notevalue: slideTrack.notevalue,
							isEach: res.slideTracks!.length > 1,
							isBreak: res.isSlideTrackBreak,
							isTapStar: res.isTapStar,
							isStarTap: res.isStarTap,
							isNoTapSlide: res.isNoTapSlide,
							isNoTapNoTameTimeSlide: res.isNoTapNoTameTimeSlide,
							sectionCount: slideTrack.slideType === 'w' ? 5 : section(slideTrack.slideType, res.pos, slideTrack.endPos!, slideTrack.turnPos)?.length,
							isChain: slideTrack.isChain,
							slideLines: slideTrack.slideLines,
						};

						notesRes.push(tempSlideTrackNote);
						serial++;
					});
				}

				if (res.isFirework) {
					const tempFirework: Note = {
						index: res.index,
						serial,
						pos: res.pos,
						type: NoteType.FireWork,
						beatIndex: -1,
						partnotevalue: res.partnotevalue,
						bpm: res.bpm,
						emergeTime: -1, // 在index读入时根据触发Touch的emergeTime初始化
						time: res.time + (res.type === NoteType.TouchHold ? res.remainTime ?? 0 : 0) + fireworkLength,
						remainTime: 0, // 在index读入时根据触发Touch的emergeTime初始化
						fireworkTriggerIndex: res.serial,
					};

					notesRes[notesRes.length - 1].fireworkTriggerIndex = serial;

					notesRes.push(tempFirework);
					serial++;
				}
			}
		});

		// 处理TOUCH GROUP
		const touchgroup = beatT.noteIndexes.filter((index) => {
			return notesRes[index].type === NoteType.Touch;
		});
		let touchCount: number = touchgroup.length;
		if (touchCount > 2) {
			beatT.touchGroupStatus = [];
			beatT.touchGroupTouched = 0;

			touchgroup.forEach((index) => {
				notesRes[index].inTouchGroup = true;
				beatT.touchGroupStatus!.push(index);
			});
		}

		// 处理多TOUCH白线
		const currentTouch = beatT.noteIndexes
			.map((noteIndex) => {
				if (notesRes[noteIndex].type === NoteType.Touch || notesRes[noteIndex].type === NoteType.TouchHold) {
					// 下面pos後面还加了type是为了区分TouchHold和Touch，不然同样的位置Touch後面还接了TouchHold就会，嗯！
					return { index: noteIndex, pos: notesRes[noteIndex].pos + notesRes[noteIndex].type.toString() };
				} else {
					return { index: -1, pos: '' };
				}
			})
			.filter((t) => {
				return t.index !== -1;
			});
		lastTouch.forEach((touch1) => {
			currentTouch.forEach((touch2) => {
				if (touch1.pos === touch2.pos) {
					notesRes[touch1.index].touchCount = 1;
				}
			});
		});
		lastlastTouch.forEach((touch0) => {
			lastTouch.forEach((touch1) => {
				currentTouch.forEach((touch2) => {
					if (touch0.pos === touch1.pos && touch1.pos === touch2.pos) {
						notesRes[touch0.index].touchCount = 2;
					}
				});
			});
		});
		// 更新上个节拍的所有TOUCH和上上个节拍的TOUCH位置
		lastlastTouch = lastTouch;
		lastTouch = beatT.noteIndexes
			.map((noteIndex) => {
				if (notesRes[noteIndex].type === NoteType.Touch || notesRes[noteIndex].type === NoteType.TouchHold) {
					return { index: noteIndex, pos: notesRes[noteIndex].pos + notesRes[noteIndex].type.toString() };
				} else {
					return { index: -1, pos: '' };
				}
			})
			.filter((t) => {
				return t.index !== -1;
			});

		// 设置eachPairDistance, isEachPairFirst
		// 画EACH pair的黄线要用
		if (beatT.noteIndexes.length > 1) {
			/** 除了TOUCH TOUCH HOLD的Note的index，大于1的话就喵 */
			let tapIndexes = [];
			tapIndexes = beatT.noteIndexes.filter((noteIndex) => {
				return notesRes[noteIndex].type !== NoteType.Touch && notesRes[noteIndex].type !== NoteType.TouchHold;
			});

			if (tapIndexes.length > 1) {
				// Pos最大最小的note
				let eachPairPosMin = 9;
				let eachPairPosMax = -1;
				let eachPairPosMinIndex: number = -1;
				let eachPairPosMaxIndex: number = -1;
				tapIndexes.forEach((noteIndex) => {
					const noteIns = notesRes[noteIndex];
					if (Number(noteIns.pos) >= eachPairPosMax) {
						eachPairPosMax = Number(noteIns.pos);
						eachPairPosMaxIndex = noteIndex;
					}
					if (Number(noteIns.pos) <= eachPairPosMin) {
						eachPairPosMin = Number(noteIns.pos);
						eachPairPosMinIndex = noteIndex;
					}
				});
				/** 最大最小的Note间的距离 */
				let eachPairDistance = abs(eachPairPosMax - eachPairPosMin);
				if (eachPairDistance > 4) {
					eachPairDistance = 8 - eachPairDistance;

					notesRes[eachPairPosMaxIndex].eachPairDistance = eachPairDistance;
					notesRes[eachPairPosMaxIndex].isEachPairFirst = true;
				} else {
					notesRes[eachPairPosMinIndex].eachPairDistance = eachPairDistance;
					notesRes[eachPairPosMinIndex].isEachPairFirst = true;
				}
			}
		}

		beatRes.push(beatT);

		if (!isNiseEach) {
			currentTime += (240 / beatT.notevalue / beatT.bpm) * 1000;
		}
	});

	// 排序
	beatRes.sort((a: Beat, b: Beat) => {
		return a.time - b.time;
	});

	console.log(beatRes, notesRes);

	return { beats: beatRes, notes: notesRes };
};
