import { TouchArea } from '../../utils/touchArea';
import { cos, sin } from '../../math';
import { Area, keys } from '../areas';
import {
  center,
  keyInnerR,
  keyLightWidth,
  keyOuterR,
  keyPressOffset,
  keySideDotDistance,
  keySideDotR,
  keySideDotRtoCenter,
  keySideLineDistance,
  maimaiR,
  maimaiScreenR,
  maimaiSummonLineR,
} from '../const';
import { KeyState } from '../../utils/keyState';

const drawKey = (ctx: CanvasRenderingContext2D, key: Area, pressed: boolean = false, color: string = '') => {
  // 按钮
  ctx.beginPath();
  ctx.arc(center[0], center[1], keyOuterR - (pressed ? keyPressOffset : 0), key.leftAngle!, key.rightAngle!);
  ctx.lineTo(center[0] + (keyInnerR - (pressed ? keyPressOffset : 0)) * cos(key.rightAngle!), center[1] + (keyInnerR - (pressed ? keyPressOffset : 0)) * sin(key.rightAngle!));

  ctx.arc(center[0], center[1], keyInnerR - (pressed ? keyPressOffset : 0), key.rightAngle!, key.leftAngle!, true);

  ctx.lineTo(center[0] + (keyOuterR - (pressed ? keyPressOffset : 0)) * cos(key.leftAngle!), center[1] + (keyOuterR - (pressed ? keyPressOffset : 0)) * sin(key.leftAngle!));
  ctx.closePath();
  ctx.strokeStyle = '#dddddd';
  ctx.stroke();
  ctx.fillStyle = '#eeeeee';
  ctx.fill();

  // 颜色
  if (color !== '') {
    ctx.beginPath();
    ctx.arc(center[0], center[1], keyOuterR - (pressed ? keyPressOffset : 0), key.leftAngle!, key.rightAngle!);
    ctx.lineTo(
      center[0] + (keyOuterR - (keyOuterR - keyInnerR) * keyLightWidth - (pressed ? keyPressOffset : 0)) * cos(key.rightAngle!),
      center[1] + (keyOuterR - (keyOuterR - keyInnerR) * keyLightWidth - (pressed ? keyPressOffset : 0)) * sin(key.rightAngle!)
    );

    ctx.arc(center[0], center[1], keyOuterR - (keyOuterR - keyInnerR) * keyLightWidth - (pressed ? keyPressOffset : 0), key.rightAngle!, key.leftAngle!, true);

    ctx.lineTo(center[0] + (keyOuterR - (pressed ? keyPressOffset : 0)) * cos(key.leftAngle!), center[1] + (keyOuterR - (pressed ? keyPressOffset : 0)) * sin(key.leftAngle!));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
};

export const drawAllKeys = (ctx: CanvasRenderingContext2D, currentTouchingArea: TouchArea[], keyStates: KeyState[]) => {
  keys.forEach((key) => {
    if (
      currentTouchingArea.find((ta) => {
        return ta.area.name === key.name;
      }) === undefined
    ) {
      drawKey(ctx, key, false, keyStates[key.id]?.color ?? '');
    } else {
      drawKey(ctx, key, true, keyStates[key.id]?.color ?? '');
    }
  });
};

export const drawArea = (ctx: CanvasRenderingContext2D, area: Area, alpha: number = 0.4) => {
  if (area.type === 'C') {
    ctx.beginPath();
    ctx.arc(center[0], center[1], maimaiSummonLineR, 0, 360);
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

export const drawAllTouchingAreas = (ctx: CanvasRenderingContext2D, currentTouchingArea: TouchArea[]) => {
  currentTouchingArea.forEach((ta) => {
    drawArea(ctx, ta.area);
  });
};
