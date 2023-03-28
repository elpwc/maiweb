import { TouchArea } from '../utils/touchArea';
import { cos, sin } from '../utils/math';
import { Area } from '../areas';
import { KeyState } from '../utils/types/keyState';
import MaimaiValues from '../maimaiValues';
import { Key } from 'readline';

const drawKey = (ctx: CanvasRenderingContext2D, values: MaimaiValues, key: Area, pressed: boolean = false, color: string = '') => {
  // 按钮
  ctx.beginPath();
  ctx.arc(values.center[0], values.center[1], values.keyOuterR - (pressed ? values.keyPressOffset : 0), key.leftAngle!, key.rightAngle!);
  ctx.lineTo(
    values.center[0] + (values.keyInnerR - (pressed ? values.keyPressOffset : 0)) * cos(key.rightAngle!),
    values.center[1] + (values.keyInnerR - (pressed ? values.keyPressOffset : 0)) * sin(key.rightAngle!)
  );

  ctx.arc(values.center[0], values.center[1], values.keyInnerR - (pressed ? values.keyPressOffset : 0), key.rightAngle!, key.leftAngle!, true);

  ctx.lineTo(
    values.center[0] + (values.keyOuterR - (pressed ? values.keyPressOffset : 0)) * cos(key.leftAngle!),
    values.center[1] + (values.keyOuterR - (pressed ? values.keyPressOffset : 0)) * sin(key.leftAngle!)
  );
  ctx.closePath();
  ctx.strokeStyle = '#dddddd';
  ctx.stroke();
  ctx.fillStyle = '#eeeeee';
  ctx.fill();

  // 颜色
  if (color !== '') {
    ctx.beginPath();
    ctx.arc(values.center[0], values.center[1], values.keyOuterR - (pressed ? values.keyPressOffset : 0), key.leftAngle!, key.rightAngle!);
    ctx.lineTo(
      values.center[0] + (values.keyOuterR - (values.keyOuterR - values.keyInnerR) * values.keyLightWidth - (pressed ? values.keyPressOffset : 0)) * cos(key.rightAngle!),
      values.center[1] + (values.keyOuterR - (values.keyOuterR - values.keyInnerR) * values.keyLightWidth - (pressed ? values.keyPressOffset : 0)) * sin(key.rightAngle!)
    );

    ctx.arc(
      values.center[0],
      values.center[1],
      values.keyOuterR - (values.keyOuterR - values.keyInnerR) * values.keyLightWidth - (pressed ? values.keyPressOffset : 0),
      key.rightAngle!,
      key.leftAngle!,
      true
    );

    ctx.lineTo(
      values.center[0] + (values.keyOuterR - (pressed ? values.keyPressOffset : 0)) * cos(key.leftAngle!),
      values.center[1] + (values.keyOuterR - (pressed ? values.keyPressOffset : 0)) * sin(key.leftAngle!)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
};

export const drawAllKeys = (ctx: CanvasRenderingContext2D, values: MaimaiValues, keys: Area[], currentTouchingArea: TouchArea[], keyStates: KeyState[]) => {
  keys.forEach(key => {
    if (
      currentTouchingArea.find(ta => {
        return ta.area.name === key.name;
      }) === undefined
    ) {
      drawKey(ctx, values, key, false, keyStates[key.id]?.color ?? '');
    } else {
      drawKey(ctx, values, key, true, keyStates[key.id]?.color ?? '');
    }
  });
};

export const drawArea = (ctx: CanvasRenderingContext2D, values: MaimaiValues, area: Area, alpha: number = 0.4) => {
  if (area.type === 'C') {
    ctx.beginPath();
    ctx.arc(values.center[0], values.center[1], values.maimaiSummonLineR, 0, 360);
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  } else if (area.type === 'K') {
  } else {
    ctx.beginPath();
    area.points.forEach((p: [number, number], i) => {
      ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(area.points[0][0], area.points[0][1]);
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  }
};

export const drawAllTouchingAreas = (ctx: CanvasRenderingContext2D, values: MaimaiValues, currentTouchingArea: TouchArea[]) => {
  currentTouchingArea.forEach(ta => {
    drawArea(ctx, values, ta.area);
  });
};
