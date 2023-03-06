import { cos, sin } from '../utils/math';
import { keys } from '../areas';
import { canvasHeight, canvasWidth, center, keySideDotDistance, keySideDotR, keySideDotRtoCenter, keySideLineDistance, maimaiR, maimaiScreenR } from '../const';
import { clearArcFun } from './_base';

export const drawOutRing = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiR, 0, 2 * Math.PI);
  ctx.fillStyle = 'lightgray';
  ctx.fill();
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center[0], center[1], maimaiScreenR, 0, 2 * Math.PI);
  ctx.strokeStyle = 'gray';
  ctx.stroke();

  clearArcFun(center[0], center[1], maimaiScreenR, ctx);

  keys.forEach(key => {
    // 按钮两侧的线
    ctx.beginPath();
    ctx.lineTo(center[0] + maimaiR * cos(key.rightAngle! + keySideLineDistance), center[1] + maimaiR * sin(key.rightAngle! + keySideLineDistance));
    ctx.lineTo(center[0] + maimaiScreenR * cos(key.rightAngle! + keySideLineDistance), center[1] + maimaiScreenR * sin(key.rightAngle! + keySideLineDistance));
    ctx.closePath();
    ctx.strokeStyle = '#555555';
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(center[0] + maimaiR * cos(key.leftAngle! - keySideLineDistance), center[1] + maimaiR * sin(key.leftAngle! - keySideLineDistance));
    ctx.lineTo(center[0] + maimaiScreenR * cos(key.leftAngle! - keySideLineDistance), center[1] + maimaiScreenR * sin(key.leftAngle! - keySideLineDistance));
    ctx.closePath();
    ctx.strokeStyle = '#555555';
    ctx.stroke();

    // 螺丝孔
    ctx.beginPath();
    ctx.arc(center[0] + keySideDotRtoCenter * cos(key.leftAngle! - keySideDotDistance), center[1] + keySideDotRtoCenter * sin(key.leftAngle! - keySideDotDistance), keySideDotR, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = 'gray';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center[0] + keySideDotRtoCenter * cos(key.rightAngle! + keySideDotDistance), center[1] + keySideDotRtoCenter * sin(key.rightAngle! + keySideDotDistance), keySideDotR, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = 'gray';
    ctx.fill();
  });
};
