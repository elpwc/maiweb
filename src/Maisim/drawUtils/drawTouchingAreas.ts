import { TouchArea } from "../../enums/touchArea";
import { Area } from "../areas";
import { center, maimaiSummonLineR } from "../global";

export const drawArea = (ctx: CanvasRenderingContext2D, area: Area, alpha: number = 0.4) => {
  if (area.type !== 'C') {
    ctx.beginPath();
    area.points.forEach((p: [number, number], i) => {
      ctx.lineTo(p[0], p[1]);
    });
    ctx.lineTo(area.points[0][0], area.points[0][1]);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.arc(center[0], center[1], maimaiSummonLineR, 0, 360);
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