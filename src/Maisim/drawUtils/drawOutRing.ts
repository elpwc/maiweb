import { Area } from '../areas';
import MaimaiValues from '../maimaiValues';
import { cos, sin } from '../utils/math';
import { clearArcFun } from './_base';

export const drawOutRing = (values: MaimaiValues, doShowKeys: boolean, keys: Area[], ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, values.canvasWidth, values.canvasHeight);

  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, values.canvasWidth, values.canvasHeight);

  if (doShowKeys) {
    ctx.beginPath();
    ctx.arc(values.center[0], values.center[1], values.maimaiR, 0, 2 * Math.PI);
    ctx.fillStyle = 'lightgray';
    ctx.fill();
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(values.center[0], values.center[1], values.maimaiScreenR, 0, 2 * Math.PI);
    ctx.strokeStyle = 'gray';
    ctx.stroke();
  }

  clearArcFun(values.center[0], values.center[1], values.maimaiScreenR, ctx);

  if (doShowKeys) {
    keys.forEach(key => {
      // 按钮两侧的线
      ctx.beginPath();
      ctx.lineTo(values.center[0] + values.maimaiR * cos(key.rightAngle! + values.keySideLineDistance), values.center[1] + values.maimaiR * sin(key.rightAngle! + values.keySideLineDistance));
      ctx.lineTo(
        values.center[0] + values.maimaiScreenR * cos(key.rightAngle! + values.keySideLineDistance),
        values.center[1] + values.maimaiScreenR * sin(key.rightAngle! + values.keySideLineDistance)
      );
      ctx.closePath();
      ctx.strokeStyle = '#555555';
      ctx.stroke();

      ctx.beginPath();
      ctx.lineTo(values.center[0] + values.maimaiR * cos(key.leftAngle! - values.keySideLineDistance), values.center[1] + values.maimaiR * sin(key.leftAngle! - values.keySideLineDistance));
      ctx.lineTo(
        values.center[0] + values.maimaiScreenR * cos(key.leftAngle! - values.keySideLineDistance),
        values.center[1] + values.maimaiScreenR * sin(key.leftAngle! - values.keySideLineDistance)
      );
      ctx.closePath();
      ctx.strokeStyle = '#555555';
      ctx.stroke();

      // 螺丝孔
      ctx.beginPath();
      ctx.arc(
        values.center[0] + values.keySideDotRtoCenter * cos(key.leftAngle! - values.keySideDotDistance),
        values.center[1] + values.keySideDotRtoCenter * sin(key.leftAngle! - values.keySideDotDistance),
        values.keySideDotR,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fillStyle = 'gray';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        values.center[0] + values.keySideDotRtoCenter * cos(key.rightAngle! + values.keySideDotDistance),
        values.center[1] + values.keySideDotRtoCenter * sin(key.rightAngle! + values.keySideDotDistance),
        values.keySideDotR,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fillStyle = 'gray';
      ctx.fill();
    });
  }
};
