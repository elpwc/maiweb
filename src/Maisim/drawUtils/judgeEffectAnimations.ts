import { cos, sin, π } from '../../math';
import { getTouchCenterCoord } from '../areas';
import { center, judgeEffectDuration, maimaiJudgeLineR, maimaiTapR } from '../const';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { animation } from './animation';
import { drawRotationImage } from './_base';

/** TAP STAR HOLD TOUCHHOLD结束後的判定特效 */
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

/**
 * HOLD TOUCHHOLD按压时的特效
 * @param ctx
 * @param pausedTotalTime
 * @param pos
 * @param noteid 提供这个note的id，在方法内部用来实现动画间隔
 */
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

/** TOUCH结束後的判定特效 */
export const JudgeEffectAnimation_Touch = (ctx: CanvasRenderingContext2D, pausedTotalTime: number, pos: string) => {
  let effectImageCircle: HTMLImageElement = EffectIcon.TouchEff;
  let effectImage1: HTMLImageElement = EffectIcon.TouchEffStar1;
  let effectImage2: HTMLImageElement = EffectIcon.TouchEffStar2;
  // 特效动画
  /*
  说明
  特效由中心图案和周围的四个图案组成
  */

  const coord = getTouchCenterCoord(pos);
  animation(
    null,
    pausedTotalTime,
    judgeEffectDuration * 0.8,
    (t: number) => {
      const k = t / (judgeEffectDuration * 0.8);

      // 中心圆
      const circleR = maimaiTapR * 2 * k;
      const circleX = coord[0] - circleR;
      const circleY = coord[1] - circleR;

      // 内圈星星
      const innerStarR = maimaiTapR * 0.2;
      /** 到中心距离 */
      const innerStarS = maimaiTapR * 0.5;

      // 外圈星星
      const outerStarR = maimaiTapR * 0.35;
      /** 到中心距离初始 */
      const outerStarS1 = maimaiTapR * 0.5;
      /** 到中心距离最终 */
      const outerStarS2 = maimaiTapR * 1.5;
      /** 到中心距离 */
      const outerStarS = (outerStarS2 - outerStarS1) * k + outerStarS1;

      drawRotationImage(ctx, effectImageCircle, circleX, circleY, circleR * 2, circleR * 2, undefined, undefined, undefined, 1 - k);
      for (let i = 0; i < 8; i++) {
        drawRotationImage(
          ctx,
          i % 2 === 1 ? effectImage1 : effectImage2,
          coord[0] - outerStarR,
          coord[1] - outerStarR - outerStarS,
          outerStarR * 2,
          outerStarR * 2,
          coord[0],
          coord[1],
          -22.5 + i * 45
        );
        drawRotationImage(
          ctx,
          i % 2 === 1 ? effectImage1 : effectImage2,
          coord[0] - outerStarR,
          coord[1] - outerStarR - innerStarS,
          innerStarR * 2,
          innerStarR * 2,
          coord[0],
          coord[1],
          -22.5 + i * 45
        );
      }
    },
    0,
    () => {
      animation(
        null,
        pausedTotalTime,
        judgeEffectDuration * 2,
        (t: number) => {
          const k = t / (judgeEffectDuration * 2);

          // 内圈星星
          const innerStarR = maimaiTapR * 0.2 * (1 - k);
          /** 到中心距离 */
          const innerStarS = maimaiTapR * 0.5;

          // 外圈星星
          const outerStarR = maimaiTapR * 0.35 * (1 - k);
          /** 到中心距离最终 */
          const outerStarS2 = maimaiTapR * 1.5;

          for (let i = 0; i < 8; i++) {
            drawRotationImage(
              ctx,
              i % 2 === 1 ? effectImage1 : effectImage2,
              coord[0] - outerStarR,
              coord[1] - outerStarR - outerStarS2,
              outerStarR * 2,
              outerStarR * 2,
              coord[0],
              coord[1],
              -22.5 + i * 45
            );
            drawRotationImage(
              ctx,
              i % 2 === 1 ? effectImage1 : effectImage2,
              coord[0] - outerStarR,
              coord[1] - outerStarR - innerStarS,
              innerStarR * 2,
              innerStarR * 2,
              coord[0],
              coord[1],
              -22.5 + i * 45
            );
          }
        },
        0,
        () => {
          console.log(114514);
        }
      );
    }
  );
};