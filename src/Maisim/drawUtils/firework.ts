import { getTouchCenterCoord } from '../areas';
import { fireworkInnerCircleR, fireworkLength, maimaiScreenR, maimaiSummonLineR } from '../const';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { NoteSound } from '../resourceReaders/noteSoundReader';
import { animation } from './animation';
import { drawRotationImage } from './_base';

const alphaMaxK = 0.5;
/** 烟花特效颜色变换的次数 */
const fireworkChangeTimes = 5;

/** 在指定位置播放烟花动画 */
export const fireworkAt = (pos: string, effectBackCtx: CanvasRenderingContext2D, hasSound: boolean = true) => {
  if (hasSound) {
    // @ts-ignore
    NoteSound.firework.cloneNode().play();
  }

  const [x, y] = getTouchCenterCoord(pos);
  animation(null, fireworkLength, (t: number) => {
    const k = t / fireworkLength;

    // 烟花四散
    drawRotationImage(
      effectBackCtx,
      EffectIcon.Firework,
      x - maimaiScreenR,
      y - maimaiScreenR,
      maimaiScreenR * 2,
      maimaiScreenR * 2,
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
      x - fireworkInnerCircleR / 0.7,
      y - fireworkInnerCircleR / 0.7,
      (fireworkInnerCircleR * 2) / 0.7,
      (fireworkInnerCircleR * 2) / 0.7,
      x,
      y,
      0,
      1 - k
    );
    // 第二亮区
    drawRotationImage(
      effectBackCtx,
      EffectIcon.FireworkInnerCircle,
      x - maimaiSummonLineR * 2 * k ** 0.1,
      y - maimaiSummonLineR * 2 * k ** 0.1,
      maimaiSummonLineR * 2 * 2 * k ** 0.1,
      maimaiSummonLineR * 2 * 2 * k ** 0.1,
      x,
      y,
      0,
      1 - k ** 0.5
    );
    // 中心闪烁
    drawRotationImage(
      effectBackCtx,
      EffectIcon.FireworkCenter,
      x - (fireworkInnerCircleR / 0.7) * ((4 / 3) * (1 - k)),
      y - (fireworkInnerCircleR / 0.7) * ((4 / 3) * (1 - k)),
      ((fireworkInnerCircleR * 2) / 0.7) * ((4 / 3) * (1 - k)),
      ((fireworkInnerCircleR * 2) / 0.7) * ((4 / 3) * (1 - k)),
      x,
      y,
      45 * k,
      1
    );
  });
};
