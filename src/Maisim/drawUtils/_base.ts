/**
 * 画图
 * @param ctx
 * @param image
 * @param x
 * @param y
 * @param w
 * @param h
 * @param centerX 旋转中心x
 * @param centerY 旋转中心y
 * @param r 旋转角度
 * @param alpha 透明 0-1
 * @param sx 剪切x
 * @param sy 剪切y
 * @param sw 剪切宽度
 * @param sh 剪切高度
 */
export const drawRotationImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  centerX?: number,
  centerY?: number,
  r?: number,
  alpha?: number,
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number
) => {
  const TO_RADIANS = Math.PI / 180;
  if (centerX && centerY && r) {
    ctx.save(); //保存状态
    ctx.translate(centerX, centerY); //设置画布上的(0,0)位置，也就是旋转的中心点
    ctx.rotate(r * TO_RADIANS);
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, sx ?? 0, sy ?? 0, sw ?? image.width, sh ?? image.height, x - centerX, y - centerY, w, h);
    ctx.restore(); //恢复状态
  } else {
    ctx.globalAlpha = alpha ?? 1;
    ctx.drawImage(image, sx ?? 0, sy ?? 0, sw ?? image.width, sh ?? image.height, x, y, w, h);
  }
};

export const clearArcFun = (x: number, y: number, r: number, cxt: CanvasRenderingContext2D) => {
  let stepClear = 1;
  clearArc(x, y, r);
  function clearArc(x: number, y: number, radius: number) {
    const calcWidth = radius - stepClear;
    const calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);
    const posX = x - calcWidth;
    const posY = y - calcHeight;

    const widthX = 2 * calcWidth;
    const heightY = 2 * calcHeight;

    if (stepClear <= radius) {
      cxt.clearRect(posX, posY, widthX, heightY);
      stepClear += 1;
      clearArc(x, y, radius);
    }
  }
};
