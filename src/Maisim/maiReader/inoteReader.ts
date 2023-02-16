import { abs } from '../../math';
import { Note, Beat, SlideTrack } from '../../utils/note';
import { NoteType } from '../../utils/noteType';
import { Sheet } from '../../utils/sheet';
import { maimaiJudgeLineR, maimaiSummonLineR, maimaiTapR } from '../const';
import { getJudgeDirectionParams } from '../slideTracks/judgeDirection';
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
    .map(line => {
      if (line.substring(0, 2) !== '||' || line === 'E') {
        return line;
      }
    })
    .join('');

  //所有note
  /**
   * 分割後根据节拍排序的所有Note文本。
   * 结构例：
   * [[''], ['A1h[4:1]'], ['D5h[4:1]'], ['1b'], ['5'], ['4'], ['6'], [''], ['5', '6'], ['5', '7'], ['5', '8'], ['1', '5'], ['3', '4']]
   */
  const allNotes: string[][] = inote
    .replaceAll('\n', '')
    .replaceAll('\r', '')
    .replaceAll('\t', '')
    // 伪EACH
    .replaceAll('`', '`速')
    .split(/,|`/)
    .map(e => {
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

    // 读入和消除(){}
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

    //处理每一组Note
    // （第二次谱面处理）
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
              slideLineDirectionParams: slideTrack.isChain
                ? getJudgeDirectionParams(
                    slideTrack.slideLines![slideTrack.slideLines?.length! - 1].endPos ?? '',
                    slideTrack.slideLines![slideTrack.slideLines?.length! - 1].pos ?? '',
                    slideTrack.slideLines![slideTrack.slideLines?.length! - 1].turnPos ?? '',
                    slideTrack.slideLines![slideTrack.slideLines?.length! - 1].slideType ?? ''
                  )
                : getJudgeDirectionParams(slideTrack.endPos ?? '', res.pos, slideTrack.turnPos ?? '', slideTrack.slideType ?? ''),
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
        return notesRes[noteIndex].type !== NoteType.Touch && notesRes[noteIndex].type !== NoteType.TouchHold;
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

  return { beats: beatRes, notes: notesRes };
};

/**
 * 第三次谱面处理，根据当前谱面流速计算各个受流速影响的属性
 * 根据速度计算emergeTime, moveTime, guideStarEmergeTime
 * 判断所有黄色SLIDE TRACK
 * @param notesOri
 * @returns
 */
export const calculate_speed_related_params_for_notes = (notesOri: Note[], tapMoveSpeed: number, tapEmergeSpeed: number, speed: number, currentSheet: Sheet) => {
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
    if (note.type === NoteType.SlideTrack) {
      const emergingTime = (maimaiJudgeLineR - maimaiSummonLineR) / (tapMoveSpeed * speed);
      notes[i].moveTime = note.time - note.remainTime!;
      notes[i].emergeTime = note.time - note.remainTime! - note.stopTime! - emergingTime;
      notes[i].guideStarEmergeTime = note.time - note.remainTime! - note.stopTime!;
    } else {
      const emergingTime = maimaiTapR / (tapEmergeSpeed * speed);
      const movingTime = (maimaiJudgeLineR - maimaiSummonLineR) / (tapMoveSpeed * speed);
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
