import { ShowingNoteProps } from '../../enums/showingNoteProps';
import { π } from '../../math';
import { center, maimaiSummonLineR, maimaiScreenR, maimaiBR, maimaiER, touchMaxDistance, maimaiTapR, trackItemGap, trackItemWidth, trackItemHeight } from '../global';
import { Note, NoteType } from '../maireader';
import {
  holdHeadHeight,
  touchHold1,
  touchHold2,
  touchHold3,
  touchHold4,
  touchCenter,
  touchHoldGage,
  tapBreak,
  tapEach,
  tap,
  tapEx,
  holdEach,
  holdEachShort,
  hold,
  holdShort,
  holdEx,
  holdExShort,
  tapDoubleSlideBreak,
  tapDoubleSlideEach,
  tapDoubleSlide,
  tapDoubleSlideEx,
  tapSlideBreak,
  tapSlideEach,
  tapSlide,
  tapSlideEx,
  touchEach,
  touchEachCenter,
  touch,
  slideTrackEach,
  slideTrack,
} from '../resourceReader';
import { getTrackProps } from '../slideTracks/tracks';
import { trackLength } from '../slideTracks/_global';
import { drawRotationImage } from './_base';

export const drawNote = (ctx: CanvasRenderingContext2D, ctx_slideTrack: CanvasRenderingContext2D, note: Note, isEach: boolean = false, props: ShowingNoteProps) => {
  let θ = 0,
    x = 0,
    y = 0,
    tx = 0,
    ty = 0;

  const firstWord = note.pos.substring(0, 1);
  if (!isNaN(Number(firstWord))) {
    // 数字开头的位置
    θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
    x = center[0] + (props.rho + maimaiSummonLineR) * Math.cos(θ);
    y = center[1] + (props.rho + maimaiSummonLineR) * Math.sin(θ);
  } else {
    // 字母开头的位置（TOUCH）
    const touchPos = note.pos.substring(1, 2);
    switch (firstWord) {
      case 'C':
        x = center[0];
        y = center[1];
        break;
      case 'A':
        θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = center[0] + maimaiScreenR * Math.cos(θ);
        y = center[1] + maimaiScreenR * Math.sin(θ);
        break;
      case 'B':
        θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = center[0] + maimaiBR * Math.cos(θ);
        y = center[1] + maimaiBR * Math.sin(θ);
        break;
      case 'D':
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        //console.log('D', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
        x = center[0] + maimaiScreenR * Math.cos(θ);
        y = center[1] + maimaiScreenR * Math.sin(θ);
        break;
      case 'E':
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        //console.log('E', -1 / 4 + (1 / 4) * Number(touchPos), touchPos);
        x = center[0] + maimaiER * Math.cos(θ);
        y = center[1] + maimaiER * Math.sin(θ);
        break;
      default:
        break;
    }
  }

  if (note.type === NoteType.Hold) {
    tx = center[0] + (props.tailRho + maimaiSummonLineR) * Math.cos(θ);
    ty = center[1] + (props.tailRho + maimaiSummonLineR) * Math.sin(θ);
  }

  //console.log(props, ty )

  // // 画
  // ctx.beginPath();
  // ctx.arc(x, y, maimaiTapR, 0, 2 * Math.PI);

  let k = 0.8;

  const drawTapImage = (image: HTMLImageElement) => {
    const centerx = x,
      centery = y;
    drawRotationImage(ctx, image, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
  };

  const drawSlideTapImage = (image: HTMLImageElement, rotate: boolean = true) => {
    const centerx = x,
      centery = y;
    drawRotationImage(
      ctx,
      image,
      x - props.radius / k,
      y - props.radius / k,
      (props.radius * 2) / k,
      (props.radius * 2) / k,
      centerx,
      centery,
      -22.5 + Number(note.pos) * 45 + (rotate ? (props.timer * 50000) / note.slideTracks![0]!.remainTime! : 0)
    );
  };

  const drawHoldImage = (image: HTMLImageElement, shortHoldImage?: HTMLImageElement, isShortHold: boolean = false) => {
    //console.log(y, ty);
    const centerx = x,
      centery = y;

    if (isShortHold) {
      drawRotationImage(ctx, shortHoldImage!, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 1.1547 * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
    } else {
      if (props.status === 0) {
        drawRotationImage(
          ctx,
          shortHoldImage!,
          x - props.radius / k,
          y - (props.radius * 1.1547) / k,
          (props.radius * 2) / k,
          (props.radius * 1.1547 * 2) / k,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45
        );
      } else {
        drawRotationImage(
          ctx,
          image,
          x - props.radius / k,
          y - (props.radius * 1.1547) / k,
          (props.radius * 2) / k,
          (props.radius * 1.2) / k,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          1,
          0,
          0,
          image.width,
          holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          x - props.radius / k,
          y - props.radius / k + props.radius,
          (props.radius * 2) / k,
          props.rho - props.tailRho,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          1,
          0,
          holdHeadHeight,
          image.width,
          image.height - 2 * holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          tx - props.radius / k,
          ty - props.radius / k,
          (props.radius * 2) / k,
          (props.radius * 1.2) / k,
          tx,
          ty,
          157.5 + Number(note.pos) * 45,
          1,
          0,
          0,
          image.width,
          holdHeadHeight
        );
      }
    }
  };

  const drawTouchImage = (image: HTMLImageElement, imageCenter: HTMLImageElement) => {
    const centerx = x,
      centery = y;
    const k = 0.5,
      centerk = 0.6;
    for (let i = 0; i < 4; i++) {
      drawRotationImage(ctx, image, x - (image.width * k) / 2, y + touchMaxDistance - 6 - props.rho, image.width * k, image.height * k, x, y, 90 * i, props.radius / maimaiTapR);
    }
    drawRotationImage(ctx, imageCenter, x - (imageCenter.width * centerk) / 2, y - (imageCenter.height * centerk) / 2, imageCenter.width * centerk, imageCenter.height * centerk);
  };

  const drawTouchHoldImage = (isShortHold: boolean = false) => {
    const centerx = x,
      centery = y;

    const k = 0.5,
      centerk = 0.6;

    const touchHoldPieces = [touchHold1, touchHold2, touchHold3, touchHold4];
    if (isShortHold) {
      for (let i = 0; i < 4; i++) {
        drawRotationImage(
          ctx,
          touchHoldPieces[i],
          x - (touchHoldPieces[i].width * k) / 2,
          y + touchMaxDistance - 6 - props.rho,
          touchHoldPieces[i].width * k,
          touchHoldPieces[i].height * k,
          x,
          y,
          135 + 90 * i,
          props.radius / maimaiTapR
        );
      }
      drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);
    } else {
      if (props.status === 0 || props.status === 1) {
        for (let i = 0; i < 4; i++) {
          drawRotationImage(
            ctx,
            touchHoldPieces[i],
            x - (touchHoldPieces[i].width * k) / 2,
            y + touchMaxDistance - 6 - props.rho,
            touchHoldPieces[i].width * k,
            touchHoldPieces[i].height * k,
            x,
            y,
            135 + 90 * i,
            props.radius / maimaiTapR
          );
        }
        drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);
      } else if (props.status === 2) {
        for (let i = 0; i < 4; i++) {
          drawRotationImage(
            ctx,
            touchHoldPieces[i],
            x - (touchHoldPieces[i].width * k) / 2,
            y + touchMaxDistance - 6 - props.rho,
            touchHoldPieces[i].width * k,
            touchHoldPieces[i].height * k,
            x,
            y,
            135 + 90 * i,
            props.radius / maimaiTapR
          );
        }
        drawRotationImage(ctx, touchCenter, x - (touchCenter.width * centerk) / 2, y - (touchCenter.height * centerk) / 2, touchCenter.width * centerk, touchCenter.height * centerk);

        const cutCircleR = touchHoldGage.width * centerk;
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(x, y - cutCircleR);
        ctx.lineTo(x, y);

        tx = x + cutCircleR * Math.cos(props.tailRho);
        ty = y + cutCircleR * Math.sin(props.tailRho);

        ctx.lineTo(tx, ty);

        if (props.tailRho >= 1.5 * Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x - cutCircleR, y - cutCircleR);
        }
        if (props.tailRho >= Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x - cutCircleR, y + cutCircleR);
        }
        if (props.tailRho >= 0.5 * Math.PI && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x + cutCircleR, y + cutCircleR);
        }
        if (props.tailRho >= 0 && props.tailRho <= 2 * Math.PI) {
          ctx.lineTo(x + cutCircleR, y - cutCircleR);
        }

        ctx.lineTo(x, y - cutCircleR);
        ctx.closePath();
        ctx.clip();

        drawRotationImage(ctx, touchHoldGage, x - (touchHoldGage.width * centerk) / 2, y - (touchHoldGage.height * centerk) / 2, touchHoldGage.width * centerk, touchHoldGage.height * centerk);
        ctx.restore();
      }
    }
  };

  const drawSlideTrackImage = (imageTrack: HTMLImageElement, imageStar: HTMLImageElement) => {
    let tempendpos = Number(note.endPos) - (Number(note.pos) - 1);
    if (tempendpos < 1) tempendpos += 8;
    const trackItemGapTime = (trackItemGap * note.remainTime!) / trackLength(note.slideType!, Number(note.pos), Number(note.endPos));

    console.log(trackLength(note.slideType!, Number(note.pos), Number(note.endPos)), trackItemGapTime);

    ctx_slideTrack.save();
    ctx_slideTrack.translate(center[0], center[1]);
    ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

    for (let i = 0; i < note.remainTime!; i += trackItemGapTime) {
      const slideData = getTrackProps(note.slideType!, Number(note.pos), Number(note.endPos), i, note.remainTime!);
      drawRotationImage(
        ctx_slideTrack,
        imageTrack,
        slideData.x - trackItemWidth / 2 - center[0],
        slideData.y - trackItemHeight / 2 - center[1],
        trackItemWidth,
        trackItemHeight,
        slideData.x - center[0],
        slideData.y - center[1],
        slideData.direction,
        props.radius
      );
    }
    ctx_slideTrack.restore();

    ctx.save();
    ctx.translate(center[0], center[1]);
    ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

    const guideStarData = getTrackProps(note.slideType!, Number(note.pos), Number(note.endPos), props.rho, note.remainTime!);
    drawRotationImage(
      ctx,
      imageStar,
      guideStarData.x - props.guideStarRadius! * 2 - center[0],
      guideStarData.y - props.guideStarRadius! * 2 - center[1],
      props.guideStarRadius! * 4,
      props.guideStarRadius! * 4,
      guideStarData.x - center[0],
      guideStarData.y - center[1],
      guideStarData.direction,
      props.guideStarRadius! / maimaiTapR
    );
    ctx.restore();
  };

  switch (note.type) {
    case NoteType.Tap:
      if (isEach) {
        if (note.isBreak) {
          drawTapImage(tapBreak);
        } else {
          drawTapImage(tapEach);
        }
      } else {
        if (note.isBreak) {
          drawTapImage(tapBreak);
        } else {
          drawTapImage(tap);
        }
      }
      if (note.isEx) {
        drawTapImage(tapEx);
      }
      break;
    case NoteType.Hold:
      if (isEach) {
        drawHoldImage(holdEach, holdEachShort, note.isShortHold);
      } else {
        drawHoldImage(hold, holdShort, note.isShortHold);
      }

      if (note.isEx) {
        drawHoldImage(holdEx, holdExShort, note.isShortHold);
      }
      break;
    case NoteType.Slide:
      // console.log(note, note.slideTracks)
      if (note.slideTracks?.length! > 1) {
        // DOUBLE TRACK
        if (isEach) {
          if (note.isBreak) {
            drawTapImage(tapDoubleSlideBreak);
          } else {
            drawTapImage(tapDoubleSlideEach);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(tapDoubleSlideBreak);
          } else {
            drawSlideTapImage(tapDoubleSlide);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(tapDoubleSlideEx);
        }
      } else {
        // SINGLE
        if (isEach) {
          if (note.isBreak) {
            drawSlideTapImage(tapSlideBreak);
          } else {
            drawSlideTapImage(tapSlideEach);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(tapSlideBreak);
          } else {
            drawSlideTapImage(tapSlide);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(tapSlideEx);
        }
      }
      break;
    case NoteType.Touch:
      if (isEach) {
        drawTouchImage(touchEach, touchEachCenter);
      } else {
        drawTouchImage(touch, touchCenter);
      }
      break;
    case NoteType.TouchHold:
      drawTouchHoldImage(note.isShortHold);
      break;
    case NoteType.SlideTrack:
      if (isEach) {
        drawSlideTrackImage(slideTrackEach, tapSlideEach);
      } else {
        drawSlideTrackImage(slideTrack, tapSlide);
      }
      break;
    case NoteType.EndMark:
      //finish();
      break;
  }
};
