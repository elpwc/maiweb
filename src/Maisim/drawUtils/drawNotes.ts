import { ShowingNoteProps } from '../../utils/showingNoteProps';
import { π } from '../../math';
import { center, maimaiSummonLineR, maimaiScreenR, maimaiBR, maimaiER, touchMaxDistance, maimaiTapR, trackItemGap, trackItemWidth, trackItemHeight, holdHeadHeight } from '../global';
import { Note, NoteType } from '../maireader';
import { getTrackProps } from '../slideTracks/tracks';
import { trackLength } from '../slideTracks/_global';
import { drawRotationImage } from './_base';
import { NoteIcon } from '../resourceReaders/noteIconReader';

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

    const touchHoldPieces = [NoteIcon.touch_hold_1, NoteIcon.touch_hold_2, NoteIcon.touch_hold_3, NoteIcon.touch_hold_4];
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
      drawRotationImage(
        ctx,
        NoteIcon.touch_center,
        x - (NoteIcon.touch_center.width * centerk) / 2,
        y - (NoteIcon.touch_center.height * centerk) / 2,
        NoteIcon.touch_center.width * centerk,
        NoteIcon.touch_center.height * centerk
      );
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
        drawRotationImage(
          ctx,
          NoteIcon.touch_center,
          x - (NoteIcon.touch_center.width * centerk) / 2,
          y - (NoteIcon.touch_center.height * centerk) / 2,
          NoteIcon.touch_center.width * centerk,
          NoteIcon.touch_center.height * centerk
        );
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
        drawRotationImage(
          ctx,
          NoteIcon.touch_center,
          x - (NoteIcon.touch_center.width * centerk) / 2,
          y - (NoteIcon.touch_center.height * centerk) / 2,
          NoteIcon.touch_center.width * centerk,
          NoteIcon.touch_center.height * centerk
        );

        const cutCircleR = NoteIcon.touch_hold_gage.width * centerk;
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

        drawRotationImage(
          ctx,
          NoteIcon.touch_hold_gage,
          x - (NoteIcon.touch_hold_gage.width * centerk) / 2,
          y - (NoteIcon.touch_hold_gage.height * centerk) / 2,
          NoteIcon.touch_hold_gage.width * centerk,
          NoteIcon.touch_hold_gage.height * centerk
        );
        ctx.restore();
      }
    }
  };

  const drawSlideTrackImage = (imageTrack: HTMLImageElement, imageStar: HTMLImageElement) => {
    let tempendpos = Number(note.endPos) - (Number(note.pos) - 1);
    if (tempendpos < 1) tempendpos += 8;
    // 间隔放置TRACK元素的时间
    const trackItemGapTime = (trackItemGap * note.remainTime!) / trackLength(note.slideType!, Number(note.pos), Number(note.endPos));

    // SLIDE TRACK
    ctx_slideTrack.save();
    ctx_slideTrack.translate(center[0], center[1]);
    ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

    // 得从後往前画
    for (let i = note.remainTime!; i >= 0; i -= trackItemGapTime) {
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

    // GUIDE STAR
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
          drawTapImage(NoteIcon.tap_break);
        } else {
          drawTapImage(NoteIcon.tap_each);
        }
      } else {
        if (note.isBreak) {
          drawTapImage(NoteIcon.tap_break);
        } else {
          drawTapImage(NoteIcon.tap);
        }
      }
      if (note.isEx) {
        drawTapImage(NoteIcon.tap_ex);
      }
      break;
    case NoteType.Hold:
      if (isEach) {
        drawHoldImage(NoteIcon.hold_each, NoteIcon.short_hold_each, note.isShortHold);
      } else {
        drawHoldImage(NoteIcon.hold, NoteIcon.short_hold, note.isShortHold);
      }

      if (note.isEx) {
        drawHoldImage(NoteIcon.hold_ex, NoteIcon.short_hold_ex, note.isShortHold);
      }
      break;
    case NoteType.Slide:
      // console.log(note, note.slideTracks)
      if (note.slideTracks?.length! > 1) {
        // DOUBLE TRACK
        if (isEach) {
          if (note.isBreak) {
            drawTapImage(NoteIcon.star_break_double);
          } else {
            drawTapImage(NoteIcon.star_each_double);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(NoteIcon.star_break_double);
          } else {
            drawSlideTapImage(NoteIcon.star_double);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(NoteIcon.star_ex_double);
        }
      } else {
        // SINGLE
        if (isEach) {
          if (note.isBreak) {
            drawSlideTapImage(NoteIcon.star_break);
          } else {
            drawSlideTapImage(NoteIcon.star_each);
          }
        } else {
          if (note.isBreak) {
            drawSlideTapImage(NoteIcon.star_break);
          } else {
            drawSlideTapImage(NoteIcon.star);
          }
        }
        if (note.isEx) {
          drawSlideTapImage(NoteIcon.star_ex);
        }
      }
      break;
    case NoteType.Touch:
      if (isEach) {
        drawTouchImage(NoteIcon.touch_each, NoteIcon.touch_each_center);
      } else {
        drawTouchImage(NoteIcon.touch, NoteIcon.touch_center);
      }
      break;
    case NoteType.TouchHold:
      drawTouchHoldImage(note.isShortHold);
      break;
    case NoteType.SlideTrack:
      if (isEach) {
        drawSlideTrackImage(NoteIcon.slide_each, NoteIcon.star_each);
      } else {
        drawSlideTrackImage(NoteIcon.slide, NoteIcon.star);
      }
      break;
    case NoteType.EndMark:
      //finish();
      break;
  }
};
