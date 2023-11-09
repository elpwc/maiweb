import { abs, isANumber } from '../utils/math';
import { getJudgeDirectionParams } from '../slideTracks/judgeDirection';
// 仅仅用来计算分段数量
import { section, section_wifi } from '../slideTracks/section';
import { FlipMode } from '../utils/types/flipMode';
import { analyse_note_original_data } from './noteStrAnalyser';
import { Note, Beat, SlideTrack, SlideLine } from '../utils/note';
import { NoteType, isTouchNoteType } from '../utils/types/noteType';
import { Sheet } from '../utils/sheet';
import MaimaiValues from '../maimaiValues';
import { ChartError } from '../utils/chartError';
import { ErrorJudgeMode } from '../utils/types/errorJudgeMode';
import { ChartErrorType } from '../utils/types/chartErrorType';

/**
 * 读取maimaiDX谱面文件的inote属性
 * @param inoteOri inote内容
 * @param globalBpm 谱面文件属性里的全局bpm，可以不填，只是万一谱面前面没加(bpm)的话，就会参考这个
 * @returns 返回这个谱面里的音符列表和节拍列表
 */
export const read_inote = (
  inoteOri: string,
  globalBpm?: number,
  flipMode: FlipMode = FlipMode.None,
  errorJudgeMode: ErrorJudgeMode = ErrorJudgeMode.Default
): { notes: Note[]; beats: Beat[]; errors: ChartError[] } => {
  /** 当下处理的这一拍的BPM */
  let currentBPM: number = 0;
  /** 当下处理的这一拍的拍数 */
  let currentNoteNumber: number = 0;

  let beatRes: Beat[] = [];
  let notesRes: Note[] = [];
  let errorRes: ChartError[] = [];

  let inote = inoteOri;

  //清除空格Tab
  inote = inote.replaceAll(' ', '').replaceAll('\t', '').replaceAll('　', '');

  //清除注释和结束符
  inote = inote
    .split('\n')
    .map(line => {
      if (line.substring(0, 2) !== '||' /* 注释 */ || line === 'E') {
        return line;
      } else {
        return '';
      }
    })
    .join('');

  /** 处理带/的语句，包括/中的连续数字写法也会顺便处理 */
  const each_process = (e: string) => {
    let resEachNotes: string[] = [];
    e.split('/').forEach((eachNote: string) => {
      if (/^[0-9]+$/.test(eachNote)) {
        resEachNotes = [...resEachNotes, ...eachNote.split('')];
      } else {
        resEachNotes.push(eachNote);
      }
    });
    return resEachNotes;
  };

  //所有note
  /**
   * 分割後根据节拍排序的所有Note文本。
   * 结构例：
   * [[''], ['A1h[4:1]'], ['D5h[4:1]'], ['1b'], ['5'], ['4'], ['6'], [''], ['5', '6'], ['5', '7'], ['5', '8'], ['1', '5'], ['3', '4']]
   */
  const allNotes: string[][] = inote
    .replaceAll('\n', '')
    .replaceAll('\r', '')
    // 疑似EACH。把[`]替换为[,速]，变成普通的两个节拍，仅仅留下[速]作为标识
    // 因为考虑到未来谱面的新Note可能会使用其他字母，所以这里使用汉字做转义符
    .replaceAll('`', ',速')
    // 分离所有节拍
    .split(',')
    .map(e => {
      if (e.substring(0, 1) === '(' || e.substring(0, 1) === '{') {
        // 针对 (4)12 这样的情况（即简写的TAP EACH前带了拍数或BPM变换）
        let endpos1 = e.indexOf('}');
        const endpos2 = e.indexOf(')');
        if (endpos2 > endpos1) endpos1 = endpos2;
        const notesdata = e.substring(endpos1 + 1, e.length);
        if (/^[0-9]+$/.test(notesdata)) {
          //连续数字为TAP EACH
          const tempRes = notesdata.split('');
          tempRes[0] = e.substring(0, endpos1 + 1) + tempRes[0];
          return tempRes;
        } else {
          //EACH
          const tempRes = each_process(notesdata);
          tempRes[0] = e.substring(0, endpos1 + 1) + tempRes[0];
          return tempRes;
        }
      } else {
        if (/^[0-9]+$/.test(e)) {
          //连续数字为TAP EACH
          return e.split('');
        } else {
          //EACH
          return each_process(e);
        }
      }
    });
  /** 当前处理的节拍在谱面中从0开始的时间 ms */
  let currentTime: number = 0;
  /** Note唯一标识，递增 */
  let serial: number = 0;

  //处理所有
  allNotes.forEach((noteGroup: string[], index) => {
    // 一次处理一个拍的
    /** 容纳当前处理的节拍 */
    let beatT: Beat = {
      //notes: [],
      notevalue: 0,
      bpm: 0,
      time: currentTime,
      noteIndexes: [],
    };

    // 读入和消除(){}
    const bpmSign = noteGroup[0].indexOf('(');

    if (bpmSign > -1) {
      if (bpmSign === 0 || (bpmSign > 0 && noteGroup[0].substring(bpmSign - 1, bpmSign) !== '#' && noteGroup[0].substring(bpmSign - 1, bpmSign) !== '@')) {
        currentBPM = Number(noteGroup[0].substring(bpmSign + 1, noteGroup[0].indexOf(')')));
        noteGroup[0] = noteGroup[0].substring(0, noteGroup[0].indexOf('(')) + noteGroup[0].substring(noteGroup[0].indexOf(')') + 1, noteGroup[0].length);
      }
    } else {
      if (index === 0) {
        if (globalBpm === undefined) {
          // throw new Error('当前谱面没有指定BPM');
          errorRes.push({ errorType: ChartErrorType.BPM_not_set, row: -1, col: -1 } as ChartError);
        } else {
          currentBPM = globalBpm;
        }
      }
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
    } else {
      if (index === 0) {
        // throw new Error('当前谱面没有指定节拍');
        errorRes.push({ errorType: ChartErrorType.BPM_not_set, row: -1, col: -1 } as ChartError);
      }
    }

    beatT.bpm = currentBPM;
    beatT.notevalue = currentNoteNumber;
    beatT.time = currentTime;

    let isNiseEach = false;

    //处理每一组Note
    // （第二次谱面处理）
    noteGroup.forEach((noteStr: string) => {
      // 一次处理一拍里的一个
      /** 要加入Notes列表的note */
      const res: Note | null = analyse_note_original_data(noteStr, index, currentBPM, flipMode);
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
        if (!(res.isNoTapSlide || res.isNoTapNoTameTimeSlide || res.type === NoteType.Empty)) {
          res.serial = serial;
          notesRes.push(res);
          serial++;
          beatT.noteIndexes.push(notesRes.length - 1);
        }

        // 加入SLIDE TRACK
        if (foreType === NoteType.Slide || foreType === NoteType.Spec_TouchSlide) {
          res.slideTracks?.forEach((slideTrack: SlideTrack) => {
            const tempSlideTrackNote: Note = {
              index: res.index,
              serial,
              slideTapSerial: res.serial,
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
              isEx: res.isSlideTrackEx,
              isInvisible: res.isSlideTrackInvisible,
              isGhost: res.isSlideTrackGhost,
              isTapStar: res.isTapStar,
              isStarTap: res.isStarTap,
              isNoTapSlide: res.isNoTapSlide,
              isNoTapNoTameTimeSlide: res.isNoTapNoTameTimeSlide,
              isChain: slideTrack.isChain,
              slideLines: slideTrack.slideLines,
              doSpecJudge: !(isANumber(res.pos) && isANumber(res.endPos)),
            };

            notesRes.push(tempSlideTrackNote);
            serial++;
          });
        }
      }
    });

    // 处理TOUCH GROUP
    const touchgroup = beatT.noteIndexes.filter(index => {
      return notesRes[index].type === NoteType.Touch;
    });
    let touchCount: number = touchgroup.length;
    if (touchCount > 2) {
      beatT.touchGroupStatus = [];
      beatT.touchGroupTouched = 0;

      touchgroup.forEach(index => {
        notesRes[index].inTouchGroup = true;
        beatT.touchGroupStatus!.push(index);
      });
    }

    // 设置eachPairDistance, isEachPairFirst
    // 画EACH pair的黄线要用
    if (beatT.noteIndexes.length > 1) {
      /** 除了TOUCH TOUCH HOLD的Note的index，大于1的话就喵 */
      let tapIndexes = [];
      tapIndexes = beatT.noteIndexes.filter(noteIndex => {
        return !isTouchNoteType(notesRes[noteIndex].type);
      });

      if (tapIndexes.length > 1) {
        // Pos最大最小的note
        let eachPairPosMin = 9;
        let eachPairPosMax = -1;
        let eachPairPosMinIndex: number = -1;
        let eachPairPosMaxIndex: number = -1;
        tapIndexes.forEach(noteIndex => {
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

  // 如果沒有EndMark，在这里加入
  if (notesRes.length === 0 /* 谱面空白的情况 */ || notesRes[notesRes.length - 1].type !== NoteType.EndMark) {
    notesRes.push({
      /** 顺序 (实际好像没用过？) */
      index: -1,
      serial: serial + 1,
      pos: 'E',
      type: NoteType.EndMark,
      /** 在beats中的索引 */
      beatIndex: beatRes.length,
      /** 这一段的节拍 */
      partnotevalue: currentNoteNumber,
      /** 这一段的BPM */
      bpm: currentBPM,
      /** 这个Note应当被判定的时间 */
      time: currentTime,
    });
    beatRes.push({
      notevalue: currentNoteNumber,
      bpm: currentBPM,
      time: currentTime,
      noteIndexes: [notesRes.length - 1],
    });
  }

  return { beats: beatRes, notes: notesRes, errors: errorRes };
};

/**
 * 第三次谱面处理，根据当前谱面流速计算各个受流速影响的属性
 * 根据速度计算emergeTime, moveTime, guideStarEmergeTime
 * 判断所有黄色SLIDE TRACK
 * @param notesOri
 * @returns
 */
export const calculate_speed_related_params_for_notes = (
  values: MaimaiValues,
  notesOri: Note[],
  tapMoveSpeed: number,
  tapEmergeSpeed: number,
  speedTap: number,
  speedTouch: number,
  slideTrackOffset: number,
  currentSheet: Sheet
) => {
  /** 在计算多TOUCH白线时存储和累加每个TOUCH TOUCHHOLD重叠的数量 */
  interface TouchInfo {
    /** TOUCH的可唯一标识id */
    touchId: number;
    type: NoteType;
    pos: string;
    /** 判定的时刻 */
    endTick: number;
    overlapCount: number;
  }

  /** TOUCH重叠判定库，记录各个TOUCH TOUCHHOLD的重叠数量 */
  const touchInfos: TouchInfo[] = [];

  /** 为Notes计算浮现的时机 */
  const notes = notesOri;
  notes.forEach((note: Note, i: number) => {
    // 为SLIDE TRACK计算和添加与控件尺寸有关的属性
    if (note.type === NoteType.SlideTrack) {
      const sections = note.slideType === 'w' ? section_wifi(note.pos, note.endPos!) : section(note.slideType, values, note.pos, note.endPos!, note.turnPos);
      note.sections = sections;
      note.sectionCount = note.slideType === 'w' ? 5 : sections?.length;
      note.slideLineDirectionParams = note.isChain
        ? getJudgeDirectionParams(
            note.slideLines![note.slideLines?.length! - 1].endPos ?? '',
            note.slideLines![note.slideLines?.length! - 1].pos ?? '',
            note.slideLines![note.slideLines?.length! - 1].turnPos ?? '',
            note.slideLines![note.slideLines?.length! - 1].slideType ?? '',
            values
          )
        : getJudgeDirectionParams(note.endPos ?? '', note.pos, note.turnPos ?? '', note.slideType ?? '', values);

      if (note.isChain) {
        note.slideLines?.forEach((slideLine: SlideLine, slideLineIndex: number) => {
          const sections_slideLine =
            slideLine.slideType === 'w'
              ? section_wifi(slideLineIndex === 0 ? note.pos : note.slideLines![slideLineIndex - 1].endPos!, slideLine.endPos!)
              : section(slideLine.slideType, values, slideLineIndex === 0 ? note.pos : note.slideLines![slideLineIndex - 1].endPos!, slideLine.endPos!, slideLine.turnPos);
          slideLine.sections = sections_slideLine;
        });
      }
    }

    // 为TOUCH和TOUCH以外设置不同的速度
    let speed = 0;
    if (note.type === NoteType.Touch || note.type === NoteType.TouchHold) {
      speed = speedTouch;
    } else {
      speed = speedTap;
    }

    if (note.type === NoteType.SlideTrack) {
      const emergingTime = (values.maimaiJudgeLineR - values.maimaiSummonLineR) / (tapMoveSpeed * speed);
      notes[i].moveTime = note.time - note.remainTime!;
      notes[i].emergeTime = note.time - note.remainTime! - note.stopTime! - emergingTime + emergingTime * slideTrackOffset;
      notes[i].guideStarEmergeTime = note.time - note.remainTime! - note.stopTime!;
    } else {
      const emergingTime = values.maimaiTapR / (tapEmergeSpeed * speed);
      const movingTime = (values.maimaiJudgeLineR - values.maimaiSummonLineR) / (tapMoveSpeed * speed);
      notes[i].moveTime = note.time - movingTime;
      notes[i].emergeTime = note.time - movingTime - emergingTime;

      // 计算重叠TOUCH白框
      if (note.type === NoteType.Touch || note.type === NoteType.TouchHold) {
        // 遍历已经所有TOUCH TOUCHHOLD，判断有几个和note重叠的
        touchInfos.forEach((touchInfo: TouchInfo, j: number) => {
          // 判断是否重叠
          if (touchInfo.type === note.type && touchInfo.pos === note.pos && touchInfo.endTick > note.emergeTime!) {
            // 重叠的话，之前重叠的那个TOUCH（touchInfo）的重叠数++
            touchInfo.overlapCount++;

            // 内层
            if (touchInfo.overlapCount === 1) {
              if (note.isEach) {
                notes[touchInfo.touchId].innerTouchOverlap = 2;
              } else {
                notes[touchInfo.touchId].innerTouchOverlap = 1;
              }
            }

            // 外层
            if (touchInfo.overlapCount === 2) {
              if (note.isEach) {
                notes[touchInfo.touchId].outerTouchOverlap = 2;
              } else {
                notes[touchInfo.touchId].outerTouchOverlap = 1;
              }
            }
          }
        });

        // 把现在这个TOUCH推进判定库
        touchInfos.push({
          touchId: i,
          type: note.type,
          pos: note.pos,
          endTick: note.time,
          overlapCount: 0,
        });
      }
    }

    // isEach for SLIDE TRACK
    notes.forEach((note2, j) => {
      if (note.type === NoteType.SlideTrack && note2.type === NoteType.SlideTrack && i !== j && abs((note.emergeTime ?? 0) - (note2.emergeTime ?? 0)) <= 0.0000005) {
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
