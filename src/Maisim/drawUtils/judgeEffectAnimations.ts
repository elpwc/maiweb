import { cos, sin, π } from '../utils/math';
import { getTouchCenterCoord } from '../areas';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { drawRotationImage } from './_base';
import AnimationUtils from './animation';
import MaimaiValues from '../maimaiValues';

/** TAP STAR HOLD TOUCHHOLD结束後的判定特效, TOUCH的不在这里，往下翻有*/
export const JudgeEffectAnimation_Hex_or_Star = (values: MaimaiValues, animationFactory: AnimationUtils, ctx: CanvasRenderingContext2D, pos: string, type: 'hex' | 'star') => {
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

  /** 是不是touch */
  const isTouch = isNaN(Number(pos));
  /** 特效中心坐标 */
  let coord = values.center;
  if (isTouch) {
    coord = getTouchCenterCoord(pos, values);
  }

  /** 外部图案轨道半径 */
  const effectOuterOrbitR = values.maimaiTapR;
  animationFactory.animation(null, values.judgeEffectDuration, (t: number) => {
    const k = t / values.judgeEffectDuration;
    // 中心图案
    const effectR = (3 * values.maimaiTapR - values.maimaiTapR) * k + values.maimaiTapR;
    const effectX = coord[0] - effectR;
    const effectY = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) - effectR;
    // 外部图案
    const effectOuterR = 3 * values.maimaiTapR * k;

    const effectOuterX12 = coord[0] - effectOuterOrbitR + effectOuterOrbitR * cos(k * 2 * π) - effectOuterR;
    const effectOuterX34 = coord[0] + effectOuterOrbitR - effectOuterOrbitR * cos(k * 2 * π) - effectOuterR;

    const effectOuterY13 = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) + effectOuterOrbitR * sin(k * 2 * π) - effectOuterR;
    const effectOuterY24 = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) + effectOuterOrbitR * sin(k * 2 * -π) - effectOuterR;

    /** 开始缓出的时刻所在比例(?) */
    const startEasingTick = 0.7;
    let alpha = 1;
    if (startEasingTick < 1) alpha = (k - 1) / (startEasingTick - 1);
    if (alpha > 1) alpha = 1;

    if (isTouch) {
      drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, undefined, undefined, undefined, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY13, effectOuterR * 2, effectOuterR * 2, undefined, undefined, undefined, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY24, effectOuterR * 2, effectOuterR * 2, undefined, undefined, undefined, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY13, effectOuterR * 2, effectOuterR * 2, undefined, undefined, undefined, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY24, effectOuterR * 2, effectOuterR * 2, undefined, undefined, undefined, alpha);
    } else {
      drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY13, effectOuterR * 2, effectOuterR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX12, effectOuterY24, effectOuterR * 2, effectOuterR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY13, effectOuterR * 2, effectOuterR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45, alpha);
      drawRotationImage(ctx, effectImage, effectOuterX34, effectOuterY24, effectOuterR * 2, effectOuterR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45, alpha);
    }
  });
};

/**
 * HOLD TOUCHHOLD按压时的特效
 * @param ctx
 * @param pos
 * @param noteid 提供这个note的id，在方法内部用来实现动画间隔
 */
export const JudgeEffectAnimation_Circle = (values: MaimaiValues, animationFactory: AnimationUtils, ctx: CanvasRenderingContext2D, pos: string, noteid: number) => {
  let effectImage: HTMLImageElement = EffectIcon.Circle;
  // 特效动画
  /*
  说明
  特效由不断从中心变大的圆环组成，三个为一组，此动画一次播放一组
  */

  /** 是不是touch */
  const isTouch = isNaN(Number(pos));
  /** 特效中心坐标 */
  let coord = values.center;
  if (isTouch) {
    coord = getTouchCenterCoord(pos, values);
  }

  /** 其中一个圆环在一组中从出现到消失所占的时长比例 */
  const lengthK = 0.5;
  animationFactory.animation(noteid.toString(), values.judgeEffectDuration, (t: number) => {
    if (t < lengthK * values.judgeEffectDuration) {
      const k = t / (lengthK * values.judgeEffectDuration);
      const effectR = (3 * values.maimaiTapR - values.maimaiTapR) * k + values.maimaiTapR;
      const effectX = coord[0] - effectR;
      const effectY = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) - effectR;
      if (isTouch) {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45);
      }
    }
    if (t >= ((1 - lengthK) / 2) * values.judgeEffectDuration && t < ((1 - lengthK) / 2 + lengthK) * values.judgeEffectDuration) {
      const k = (t - ((1 - lengthK) / 2) * values.judgeEffectDuration) / (lengthK * values.judgeEffectDuration);
      const effectR = (3 * values.maimaiTapR - values.maimaiTapR) * k + values.maimaiTapR;
      const effectX = coord[0] - effectR;
      const effectY = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) - effectR;
      if (isTouch) {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45);
      }
    }
    if (t >= (1 - lengthK) * values.judgeEffectDuration) {
      const k = (t - (1 - lengthK) * values.judgeEffectDuration) / (lengthK * values.judgeEffectDuration);
      const effectR = (3 * values.maimaiTapR - values.maimaiTapR) * k + values.maimaiTapR;
      const effectX = coord[0] - effectR;
      const effectY = coord[1] - (isTouch ? 0 : values.maimaiJudgeLineR) - effectR;
      if (isTouch) {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2);
      } else {
        drawRotationImage(ctx, effectImage, effectX, effectY, effectR * 2, effectR * 2, coord[0], coord[1], -22.5 + Number(pos) * 45);
      }
    }
  });
};

/** TOUCH结束後的判定特效 */
export const JudgeEffectAnimation_Touch = (values: MaimaiValues, animationFactory: AnimationUtils, ctx: CanvasRenderingContext2D, pos: string) => {
  let effectImageCircle: HTMLImageElement = EffectIcon.TouchEff;
  let effectImage1: HTMLImageElement = EffectIcon.TouchEffStar1;
  let effectImage2: HTMLImageElement = EffectIcon.TouchEffStar2;
  // 特效动画
  /*
  说明
  特效由中心图案和周围的四个图案组成
  */

  const coord = getTouchCenterCoord(pos, values);

  // 内圈星星
  const innerStarR = values.maimaiTapR * 0.2;
  /** 到中心距离 */
  const innerStarS = values.maimaiTapR * 0.5;

  // 外圈星星
  const outerStarR = values.maimaiTapR * 0.35;
  /** 到中心距离初始 */
  const outerStarS1 = values.maimaiTapR * 0.5;
  /** 到中心距离最终 */
  const outerStarS2 = values.maimaiTapR * 1.5;
  animationFactory.animation(
    null,
    values.judgeEffectDuration * 0.8,
    (t: number) => {
      const k = t / (values.judgeEffectDuration * 0.8);

      // 中心圆
      const circleR = values.maimaiTapR * 2 * k;
      const circleX = coord[0] - circleR;
      const circleY = coord[1] - circleR;

      /** 外圈星星到中心距离 */
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
      animationFactory.animation(null, values.judgeEffectDuration * 2, (t: number) => {
        const k = t / (values.judgeEffectDuration * 2);

        // 内圈星星
        const innerStarR = values.maimaiTapR * 0.2 * (1 - k);
        /** 到中心距离 */
        const innerStarS = values.maimaiTapR * 0.5;

        // 外圈星星
        const outerStarR = values.maimaiTapR * 0.35 * (1 - k);
        /** 到中心距离最终 */
        const outerStarS2 = values.maimaiTapR * 1.5;

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
      });
    }
  );
};
