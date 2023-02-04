import { cos, sin, π } from '../../math';
import { NoteType } from '../../utils/noteType';
import { center, judgeEffectDuration, maimaiJudgeLineR, maimaiTapR } from '../const';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { animation } from './animation';
import { drawRotationImage } from './_base';

export const JudgeEffectAnimation_Hex_or_Star = (ctx: CanvasRenderingContext2D, pausedTotalTime: number, pos: string, type: 'hex' | 'star') => {
  let effectImage: HTMLImageElement;
  if (type === 'hex') {
    effectImage = EffectIcon.Hex;
  } else if (type === 'star') {
    effectImage = EffectIcon.StarYellow;
  }
  // 特效动画
  /*
  说明
  特效由中心图案和周围的四个图案组成
  */

  /** 外部图案轨道半径 */
  const effectOuterOrbitR = maimaiTapR;
  animation(null, pausedTotalTime, judgeEffectDuration, (t: number) => {
    const k = t / judgeEffectDuration;
    // 中心图案
    const effectR = (3 * maimaiTapR - maimaiTapR) * k + maimaiTapR;
    const effectX = center[0] - effectR;
    const effectY = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) - effectR;
    // 外部图案
    const effectOuterR = 3 * maimaiTapR * k;

    const effectOuterX12 = center[0] - effectOuterOrbitR + effectOuterOrbitR * cos(k * 2 * π) - effectOuterR;
    const effectOuterX34 = center[0] + effectOuterOrbitR - effectOuterOrbitR * cos(k * 2 * π) - effectOuterR;

    const effectOuterY13 = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) + effectOuterOrbitR * sin(k * 2 * π) - effectOuterR;
    const effectOuterY24 = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) + effectOuterOrbitR * sin(k * 2 * -π) - effectOuterR;

    if (pos === 'C') {
      drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY13, effectOuterR * 2, effectOuterR * 2);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY24, effectOuterR * 2, effectOuterR * 2);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY13, effectOuterR * 2, effectOuterR * 2);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY24, effectOuterR * 2, effectOuterR * 2);
    } else {
      drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY13, effectOuterR * 2, effectOuterR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY24, effectOuterR * 2, effectOuterR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY13, effectOuterR * 2, effectOuterR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY24, effectOuterR * 2, effectOuterR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
    }
  });
};

export const JudgeEffectAnimation_Circle = (ctx: CanvasRenderingContext2D, pausedTotalTime: number, pos: string, noteid: number) => {
  let effectImage: HTMLImageElement = EffectIcon.Circle;
  // 特效动画
  /*
  说明
  特效由不断从中心变大的圆环组成，三个为一组，此动画一次播放一组
  */

  /** 其中一个圆环在一组中从出现到消失所占的时长比例 */
  const lengthK = 0.5;
  animation(noteid.toString(), pausedTotalTime, judgeEffectDuration, (t: number) => {
    if (t < lengthK * judgeEffectDuration) {
      const k = t / (lengthK * judgeEffectDuration);
      const effectR = (3 * maimaiTapR - maimaiTapR) * k + maimaiTapR;
      const effectX = center[0] - effectR;
      const effectY = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) - effectR;
      if (pos === 'C') {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      }
    }
    if (t >= ((1 - lengthK) / 2) * judgeEffectDuration && t < ((1 - lengthK) / 2 + lengthK) * judgeEffectDuration) {
      const k = (t - ((1 - lengthK) / 2) * judgeEffectDuration) / (lengthK * judgeEffectDuration);
      const effectR = (3 * maimaiTapR - maimaiTapR) * k + maimaiTapR;
      const effectX = center[0] - effectR;
      const effectY = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) - effectR;
      if (pos === 'C') {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      }
    }
    if (t >= (1 - lengthK) * judgeEffectDuration) {
      const k = (t - (1 - lengthK) * judgeEffectDuration) / (lengthK * judgeEffectDuration);
      const effectR = (3 * maimaiTapR - maimaiTapR) * k + maimaiTapR;
      const effectX = center[0] - effectR;
      const effectY = center[1] - (pos === 'C' ? 0 : maimaiJudgeLineR) - effectR;
      if (pos === 'C') {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, center[0], center[1], -22.5 + Number(pos) * 45);
      }
    }
  });
};
