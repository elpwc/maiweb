import { getPosCenterCoord } from '../areas';
import MaimaiValues from '../maimaiValues';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { NoteSound } from '../resourceReaders/noteSoundReader';
import AnimationUtils from './animation';
import { drawRotationImage } from './_base';

const alphaMaxK = 0.5;
/** 烟花特效颜色变换的次数 */
const fireworkChangeTimes = 5;

/** 在指定位置播放烟花动画 */
export const fireworkAt = (values: MaimaiValues, pos: string, effectBackCtx: CanvasRenderingContext2D, animationFactory: AnimationUtils, hasSound: boolean = true) => {
  if (hasSound) {
    // @ts-ignore
    NoteSound.firework.cloneNode().play();
  }

  const [x, y] = getPosCenterCoord(pos, values);
  animationFactory.animation(null, values.fireworkLength, (t: number) => {
    const k = t / values.fireworkLength;

    // 烟花四散
    drawRotationImage(
      effectBackCtx,
      EffectIcon.Firework,
      x - values.maimaiScreenR,
      y - values.maimaiScreenR,
      values.maimaiScreenR * 2,
      values.maimaiScreenR * 2,
      x,
      y,
      45 * k + (360 / 15) * Math.floor(k * fireworkChangeTimes),
      // alpha = x<k ? x/k : (1-x)/(1-k)
      k < alphaMaxK ? k / alphaMaxK : (1 - k) / (1 - alphaMaxK)
    );
    // 中央亮区
    drawRotationImage(
      effectBackCtx,
      EffectIcon.FireworkInnerCircle,
      x - values.fireworkInnerCircleR / 0.7,
      y - values.fireworkInnerCircleR / 0.7,
      (values.fireworkInnerCircleR * 2) / 0.7,
      (values.fireworkInnerCircleR * 2) / 0.7,
      x,
      y,
      0,
      1 - k
    );
    // 第二亮区
    drawRotationImage(
      effectBackCtx,
      EffectIcon.FireworkInnerCircle,
      x - values.maimaiSummonLineR * 2 * k ** 0.1,
      y - values.maimaiSummonLineR * 2 * k ** 0.1,
      values.maimaiSummonLineR * 2 * 2 * k ** 0.1,
      values.maimaiSummonLineR * 2 * 2 * k ** 0.1,
      x,
      y,
      0,
      1 - k ** 0.5
    );
    // 中心闪烁
    drawRotationImage(
      effectBackCtx,
      EffectIcon.FireworkCenter,
      x - (values.fireworkInnerCircleR / 0.7) * ((4 / 3) * (1 - k)),
      y - (values.fireworkInnerCircleR / 0.7) * ((4 / 3) * (1 - k)),
      ((values.fireworkInnerCircleR * 2) / 0.7) * ((4 / 3) * (1 - k)),
      ((values.fireworkInnerCircleR * 2) / 0.7) * ((4 / 3) * (1 - k)),
      x,
      y,
      45 * k,
      1
    );
  });
};
