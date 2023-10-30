import { cos, sin, π } from '../utils/math';
import { getTrackProps } from '../slideTracks/tracks';
import { drawRotationImage, lineLen } from './_base';
import { NoteIcon } from '../resourceReaders/noteIconReader';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { RegularStyles, SlideColor, TapStyles } from '../utils/types/noteStyles';
import { JudgeIcon } from '../resourceReaders/judgeIconReader';
import { JudgeStatus, JudgeTimeStatus } from '../utils/types/judgeStatus';
import { Note, SectionInfo, SlideLine } from '../utils/note';
import { NoteType, isTouchNoteType } from '../utils/types/noteType';
import { ShowingNoteProps } from '../utils/showingNoteProps';
import AnimationUtils from './animation';
import MaimaiValues from '../maimaiValues';
import { trackLength } from '../slideTracks/_global';
import { getPosCenterCoord } from '../areas';
import { SpecPos } from '../spectator/specPos';
import { SpecPosType } from '../spectator/specPosType';

let tapIcon: HTMLImageElement;
let tapEachIcon: HTMLImageElement;
let tapBreakIcon: HTMLImageElement;
let tapExIcon: HTMLImageElement;
let tapExEachIcon: HTMLImageElement;
let tapExBreakIcon: HTMLImageElement;
let tapTrapIcon: HTMLImageElement;

let holdIcon: HTMLImageElement;
let holdEachIcon: HTMLImageElement;
let holdBreakIcon: HTMLImageElement;
let holdExIcon: HTMLImageElement;
let holdExEachIcon: HTMLImageElement;
let holdExBreakIcon: HTMLImageElement;
let holdExMissIcon: HTMLImageElement;
let holdMissIcon: HTMLImageElement;

let starIcon: HTMLImageElement;
let starEachIcon: HTMLImageElement;
let starBreakIcon: HTMLImageElement;
let starExIcon: HTMLImageElement;
let starExEachIcon: HTMLImageElement;
let starExBreakIcon: HTMLImageElement;

let starDoubleIcon: HTMLImageElement;
let starDoubleEachIcon: HTMLImageElement;
let starDoubleBreakIcon: HTMLImageElement;
let starDoubleExIcon: HTMLImageElement;
let starDoubleExEachIcon: HTMLImageElement;
let starDoubleExBreakIcon: HTMLImageElement;

let slideIcon: HTMLImageElement;
let slideEachIcon: HTMLImageElement;
let slideBreakIcon: HTMLImageElement;
let slideExIcon: HTMLImageElement;

/** 根据样式设定将Note图片更新为指定样式 */
export const updateIcons = (tapStyle: TapStyles, holdStyle: RegularStyles, slideStyle: RegularStyles, slideColor: SlideColor) => {
  switch (tapStyle) {
    case TapStyles.Concise:
      tapIcon = NoteIcon.Tap_00;
      tapEachIcon = NoteIcon.Tap_Each_00;
      tapBreakIcon = NoteIcon.Break_00;
      tapExIcon = NoteIcon.Tap_Ex_00_pink;
      tapExEachIcon = NoteIcon.Tap_Ex_00_each;
      tapExBreakIcon = NoteIcon.Tap_Ex_00_break;
      tapTrapIcon = NoteIcon.Tap_Trap_00;
      break;
    case TapStyles.Classic:
      tapIcon = NoteIcon.Tap_01;
      tapEachIcon = NoteIcon.Tap_Each_01;
      tapBreakIcon = NoteIcon.Break_01;
      tapExIcon = NoteIcon.Tap_Ex_01_pink;
      tapExEachIcon = NoteIcon.Tap_Ex_01_each;
      tapExBreakIcon = NoteIcon.Tap_Ex_01_break;
      tapTrapIcon = NoteIcon.Tap_Trap_01;
      break;
    case TapStyles.DX:
      tapIcon = NoteIcon.Tap_02;
      tapEachIcon = NoteIcon.Tap_Each_02;
      tapBreakIcon = NoteIcon.Break_02;
      tapExIcon = NoteIcon.Tap_Ex_02_pink;
      tapExEachIcon = NoteIcon.Tap_Ex_02_each;
      tapExBreakIcon = NoteIcon.Tap_Ex_02_break;
      tapTrapIcon = NoteIcon.Tap_Trap_02;
      break;
    case TapStyles.Strip:
      tapIcon = NoteIcon.Tap_03;
      tapEachIcon = NoteIcon.Tap_Each_03;
      tapBreakIcon = NoteIcon.Break_03;
      tapExIcon = NoteIcon.Tap_Ex_03_pink;
      tapExEachIcon = NoteIcon.Tap_Ex_03_each;
      tapExBreakIcon = NoteIcon.Tap_Ex_03_break;
      tapTrapIcon = NoteIcon.Tap_Trap_03;
      break;
    case TapStyles.TAPKun:
      tapIcon = NoteIcon.Tap_04;
      tapEachIcon = NoteIcon.Tap_Each_04;
      tapBreakIcon = NoteIcon.Break_04;
      tapExIcon = NoteIcon.Tap_Ex_04_pink;
      tapExEachIcon = NoteIcon.Tap_Ex_04_each;
      tapExBreakIcon = NoteIcon.Tap_Ex_04_break;
      tapTrapIcon = NoteIcon.Tap_Trap_04;
      break;
  }

  switch (holdStyle) {
    case RegularStyles.Concise:
      holdIcon = NoteIcon.Hold_00;
      holdEachIcon = NoteIcon.Hold_Each_00;
      holdBreakIcon = NoteIcon.Hold_Break_00;
      holdExIcon = NoteIcon.Hold_Ex_00_pink;
      holdExEachIcon = NoteIcon.Hold_Ex_00_each;
      holdExBreakIcon = NoteIcon.Hold_Ex_00_break;
      holdExMissIcon = NoteIcon.Hold_Ex_00;
      holdMissIcon = NoteIcon.Miss_00;
      break;
    case RegularStyles.Classic:
      holdIcon = NoteIcon.Hold_01;
      holdEachIcon = NoteIcon.Hold_Each_01;
      holdBreakIcon = NoteIcon.Hold_Break_01;
      holdExIcon = NoteIcon.Hold_Ex_01_pink;
      holdExEachIcon = NoteIcon.Hold_Ex_01_each;
      holdExBreakIcon = NoteIcon.Hold_Ex_01_break;
      holdExMissIcon = NoteIcon.Hold_Ex_01;
      holdMissIcon = NoteIcon.Miss_01;
      break;
  }

  switch (slideStyle) {
    case RegularStyles.Concise:
      slideIcon = NoteIcon.Slide_00;
      slideEachIcon = NoteIcon.Slide_Each_00;
      slideBreakIcon = NoteIcon.Slide_Break_00;
      slideExIcon = NoteIcon.Slide_Ex_00;

      starBreakIcon = NoteIcon.BreakStar_00;
      starDoubleBreakIcon = NoteIcon.BreakStar_Double_00;

      starDoubleExEachIcon = NoteIcon.Star_Ex_Double_00_each;
      starDoubleExBreakIcon = NoteIcon.Star_Ex_Double_00_break;

      starExEachIcon = NoteIcon.Star_Ex_00_each;
      starExBreakIcon = NoteIcon.Star_Ex_00_break;

      starEachIcon = NoteIcon.Star_Each_00;
      starDoubleEachIcon = NoteIcon.Star_Each_00;
      switch (slideColor) {
        case SlideColor.Blue:
          starIcon = NoteIcon.Star_00;
          starDoubleIcon = NoteIcon.Star_00;
          starExIcon = NoteIcon.Star_Ex_00_blue;
          starDoubleExIcon = NoteIcon.Star_Ex_Double_00_blue;
          break;
        case SlideColor.Pink:
          starIcon = NoteIcon.Star_Pink_00;
          starDoubleIcon = NoteIcon.Star_Pink_Double_00;
          starExIcon = NoteIcon.Star_Ex_00_pink;
          starDoubleExIcon = NoteIcon.Star_Ex_Double_00_pink;
          break;
      }

      break;
    case RegularStyles.Classic:
      slideIcon = NoteIcon.Slide_01;
      slideEachIcon = NoteIcon.Slide_Each_01;
      slideBreakIcon = NoteIcon.Slide_Break_01;
      slideExIcon = NoteIcon.Slide_Ex_01;

      starBreakIcon = NoteIcon.BreakStar_01;
      starDoubleBreakIcon = NoteIcon.BreakStar_Double_01;

      starDoubleExEachIcon = NoteIcon.Star_Ex_Double_01_each;
      starDoubleExBreakIcon = NoteIcon.Star_Ex_Double_01_break;

      starExEachIcon = NoteIcon.Star_Ex_01_each;
      starExBreakIcon = NoteIcon.Star_Ex_01_break;

      starEachIcon = NoteIcon.Star_Each_01;
      starDoubleEachIcon = NoteIcon.Star_Each_01;
      switch (slideColor) {
        case SlideColor.Blue:
          starIcon = NoteIcon.Star_01;
          starDoubleIcon = NoteIcon.Star_Double_01;
          starExIcon = NoteIcon.Star_Ex_01_blue;
          starDoubleExIcon = NoteIcon.Star_Ex_Double_01_blue;
          break;
        case SlideColor.Pink:
          starIcon = NoteIcon.Star_Pink_01;
          starDoubleIcon = NoteIcon.Star_Pink_Double_01;
          starExIcon = NoteIcon.Star_Ex_01_pink;
          starDoubleExIcon = NoteIcon.Star_Ex_Double_01_pink;
          break;
      }

      break;
  }
};

/**
 * 绘制一个Note
 * @param animationFactory
 * @param values
 * @param ctx 绘制Note的图层
 * @param ctx_slideTrack 绘制SLIDE TRACK的图层
 * @param note Note
 * @param isEach 是否在一对Each里
 * @param props 当前的Note状态
 * @param doDrawEachLine 是否绘制Each黄线
 * @param doShowJudgement 是否显示判定
 * @param effectBackCtx
 * @param effectOverCtx
 * @param tapStyle
 * @param holdStyle
 * @param slideStyle
 * @param slideColor
 * @param drawFastLast
 */
export const drawNote = (
  animationFactory: AnimationUtils,
  values: MaimaiValues,
  ctx: CanvasRenderingContext2D,
  ctx_slideTrack: CanvasRenderingContext2D,
  note: Note,
  isEach: boolean = false,
  props: ShowingNoteProps,
  doDrawEachLine: boolean = true,
  doShowJudgement: boolean = true,
  effectBackCtx: CanvasRenderingContext2D,
  effectOverCtx: CanvasRenderingContext2D,
  tapStyle: TapStyles,
  holdStyle: RegularStyles,
  slideStyle: RegularStyles,
  slideColor: SlideColor,
  drawFastLast: boolean = true
) => {
  if (/* hidden状态 (-2) 不显示 只等待判定 */ props.status !== -2 && props.status !== -3) {
    let θ = 0,
      // Note所在的坐标
      x = 0,
      y = 0,
      // HOLD TAIL的坐标
      tx = 0,
      ty = 0;

    const firstChar = note.pos.substring(0, 1);
    const touchPos = note.pos.substring(1, 2);
    if (!isNaN(Number(firstChar))) {
      // 数字开头的位置
      θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
      //console.log(note.pos, θ*180)
      x = values.center[0] + (props.rho + values.maimaiSummonLineR) * Math.cos(θ);
      y = values.center[1] + (props.rho + values.maimaiSummonLineR) * Math.sin(θ);
    } else if (note.pos !== 'E') {
      // 字母开头的位置
      // 字母开头但不是TOUCH的位置
      if (firstChar === 'A' && !isTouchNoteType(note.type)) {
        θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = values.center[0] + values.maimaiScreenR * Math.cos(θ);
        y = values.center[1] + values.maimaiScreenR * Math.sin(θ);
      } else if (firstChar === 'D' && !isTouchNoteType(note.type)) {
        θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
        x = values.center[0] + values.maimaiScreenR * Math.cos(θ);
        y = values.center[1] + values.maimaiScreenR * Math.sin(θ);
      } else if (firstChar === '#' || firstChar === '@') {
        // 观赏谱自定义TOUCH的位置
        const specPos = SpecPos.readPosFromStr(note.pos).getCoord(values);
        x = specPos[0];
        y = specPos[1];
      } else if (isTouchNoteType(note.type)) {
        // TOUCH的位置
        const touchCenterCoord = getPosCenterCoord(note.pos, values);
        x = touchCenterCoord[0];
        y = touchCenterCoord[1];
      }
    }
    if (note.type === NoteType.Hold) {
      tx = values.center[0] + (props.tailRho + values.maimaiSummonLineR) * Math.cos(θ);
      ty = values.center[1] + (props.tailRho + values.maimaiSummonLineR) * Math.sin(θ);
    }

    //console.log(props, ty )

    // // 画
    // ctx.beginPath();
    // ctx.arc(x, y, values.maimaiTapR, 0, 2 * Math.PI);

    /** tapR修正 */
    let k = 0.542;
    /** holdR修正 */
    let kh = 0.8;
    /** effect circle */
    let k2 = 0.89;
    /** effect back line */
    let k3 = 0.98;

    const eachPairLines = [EffectIcon.EachLine1, EffectIcon.EachLine2, EffectIcon.EachLine3, EffectIcon.EachLine4];

    const drawNoteLine = (lineImage: HTMLImageElement, alpha: number = 1) => {
      if (note.isBreak) {
        drawRotationImage(
          effectBackCtx!,
          EffectIcon.BreakLine,
          values.center[0] - (props.rho + values.maimaiSummonLineR) / k2,
          values.center[1] - (props.rho + values.maimaiSummonLineR) / k2,
          ((props.rho + values.maimaiSummonLineR) / k2) * 2,
          ((props.rho + values.maimaiSummonLineR) / k2) * 2,
          values.center[0],
          values.center[1],
          -22.5 + Number(note.pos) * 45,
          alpha
        );
      } else {
        if (note.isEach) {
          drawRotationImage(
            effectBackCtx!,
            EffectIcon.EachLine,
            values.center[0] - (props.rho + values.maimaiSummonLineR) / k2,
            values.center[1] - (props.rho + values.maimaiSummonLineR) / k2,
            ((props.rho + values.maimaiSummonLineR) / k2) * 2,
            ((props.rho + values.maimaiSummonLineR) / k2) * 2,
            values.center[0],
            values.center[1],
            -22.5 + Number(note.pos) * 45,
            alpha
          );
        } else {
          drawRotationImage(
            effectBackCtx!,
            lineImage,
            values.center[0] - (props.rho + values.maimaiSummonLineR) / k2,
            values.center[1] - (props.rho + values.maimaiSummonLineR) / k2,
            ((props.rho + values.maimaiSummonLineR) / k2) * 2,
            ((props.rho + values.maimaiSummonLineR) / k2) * 2,
            values.center[0],
            values.center[1],
            -22.5 + Number(note.pos) * 45,
            alpha
          );
        }
      }
    };

    const drawEachPairLine = () => {
      if (note.eachPairDistance !== 0 && note.isEachPairFirst) {
        drawRotationImage(
          effectBackCtx!,
          eachPairLines[(note.eachPairDistance ?? 1) - 1],
          values.center[0] - (props.rho + values.maimaiSummonLineR) / k3,
          values.center[1] - (props.rho + values.maimaiSummonLineR) / k3,
          ((props.rho + values.maimaiSummonLineR) / k3) * 2,
          ((props.rho + values.maimaiSummonLineR) / k3) * 2,
          values.center[0],
          values.center[1],
          -22.5 - (note.eachPairDistance ?? 1) * 11.25 + Number(note.pos) * 45
        );
      }
    };

    const ghostNoteAlphaCalculation = (type: NoteType, rho: number): number => {
      let alpha = 1;
      if (note.isGhost) {
        switch (type) {
          case NoteType.Tap:
          case NoteType.Slide:
          case NoteType.Hold:
            alpha = 1 - (2 * props.rho) / (values.maimaiJudgeLineR - values.maimaiSummonLineR);
            break;
          case NoteType.SlideTrack:
            alpha = 1 - (2 * props.rho) / (note.time - note.moveTime!);
            break;
          case NoteType.Touch:
          case NoteType.TouchHold:
            alpha = 1 - props.rho;
            break;
        }
      }
      if (alpha < 0) alpha = 0;
      return alpha;
    };

    const drawTapImage = (image: HTMLImageElement) => {
      const centerx = x,
        centery = y;

      const alpha = ghostNoteAlphaCalculation(note.type, props.rho);

      if (doDrawEachLine) {
        drawEachPairLine();
        drawNoteLine(EffectIcon.NormalLine, alpha);
      }

      drawRotationImage(ctx, image, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45, alpha);
      console.log(props.rho);
    };

    const drawSlideTapImage = (image: HTMLImageElement, rotate: boolean = true) => {
      const centerx = x,
        centery = y;

      const alpha = ghostNoteAlphaCalculation(note.type, props.rho);

      let rotateK = 0;
      if (note.isStarTap) {
        if (note.starTapRotate) {
          rotateK = (props.timer * 10000) / 500;
        } else {
          rotateK = 0;
        }
      } else {
        rotateK = (props.timer * 10000) / note.slideTracks![0]!.remainTime!;
      }

      if (doDrawEachLine) {
        drawEachPairLine();
        drawNoteLine(EffectIcon.SlideLine, alpha);
      }

      drawRotationImage(
        ctx,
        image,
        x - props.radius / k,
        y - props.radius / k,
        (props.radius * 2) / k,
        (props.radius * 2) / k,
        centerx,
        centery,
        -22.5 + Number(note.pos) * 45 + (rotate ? rotateK : 0),
        alpha
      );
    };

    const drawHoldImage = (image: HTMLImageElement, isShortHold: boolean = false) => {
      //console.log(y, ty);
      const centerx = x,
        centery = y;

      const alpha = ghostNoteAlphaCalculation(note.type, props.rho);

      if (doDrawEachLine) {
        drawEachPairLine();
        drawNoteLine(EffectIcon.NormalLine, alpha);
      }

      if (isShortHold) {
        drawRotationImage(
          ctx,
          image,
          x - props.radius / kh,
          y - (props.radius * 1.1547) / kh,
          (props.radius * 2) / kh,
          (props.radius * 1.1547) / kh,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          alpha,
          0,
          0,
          image.width,
          values.holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          x - props.radius / kh,
          y - (props.radius * 1.1547) / kh,
          (props.radius * 2) / kh,
          (props.radius * 1.1547) / kh,
          centerx,
          centery,
          157.5 + Number(note.pos) * 45,
          alpha,
          0,
          0,
          image.width,
          values.holdHeadHeight
        );
      } else if (props.tailRho <= values.maimaiJudgeLineR - values.maimaiSummonLineR) {
        // 最外侧的HOLD头部
        drawRotationImage(
          ctx,
          image,
          x - props.radius / kh,
          y - (props.radius * 1.1547) / kh,
          (props.radius * 2) / kh,
          (props.radius * 1.1547) / kh,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          alpha,
          0,
          0,
          image.width,
          values.holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          x - props.radius / kh,
          y,
          (props.radius * 2) / kh,
          props.rho - props.tailRho,
          centerx,
          centery,
          -22.5 + Number(note.pos) * 45,
          alpha,
          0,
          values.holdHeadHeight,
          image.width,
          image.height - 2 * values.holdHeadHeight
        );
        drawRotationImage(
          ctx,
          image,
          tx - props.radius / kh,
          ty - (props.radius * 1.1547) / kh,
          (props.radius * 2) / kh,
          (props.radius * 1.1547) / kh,
          tx,
          ty,
          157.5 + Number(note.pos) * 45,
          1,
          0,
          0,
          image.width,
          values.holdHeadHeight
        );
      }
    };

    const drawTouchImage = (image: HTMLImageElement, imageCenter: HTMLImageElement) => {
      const centerx = x,
        centery = y;
      let k = (0.65 * values.maimaiScreenR) / 350,
        centerk = (0.8 * values.maimaiScreenR) / 350;

      const alpha = props.status === 0 ? props.radius / values.maimaiTapR : ghostNoteAlphaCalculation(note.type, props.rho);
      console.log(centerx, centery, getPosCenterCoord('A1', values), x, y);
      // 多重TOUCH线
      if ((note.innerTouchOverlap ?? 0) > 0) {
        drawRotationImage(
          ctx,
          note.innerTouchOverlap === 1 ? NoteIcon.touch_two : NoteIcon.touch_each_two,
          x - (NoteIcon.touch_two.width * centerk) / 2,
          y - (NoteIcon.touch_two.height * centerk) / 2,
          NoteIcon.touch_two.width * centerk,
          NoteIcon.touch_two.height * centerk
        );
      }
      if ((note.outerTouchOverlap ?? 0) > 0) {
        drawRotationImage(
          ctx,
          note.outerTouchOverlap === 1 ? NoteIcon.touch_three : NoteIcon.touch_each_three,
          x - (NoteIcon.touch_three.width * centerk) / 2,
          y - (NoteIcon.touch_three.height * centerk) / 2,
          NoteIcon.touch_three.width * centerk,
          NoteIcon.touch_three.height * centerk
        );
      }

      for (let i = 0; i < 4; i++) {
        // 从下方的叶片开始顺时针绘制
        drawRotationImage(ctx, image, x - (image.width * k) / 2, y + values.touchMaxDistance - (6.5 * values.maimaiScreenR) / 350 - props.rho, image.width * k, image.height * k, x, y, 90 * i, alpha);
      }
      // 中心点
      drawRotationImage(ctx, imageCenter, x - (imageCenter.width * k) / 2, y - (imageCenter.height * k) / 2, imageCenter.width * k, imageCenter.height * k, 0, 0, alpha);
      // if (props.touched) {
      // 	drawRotationImage(ctx, NoteIcon.touch_just, x - (NoteIcon.touch_just.width ) / 2, y - (NoteIcon.touch_just.height ) / 2, NoteIcon.touch_just.width , NoteIcon.touch_just.height );
      // }
    };

    const drawTouchHoldImage = (is_miss: boolean, isShortHold: boolean = false, imageTouchTwo: HTMLImageElement, imageTouchThree: HTMLImageElement, isBreak?: boolean) => {
      const centerx = x,
        centery = y;

      const alpha = ghostNoteAlphaCalculation(note.type, props.rho);

      let k = (0.65 * values.maimaiScreenR) / 350,
        centerk = (0.8 * values.maimaiScreenR) / 350;

      const touchHoldPieces = isBreak
        ? is_miss
          ? [NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss]
          : [NoteIcon.touch_hold_1, NoteIcon.touch_hold_1, NoteIcon.touch_hold_1, NoteIcon.touch_hold_1]
        : is_miss
        ? [NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss]
        : [NoteIcon.touch_hold_1, NoteIcon.touch_hold_2, NoteIcon.touch_hold_3, NoteIcon.touch_hold_4];
      const touchHoldCenter = isBreak ? (is_miss ? NoteIcon.touch_hold_center_miss : NoteIcon.touch_break_center) : is_miss ? NoteIcon.touch_hold_center_miss : NoteIcon.touch_center;
      const touchHoldGage = isBreak ? (is_miss ? NoteIcon.touch_hold_gage_miss_break : NoteIcon.touch_hold_gage_break) : is_miss ? NoteIcon.touch_hold_gage_miss : NoteIcon.touch_hold_gage;

      // 多重TOUCH线
      if ((note.innerTouchOverlap ?? 0) > 0) {
        drawRotationImage(ctx, imageTouchTwo, x - (imageTouchTwo.width * centerk) / 2, y - (imageTouchTwo.height * centerk) / 2, imageTouchTwo.width * centerk, imageTouchTwo.height * centerk);
      }
      if ((note.outerTouchOverlap ?? 0) > 0) {
        drawRotationImage(
          ctx,
          imageTouchThree,
          x - (imageTouchThree.width * centerk) / 2,
          y - (imageTouchThree.height * centerk) / 2,
          imageTouchThree.width * centerk,
          imageTouchThree.height * centerk
        );
      }

      if (isShortHold) {
        for (let i = 0; i < 4; i++) {
          drawRotationImage(
            ctx,
            touchHoldPieces[i],
            x - (touchHoldPieces[i].width * k) / 2,
            y + values.touchMaxDistance - (6.5 * values.maimaiScreenR) / 350 - props.rho,
            touchHoldPieces[i].width * k,
            touchHoldPieces[i].height * k,
            x,
            y,
            135 + 90 * i,
            props.radius / values.maimaiTapR
          );
        }
        drawRotationImage(
          ctx,
          touchHoldCenter,
          x - (touchHoldCenter.width * centerk) / 2,
          y - (touchHoldCenter.height * centerk) / 2,
          touchHoldCenter.width * centerk,
          touchHoldCenter.height * centerk
        );
      } else {
        if (props.status === 0 || props.status === 1) {
          for (let i = 0; i < 4; i++) {
            drawRotationImage(
              ctx,
              touchHoldPieces[i],
              x - (touchHoldPieces[i].width * k) / 2,
              y + values.touchMaxDistance - (6.5 * values.maimaiScreenR) / 350 - props.rho,
              touchHoldPieces[i].width * k,
              touchHoldPieces[i].height * k,
              x,
              y,
              135 + 90 * i,
              props.radius / values.maimaiTapR
            );
          }
          drawRotationImage(
            ctx,
            touchHoldCenter,
            x - (touchHoldCenter.width * centerk) / 2,
            y - (touchHoldCenter.height * centerk) / 2,
            touchHoldCenter.width * centerk,
            touchHoldCenter.height * centerk
          );
        } else if (props.status === 2) {
          for (let i = 0; i < 4; i++) {
            drawRotationImage(
              ctx,
              touchHoldPieces[i],
              x - (touchHoldPieces[i].width * k) / 2,
              y + values.touchMaxDistance - (6.5 * values.maimaiScreenR) / 350 - props.rho,
              touchHoldPieces[i].width * k,
              touchHoldPieces[i].height * k,
              x,
              y,
              135 + 90 * i,
              props.radius / values.maimaiTapR
            );
          }
          drawRotationImage(
            ctx,
            touchHoldCenter,
            x - (touchHoldCenter.width * centerk) / 2,
            y - (touchHoldCenter.height * centerk) / 2,
            touchHoldCenter.width * centerk,
            touchHoldCenter.height * centerk
          );

          // draw gage
          /** gage截取角度 */
          const angle = props.tailRho - 0.5 * π;

          const cutCircleR = touchHoldGage.width * centerk;
          ctx.save();

          ctx.beginPath();
          ctx.moveTo(x, y - cutCircleR);
          ctx.lineTo(x, y);

          tx = x + cutCircleR * Math.cos(angle);
          ty = y + cutCircleR * Math.sin(angle);

          ctx.lineTo(tx, ty);

          if (angle >= 1.5 * Math.PI && angle <= 2 * Math.PI) {
            ctx.lineTo(x - cutCircleR, y - cutCircleR);
          }
          if (angle >= Math.PI && angle <= 2 * Math.PI) {
            ctx.lineTo(x - cutCircleR, y + cutCircleR);
          }
          if (angle >= 0.5 * Math.PI && angle <= 2 * Math.PI) {
            ctx.lineTo(x + cutCircleR, y + cutCircleR);
          }
          if (angle >= 0 && angle <= 2 * Math.PI) {
            ctx.lineTo(x + cutCircleR, y - cutCircleR);
          }

          ctx.lineTo(x, y - cutCircleR);
          ctx.closePath();
          // 画出截取区域 调试用
          // ctx.strokeStyle = 'red';
          // ctx.stroke();
          ctx.clip();

          drawRotationImage(ctx, touchHoldGage, x - (touchHoldGage.width * centerk) / 2, y - (touchHoldGage.height * centerk) / 2, touchHoldGage.width * centerk, touchHoldGage.height * centerk);
          ctx.restore();
        }
      }
    };

    const drawSlideTrackImage = (imageTrack: HTMLImageElement, imageStar: HTMLImageElement, wifiTrack?: HTMLImageElement[]) => {
      const alpha = ghostNoteAlphaCalculation(note.type, props.rho);

      const drawSlideTrackImage_ = () => {
        if (note.isChain) {
          // 人体蜈蚣
          // 得从後往前
          for (let j = note.slideLines?.length! - 1; j >= props.currentLineIndex; j--) {
            const slideLine = note.slideLines![j];
            if (slideLine.slideType !== 'w') {
              // SLIDE TRACK
              if (/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndex !== -1) {
                // 间隔放置TRACK元素的时间
                const trackItemGapTime =
                  (values.trackItemGap * slideLine.remainTime!) /
                  trackLength(slideLine.slideType!, values, slideLine.pos, slideLine.endPos, slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos));

                // SLIDE分段信息
                const sectionInfo = slideLine.sections as SectionInfo[];

                // 画SLIDE TRACK
                ctx_slideTrack.save();
                ctx_slideTrack.translate(values.center[0], values.center[1]);
                ctx_slideTrack.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);
                // 得从後往前画
                for (let i = slideLine.remainTime!; i >= sectionInfo![j === props.currentLineIndex ? props.currentSectionIndex : 0].start * slideLine.remainTime!; i -= trackItemGapTime) {
                  const slideData = getTrackProps(
                    values,
                    slideLine.slideType!,
                    slideLine.pos,
                    slideLine.endPos,
                    i,
                    slideLine.remainTime!,
                    slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos)
                  ) as {
                    x: number;
                    y: number;
                    direction: number;
                  };
                  drawRotationImage(
                    ctx_slideTrack,
                    imageTrack,
                    slideData.x - values.trackItemWidth / 2 - values.center[0],
                    slideData.y - values.trackItemHeight / 2 - values.center[1],
                    values.trackItemWidth,
                    values.trackItemHeight,
                    slideData.x - values.center[0],
                    slideData.y - values.center[1],
                    slideData.direction,
                    props.radius * alpha
                  );
                }
                ctx_slideTrack.restore();
              }
            } else {
              // WIFI 人体蜈蚣（会有这种存在吗（
              if (/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndexWifi[0] === -1 && props.currentSectionIndexWifi[1] === -1 && props.currentSectionIndexWifi[2] === -1) {
              } else {
                /** 目前Wifi中最小的还没画完的index, 也决定了要画的组的数量 (0 最多，6 最少)*/
                let min = 6;
                if (props.currentLineIndex === j) {
                  props.currentSectionIndexWifi.forEach(w => {
                    if (w !== -1 && w <= min) min = w;
                  });
                } else {
                  min = 0;
                }

                // WIFI TRACK

                // WIFI TRACK开始于screenR而不是judgeR
                const startPoint = [values.center[0] + values.maimaiScreenR * cos((-5 / 8 + 1 / 4) * Math.PI), values.center[1] + values.maimaiScreenR * sin((-5 / 8 + 1 / 4) * Math.PI)];
                const getWifiTrackProps = (ct: number, rt: number): { x: number; y: number; direction: number }[] => {
                  return [
                    {
                      x: startPoint[0] + (values.APositions.J[5][0] - startPoint[0]) * (ct / rt),
                      y: startPoint[1] + (values.APositions.J[5][1] - startPoint[1]) * (ct / rt),
                      direction: 22.5 * 5 + 202.5,
                    },
                    {
                      x: startPoint[0] + (values.APositions.J[4][0] - startPoint[0]) * (ct / rt),
                      y: startPoint[1] + (values.APositions.J[4][1] - startPoint[1]) * (ct / rt),
                      direction: 22.5 * 4 + 202.5,
                    },
                    {
                      x: 2 * values.APositions.J[0][0] - startPoint[0] + (values.APositions.J[3][0] - 2 * values.APositions.J[0][0] + startPoint[0]) * (ct / rt),
                      y: startPoint[1] + (values.APositions.J[3][1] - startPoint[1]) * (ct / rt),
                      direction: 22.5 * 3 + 202.5,
                    },
                  ];
                };

                // 相邻两判定点的距离
                const dist = lineLen(values.APositions.J[4][0], values.APositions.J[4][1], values.APositions.J[5][0], values.APositions.J[5][1]);

                // SLIDE TRACK
                ctx_slideTrack.save();
                ctx_slideTrack.translate(values.center[0], values.center[1]);
                ctx_slideTrack.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);
                // 得从後往前画

                for (let i = 11; i >= min * 2 + (min === 0 ? 1 : 2); i--) {
                  const ct = (slideLine.remainTime! * i) / 12;

                  const slideData = getWifiTrackProps(ct, slideLine.remainTime!);

                  drawRotationImage(
                    ctx_slideTrack,
                    wifiTrack![i - 1],
                    slideData[0].x - values.center[0] - ((dist * i) / 12) * 0.076,
                    slideData[0].y - values.center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
                    (dist * i) / 12,
                    ((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
                    slideData[0].x - values.center[0],
                    slideData[0].y - values.center[1],
                    22.534119524645373,
                    props.radius * 0.5 * alpha
                  );

                  ctx_slideTrack.save();
                  ctx_slideTrack.scale(-1, 1); //左右镜像翻转
                  drawRotationImage(
                    ctx_slideTrack,
                    wifiTrack![i - 1],
                    slideData[2].x - (values.APositions.J[0][0] - values.APositions.J[7][0]) - values.center[0] - ((dist * i) / 12) * 0.076,
                    slideData[2].y - values.center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
                    (dist * i) / 12,
                    ((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
                    slideData[2].x - (values.APositions.J[0][0] - values.APositions.J[7][0]) - values.center[0],
                    slideData[2].y - values.center[1],
                    -22.534119524645373,
                    props.radius * 0.5 * alpha
                  );
                  ctx_slideTrack.restore();
                }
                ctx_slideTrack.restore();
              }
            }
          }

          // 人体蜈蚣 GUIDE STAR
          console.log(note.slideLines, props.currentGuideStarLineIndex);
          if (props.currentGuideStarLineIndex !== -1) {
            const slideLine = note.slideLines![props.currentGuideStarLineIndex];
            if (slideLine.slideType !== 'w') {
              // 人体蜈蚣 GUIDE STAR
              if (!note.isNoTapNoTameTimeSlide || (note.isNoTapNoTameTimeSlide && props.status === 2)) {
                console.log(props.currentGuideStarLineIndex, props.currentLineIndex);
                console.log(0);
                ctx.save();
                ctx.translate(values.center[0], values.center[1]);
                ctx.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);

                const guideStarData = getTrackProps(
                  values,
                  slideLine.slideType!,
                  slideLine.pos,
                  slideLine.endPos,
                  props.rho - slideLine.beginTime!,
                  slideLine.remainTime!,
                  slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos)
                ) as {
                  x: number;
                  y: number;
                  direction: number;
                };

                drawRotationImage(
                  ctx,
                  imageStar,
                  guideStarData.x - props.guideStarRadius! * 2 - values.center[0],
                  guideStarData.y - props.guideStarRadius! * 2 - values.center[1],
                  props.guideStarRadius! * 4,
                  props.guideStarRadius! * 4,
                  guideStarData.x - values.center[0],
                  guideStarData.y - values.center[1],
                  guideStarData.direction,
                  (props.guideStarRadius! / values.maimaiTapR) * alpha
                );
                ctx.restore();
              }
            } else {
              // 人体蜈蚣 WIFI GUIDE STAR
              if (!note.isNoTapNoTameTimeSlide || (note.isNoTapNoTameTimeSlide && props.status === 2)) {
                ctx.save();
                ctx.translate(values.center[0], values.center[1]);
                ctx.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);

                const guideStarData = getTrackProps(
                  values,
                  slideLine.slideType!,
                  slideLine.pos,
                  slideLine.endPos,
                  props.rho - slideLine.beginTime!,
                  slideLine.remainTime!,
                  slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos)
                ) as {
                  x: number;
                  y: number;
                  direction: number;
                }[];
                guideStarData.forEach(wifiguide => {
                  drawRotationImage(
                    ctx,
                    imageStar,
                    wifiguide.x - props.guideStarRadius! * 2 - values.center[0],
                    wifiguide.y - props.guideStarRadius! * 2 - values.center[1],
                    props.guideStarRadius! * 4,
                    props.guideStarRadius! * 4,
                    wifiguide.x - values.center[0],
                    wifiguide.y - values.center[1],
                    wifiguide.direction,
                    (props.guideStarRadius! / values.maimaiTapR) * alpha
                  );
                });

                ctx.restore();
              }
            }
          }
        } else {
          // 正常
          if (note.slideType !== 'w') {
            // SLIDE TRACK
            if (/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndex !== -1) {
              // 间隔放置TRACK元素的时间
              const trackItemGapTime =
                (values.trackItemGap * note.remainTime!) / trackLength(note.slideType!, values, note.pos, note.endPos, note.turnPos === undefined ? undefined : Number(note.turnPos));

              // SLIDE分段信息
              const sectionInfo = note.sections as SectionInfo[];

              // 画SLIDE TRACK
              ctx_slideTrack.save();
              ctx_slideTrack.translate(values.center[0], values.center[1]);
              ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);
              // 得从後往前画
              for (let i = note.remainTime!; i >= sectionInfo![props.currentSectionIndex].start * note.remainTime!; i -= trackItemGapTime) {
                const slideData = getTrackProps(values, note.slideType!, note.pos, note.endPos, i, note.remainTime!, note.turnPos === undefined ? undefined : Number(note.turnPos)) as {
                  x: number;
                  y: number;
                  direction: number;
                };
                drawRotationImage(
                  ctx_slideTrack,
                  imageTrack,
                  slideData.x - values.trackItemWidth / 2 - values.center[0],
                  slideData.y - values.trackItemHeight / 2 - values.center[1],
                  values.trackItemWidth,
                  values.trackItemHeight,
                  slideData.x - values.center[0],
                  slideData.y - values.center[1],
                  slideData.direction,
                  props.radius * alpha
                );
              }
              ctx_slideTrack.restore();
            }

            // GUIDE STAR
            if (!note.isNoTapNoTameTimeSlide || (note.isNoTapNoTameTimeSlide && props.status === 2)) {
              ctx.save();
              ctx.translate(values.center[0], values.center[1]);
              ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

              const guideStarData = getTrackProps(values, note.slideType!, note.pos, note.endPos, props.rho, note.remainTime!, note.turnPos === undefined ? undefined : Number(note.turnPos)) as {
                x: number;
                y: number;
                direction: number;
              };
              drawRotationImage(
                ctx,
                imageStar,
                guideStarData.x - props.guideStarRadius! * 2 - values.center[0],
                guideStarData.y - props.guideStarRadius! * 2 - values.center[1],
                props.guideStarRadius! * 4,
                props.guideStarRadius! * 4,
                guideStarData.x - values.center[0],
                guideStarData.y - values.center[1],
                guideStarData.direction,
                (props.guideStarRadius! / values.maimaiTapR) * alpha
              );
              ctx.restore();
            }
          } else {
            if (/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndexWifi[0] === -1 && props.currentSectionIndexWifi[1] === -1 && props.currentSectionIndexWifi[2] === -1) {
            } else {
              /** 目前Wifi中最小的还没画完的index, 也决定了要画的数量 */
              let min = 6;
              props.currentSectionIndexWifi.forEach(w => {
                if (w !== -1 && w <= min) min = w;
              });

              // WIFI TRACK

              // WIFI TRACK开始于screenR而不是judgeR
              const startPoint = [values.center[0] + values.maimaiScreenR * cos((-5 / 8 + 1 / 4) * Math.PI), values.center[1] + values.maimaiScreenR * sin((-5 / 8 + 1 / 4) * Math.PI)];
              const getWifiTrackProps = (ct: number, rt: number): { x: number; y: number; direction: number }[] => {
                return [
                  {
                    x: startPoint[0] + (values.APositions.J[5][0] - startPoint[0]) * (ct / rt),
                    y: startPoint[1] + (values.APositions.J[5][1] - startPoint[1]) * (ct / rt),
                    direction: 22.5 * 5 + 202.5,
                  },
                  {
                    x: startPoint[0] + (values.APositions.J[4][0] - startPoint[0]) * (ct / rt),
                    y: startPoint[1] + (values.APositions.J[4][1] - startPoint[1]) * (ct / rt),
                    direction: 22.5 * 4 + 202.5,
                  },
                  {
                    x: 2 * values.APositions.J[0][0] - startPoint[0] + (values.APositions.J[3][0] - 2 * values.APositions.J[0][0] + startPoint[0]) * (ct / rt),
                    y: startPoint[1] + (values.APositions.J[3][1] - startPoint[1]) * (ct / rt),
                    direction: 22.5 * 3 + 202.5,
                  },
                ];
              };

              // 相邻两判定点的距离
              const dist = lineLen(values.APositions.J[4][0], values.APositions.J[4][1], values.APositions.J[5][0], values.APositions.J[5][1]);

              // SLIDE TRACK
              ctx_slideTrack.save();
              ctx_slideTrack.translate(values.center[0], values.center[1]);
              ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);
              // 得从後往前画

              for (let i = 11; i >= min * 2 + (min === 0 ? 1 : 2); i--) {
                const ct = (note.remainTime! * i) / 12;

                const slideData = getWifiTrackProps(ct, note.remainTime!);

                drawRotationImage(
                  ctx_slideTrack,
                  wifiTrack![i - 1],
                  slideData[0].x - values.center[0] - ((dist * i) / 12) * 0.076,
                  slideData[0].y - values.center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
                  (dist * i) / 12,
                  ((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
                  slideData[0].x - values.center[0],
                  slideData[0].y - values.center[1],
                  22.534119524645373,
                  props.radius * 0.5 * alpha
                );

                ctx_slideTrack.save();
                ctx_slideTrack.scale(-1, 1); //左右镜像翻转
                drawRotationImage(
                  ctx_slideTrack,
                  wifiTrack![i - 1],
                  slideData[2].x - (values.APositions.J[0][0] - values.APositions.J[7][0]) - values.center[0] - ((dist * i) / 12) * 0.076,
                  slideData[2].y - values.center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
                  (dist * i) / 12,
                  ((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
                  slideData[2].x - (values.APositions.J[0][0] - values.APositions.J[7][0]) - values.center[0],
                  slideData[2].y - values.center[1],
                  -22.534119524645373,
                  props.radius * 0.5 * alpha
                );
                ctx_slideTrack.restore();
              }
              ctx_slideTrack.restore();

              // GUIDE STAR
              if (!note.isNoTapNoTameTimeSlide || (note.isNoTapNoTameTimeSlide && props.status === 2)) {
                ctx.save();
                ctx.translate(values.center[0], values.center[1]);
                ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

                const guideStarData = getTrackProps(values, note.slideType!, note.pos, note.endPos, props.rho, note.remainTime!, note.turnPos === undefined ? undefined : Number(note.turnPos)) as {
                  x: number;
                  y: number;
                  direction: number;
                }[];
                guideStarData.forEach(wifiguide => {
                  drawRotationImage(
                    ctx,
                    imageStar,
                    wifiguide.x - props.guideStarRadius! * 2 - values.center[0],
                    wifiguide.y - props.guideStarRadius! * 2 - values.center[1],
                    props.guideStarRadius! * 4,
                    props.guideStarRadius! * 4,
                    wifiguide.x - values.center[0],
                    wifiguide.y - values.center[1],
                    wifiguide.direction,
                    (props.guideStarRadius! / values.maimaiTapR) * alpha
                  );
                });

                ctx.restore();
              }
            }
          }
        }
      };

      drawSlideTrackImage_();
    };

    /// SPEC

    const drawTouchSlideImage = (image: HTMLImageElement, imageCenter: HTMLImageElement) => {
      const centerx = x,
        centery = y;
      let k = (0.65 * values.maimaiScreenR) / 350,
        centerk = (0.8 * values.maimaiScreenR) / 350;

      const alpha = props.status === 0 ? props.radius / values.maimaiTapR : ghostNoteAlphaCalculation(note.type, props.rho);

      // 多重TOUCH线
      if ((note.innerTouchOverlap ?? 0) > 0) {
        drawRotationImage(
          ctx,
          note.innerTouchOverlap === 1 ? NoteIcon.touch_two : NoteIcon.touch_each_two,
          x - (NoteIcon.touch_two.width * centerk) / 2,
          y - (NoteIcon.touch_two.height * centerk) / 2,
          NoteIcon.touch_two.width * centerk,
          NoteIcon.touch_two.height * centerk
        );
      }
      if ((note.outerTouchOverlap ?? 0) > 0) {
        drawRotationImage(
          ctx,
          note.outerTouchOverlap === 1 ? NoteIcon.touch_three : NoteIcon.touch_each_three,
          x - (NoteIcon.touch_three.width * centerk) / 2,
          y - (NoteIcon.touch_three.height * centerk) / 2,
          NoteIcon.touch_three.width * centerk,
          NoteIcon.touch_three.height * centerk
        );
      }
      for (let i = 0; i < 5; i++) {
        // 从下方的叶片开始顺时针绘制
        drawRotationImage(
          ctx,
          image,
          x - (image.width * k) / 2,
          y + values.touchSlideMaxDistance - (6.5 * values.maimaiScreenR) / 300 - props.rho,
          image.width * k,
          image.height * k,
          x,
          y,
          72 * i,
          alpha
        );
      }
      // 中心点
      drawRotationImage(ctx, imageCenter, x - (imageCenter.width * k) / 2, y - (imageCenter.height * k) / 2, imageCenter.width * k, imageCenter.height * k, 0, 0, alpha);
      // if (props.touched) {
      // 	drawRotationImage(ctx, NoteIcon.touch_just, x - (NoteIcon.touch_just.width ) / 2, y - (NoteIcon.touch_just.height ) / 2, NoteIcon.touch_just.width , NoteIcon.touch_just.height );
      // }
    };

    /** 画！ */
    const draw = () => {
      switch (note.type) {
        case NoteType.Tap:
          if (note.isTrap) {
            drawTapImage(tapTrapIcon);
            if (note.isEx) {
              drawTapImage(tapExIcon);
            }
          } else {
            if (isEach) {
              if (note.isBreak) {
                drawTapImage(tapBreakIcon);
                if (note.isEx) {
                  drawTapImage(tapExBreakIcon);
                }
              } else {
                drawTapImage(tapEachIcon);
                if (note.isEx) {
                  drawTapImage(tapExEachIcon);
                }
              }
            } else {
              if (note.isBreak) {
                drawTapImage(tapBreakIcon);
                if (note.isEx) {
                  drawTapImage(tapExBreakIcon);
                }
              } else {
                drawTapImage(tapIcon);
                if (note.isEx) {
                  drawTapImage(tapExIcon);
                }
              }
            }
          }

          break;
        case NoteType.Hold:
          if (props.isTouching || (!props.isTouching && props.rho < values.maimaiJudgeLineR - values.maimaiSummonLineR)) {
            if (isEach) {
              if (note.isBreak) {
                drawHoldImage(holdBreakIcon, note.isShortHold);
                if (note.isEx) {
                  drawHoldImage(holdExBreakIcon, note.isShortHold);
                }
              } else {
                drawHoldImage(holdEachIcon, note.isShortHold);
                if (note.isEx) {
                  drawHoldImage(holdExEachIcon, note.isShortHold);
                }
              }
            } else {
              if (note.isBreak) {
                drawHoldImage(holdBreakIcon, note.isShortHold);
                if (note.isEx) {
                  drawHoldImage(holdExBreakIcon, note.isShortHold);
                }
              } else {
                drawHoldImage(holdIcon, note.isShortHold);
                if (note.isEx) {
                  drawHoldImage(holdExIcon, note.isShortHold);
                }
              }
            }
          } else {
            drawHoldImage(holdMissIcon, note.isShortHold);
            if (note.isEx) {
              drawHoldImage(holdExMissIcon, note.isShortHold);
            }
          }

          break;
        case NoteType.Slide:
          // console.log(note, note.slideTracks)
          if (note.slideTracks?.length! > 1) {
            // DOUBLE TRACK
            if (isEach) {
              if (note.isBreak) {
                drawSlideTapImage(starDoubleBreakIcon);
                if (note.isEx) {
                  drawSlideTapImage(starDoubleExBreakIcon);
                }
              } else {
                drawSlideTapImage(starDoubleEachIcon);
                if (note.isEx) {
                  drawSlideTapImage(starDoubleExEachIcon);
                }
              }
            } else {
              if (note.isBreak) {
                drawSlideTapImage(starDoubleBreakIcon);
                if (note.isEx) {
                  drawSlideTapImage(starDoubleExBreakIcon);
                }
              } else {
                drawSlideTapImage(starDoubleIcon);
                if (note.isEx) {
                  drawSlideTapImage(starDoubleExIcon);
                }
              }
            }
          } else {
            // SINGLE
            if (isEach) {
              if (note.isBreak) {
                drawSlideTapImage(starBreakIcon);
                if (note.isEx) {
                  drawSlideTapImage(starExBreakIcon);
                }
              } else {
                drawSlideTapImage(starEachIcon);
                if (note.isEx) {
                  drawSlideTapImage(starExEachIcon);
                }
              }
            } else {
              if (note.isBreak) {
                drawSlideTapImage(starBreakIcon);
                if (note.isEx) {
                  drawSlideTapImage(starExBreakIcon);
                }
              } else {
                drawSlideTapImage(starIcon);
                if (note.isEx) {
                  drawSlideTapImage(starExIcon);
                }
              }
            }
          }
          break;
        case NoteType.Touch:
          if (note.isTrap) {
            drawTouchImage(NoteIcon.touch_trap, NoteIcon.touch_trap_center);
          } else {
            if (isEach) {
              if (note.isBreak) {
                drawTouchImage(NoteIcon.touch_break, NoteIcon.touch_break_center);
              } else {
                drawTouchImage(NoteIcon.touch_each, NoteIcon.touch_each_center);
              }
            } else {
              if (note.isBreak) {
                drawTouchImage(NoteIcon.touch_break, NoteIcon.touch_break_center);
              } else {
                drawTouchImage(NoteIcon.touch, NoteIcon.touch_center);
              }
            }
          }
          break;
        case NoteType.TouchHold:
          if (props.isTouching || (!props.isTouching && props.tailRho <= 0)) {
            drawTouchHoldImage(false, note.isShortHold, NoteIcon.touch_hold_two, NoteIcon.touch_hold_three, note.isBreak);
          } else {
            drawTouchHoldImage(true, note.isShortHold, NoteIcon.touch_hold_two, NoteIcon.touch_hold_three, note.isBreak);
          }

          break;
        case NoteType.SlideTrack:
          if (isEach) {
            if (note.isBreak) {
              drawSlideTrackImage(slideBreakIcon, starBreakIcon, [
                NoteIcon.wifi_break_0,
                NoteIcon.wifi_break_1,
                NoteIcon.wifi_break_2,
                NoteIcon.wifi_break_3,
                NoteIcon.wifi_break_4,
                NoteIcon.wifi_break_5,
                NoteIcon.wifi_break_6,
                NoteIcon.wifi_break_7,
                NoteIcon.wifi_break_8,
                NoteIcon.wifi_break_9,
                NoteIcon.wifi_break_10,
              ]);
              if (note.isEx) {
                drawSlideTrackImage(slideExIcon, starExBreakIcon, [
                  NoteIcon.wifi_ex_0,
                  NoteIcon.wifi_ex_1,
                  NoteIcon.wifi_ex_2,
                  NoteIcon.wifi_ex_3,
                  NoteIcon.wifi_ex_4,
                  NoteIcon.wifi_ex_5,
                  NoteIcon.wifi_ex_6,
                  NoteIcon.wifi_ex_7,
                  NoteIcon.wifi_ex_8,
                  NoteIcon.wifi_ex_9,
                  NoteIcon.wifi_ex_10,
                ]);
              }
            } else {
              drawSlideTrackImage(slideEachIcon, starEachIcon, [
                NoteIcon.wifi_each_0,
                NoteIcon.wifi_each_1,
                NoteIcon.wifi_each_2,
                NoteIcon.wifi_each_3,
                NoteIcon.wifi_each_4,
                NoteIcon.wifi_each_5,
                NoteIcon.wifi_each_6,
                NoteIcon.wifi_each_7,
                NoteIcon.wifi_each_8,
                NoteIcon.wifi_each_9,
                NoteIcon.wifi_each_10,
              ]);
              if (note.isEx) {
                drawSlideTrackImage(slideExIcon, starExEachIcon, [
                  NoteIcon.wifi_ex_0,
                  NoteIcon.wifi_ex_1,
                  NoteIcon.wifi_ex_2,
                  NoteIcon.wifi_ex_3,
                  NoteIcon.wifi_ex_4,
                  NoteIcon.wifi_ex_5,
                  NoteIcon.wifi_ex_6,
                  NoteIcon.wifi_ex_7,
                  NoteIcon.wifi_ex_8,
                  NoteIcon.wifi_ex_9,
                  NoteIcon.wifi_ex_10,
                ]);
              }
            }
          } else {
            if (note.isBreak) {
              drawSlideTrackImage(slideBreakIcon, starBreakIcon, [
                NoteIcon.wifi_break_0,
                NoteIcon.wifi_break_1,
                NoteIcon.wifi_break_2,
                NoteIcon.wifi_break_3,
                NoteIcon.wifi_break_4,
                NoteIcon.wifi_break_5,
                NoteIcon.wifi_break_6,
                NoteIcon.wifi_break_7,
                NoteIcon.wifi_break_8,
                NoteIcon.wifi_break_9,
                NoteIcon.wifi_break_10,
              ]);
              if (note.isEx) {
                drawSlideTrackImage(slideExIcon, starExBreakIcon, [
                  NoteIcon.wifi_ex_0,
                  NoteIcon.wifi_ex_1,
                  NoteIcon.wifi_ex_2,
                  NoteIcon.wifi_ex_3,
                  NoteIcon.wifi_ex_4,
                  NoteIcon.wifi_ex_5,
                  NoteIcon.wifi_ex_6,
                  NoteIcon.wifi_ex_7,
                  NoteIcon.wifi_ex_8,
                  NoteIcon.wifi_ex_9,
                  NoteIcon.wifi_ex_10,
                ]);
              }
            } else {
              drawSlideTrackImage(slideIcon, starIcon, [
                NoteIcon.wifi_0,
                NoteIcon.wifi_1,
                NoteIcon.wifi_2,
                NoteIcon.wifi_3,
                NoteIcon.wifi_4,
                NoteIcon.wifi_5,
                NoteIcon.wifi_6,
                NoteIcon.wifi_7,
                NoteIcon.wifi_8,
                NoteIcon.wifi_9,
                NoteIcon.wifi_10,
              ]);
              if (note.isEx) {
                drawSlideTrackImage(slideExIcon, starExIcon, [
                  NoteIcon.wifi_ex_0,
                  NoteIcon.wifi_ex_1,
                  NoteIcon.wifi_ex_2,
                  NoteIcon.wifi_ex_3,
                  NoteIcon.wifi_ex_4,
                  NoteIcon.wifi_ex_5,
                  NoteIcon.wifi_ex_6,
                  NoteIcon.wifi_ex_7,
                  NoteIcon.wifi_ex_8,
                  NoteIcon.wifi_ex_9,
                  NoteIcon.wifi_ex_10,
                ]);
              }
            }
          }
          break;
        case NoteType.Spec_TouchSlide:
          if (note.isTrap) {
            drawTouchSlideImage(NoteIcon.touch_slide, NoteIcon.touch_trap_center);
          } else {
            if (isEach) {
              if (note.isBreak) {
                drawTouchSlideImage(NoteIcon.touch_slide, NoteIcon.touch_break_center);
              } else {
                drawTouchSlideImage(NoteIcon.touch_slide, NoteIcon.touch_each_center);
              }
            } else {
              if (note.isBreak) {
                drawTouchSlideImage(NoteIcon.touch_slide, NoteIcon.touch_break_center);
              } else {
                drawTouchSlideImage(NoteIcon.touch_slide, NoteIcon.touch_center);
              }
            }
          }
          break;
        case NoteType.EndMark:
          //finish();
          break;
      }
    };

    if (note.isInvisible) {
    } else if (note.isGhost) {
      if (props.status === 0 || props.status === 1) {
        draw();
      }
    } else {
      draw();
    }
  } else if (props.status === -3) {
    // 显示判定
    if (doShowJudgement) {
      const drawJudgeImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number, centerX: number, centerY: number, r?: number) => {
        const key = 'judge' + note.serial;
        const total = values.judgeResultShowTime + values.judgeResultFadeOutDuration;
        animationFactory.animation(key, total, (t: number) => {
          let alpha = 1;
          let scale = 1;
          if (t < values.judgeResultShowTime) {
            // 出现时的缩小效果（暂定为持续 1/3 倍的显示时间并且仅用于 TAP 音符）
            const shrinkDuration = values.judgeResultShowTime / 3;
            if (note.type === NoteType.Tap) {
              if (t < shrinkDuration) {
                scale = 1 + 0.2 * (1 - t / shrinkDuration);
              } else {
                scale = 1;
              }
            }
          } else {
            // 消失时的淡出效果
            alpha = 1 - (t - values.judgeResultShowTime) / values.judgeResultFadeOutDuration;
          }
          drawRotationImage(ctx, image, x + w * ((1 - scale) / 2), y + h * ((1 - scale) / 2), w * scale, h * scale, centerX, centerY, r, alpha);
        });
      };

      let θ = 0,
        // Note所在的坐标
        x = 0,
        y = 0;

      let judgeImage: HTMLImageElement = JudgeIcon.UI_GAM_Break;
      let fastlateImage: HTMLImageElement;

      if (note.type === NoteType.SlideTrack) {
        // SLIDE TRACK的环形判定显示

        // 拿到SLIDE TRACK的结束点
        let lastLine: SlideLine;
        if (note.isChain) {
          lastLine = note.slideLines![note.slideLines?.length! - 1];
        } else {
          lastLine = note;
        }

        let lastLineDirection = note.slideLineDirectionParams?.direction;
        let lastLineEndPos = Number(lastLine.endPos);
        let lastLineStartPos = Number(lastLine.pos);

        switch (note.slideLineDirectionParams?.image) {
          case 0:
            // 直线
            switch (lastLineDirection) {
              case 0:
                //向左
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_Slide_L_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_Late;
                    }
                    break;
                }
                break;
              case 1:
                //向右
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_Slide_R_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_Slide_R_Late;
                    }
                    break;
                }
                break;
              default:
                break;
            }
            break;
          case 1:
            // 弯曲

            switch (lastLineDirection) {
              case 0:
                //向左
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_L_Late;
                    }
                    break;
                }
                break;
              case 1:
                //向右
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideCircle_R_Late;
                    }
                    break;
                }
                break;
              default:
                break;
            }
            break;

          case 2:
            // 扇形
            switch (lastLineDirection) {
              case 0:
                //向上
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_SlideFan_U_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_U_Late;
                    }
                    break;
                }
                break;
              case 1:
                //向下
                switch (props.judgeStatus) {
                  case JudgeStatus.CriticalPerfect:
                    judgeImage = JudgeIcon.UI_GAM_SlideFan_D_Critical;
                    break;
                  case JudgeStatus.Perfect:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_FastPerfect_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_LatePerfect_01;
                    }
                    break;
                  case JudgeStatus.Great:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_FastGreat_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_LateGreat_01;
                    }
                    break;
                  case JudgeStatus.Good:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_Slide_L_FastGood_01;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_LateGood_01;
                    }
                    break;
                  case JudgeStatus.Miss:
                    if (props.judgeTime === JudgeTimeStatus.Fast) {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_Fast;
                    } else {
                      judgeImage = JudgeIcon.UI_GAM_SlideFan_D_Late;
                    }
                    break;
                }
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }

        const k = 2.5,
          wifiK = 1.5;
        const judgeIconHeight = values.maimaiTapR * 1 * k;
        const judgeIconWidth = ((values.maimaiTapR * 1) / judgeImage.height) * judgeImage.width * k;

        x = values.APositions.J[lastLineEndPos - 1][0]; // values.center[0] - judgeIconWidth / 2;
        y = values.APositions.J[lastLineEndPos - 1][1]; //values.center[1] - (values.maimaiJudgeLineR - values.judgeDistance + judgeIconHeight / 2);

        let angle = note.slideLineDirectionParams?.angle;
        if (lastLine.slideType === 'w') {
          if (lastLineDirection === 1) {
            // 向下
            drawJudgeImage(effectOverCtx, judgeImage, x - (judgeIconWidth * wifiK) / 2, y * 0.99 - judgeIconHeight, judgeIconWidth * wifiK, judgeIconHeight * wifiK, x, y, angle);
          } else {
            // 向上
            drawJudgeImage(effectOverCtx, judgeImage, x - (judgeIconWidth * wifiK) / 2, y * 0.9, judgeIconWidth * wifiK, judgeIconHeight * wifiK, x, y, angle);
          }
        } else {
          if (lastLineDirection === 1) {
            drawJudgeImage(effectOverCtx, judgeImage, x - judgeIconWidth, y - judgeIconHeight * 0.7, judgeIconWidth, judgeIconHeight, x, y, angle);
          } else {
            drawJudgeImage(effectOverCtx, judgeImage, x, y - judgeIconHeight * 0.7, judgeIconWidth, judgeIconHeight, x, y, angle);
          }
        }
      } else {
        // 一般的Note的判定显示

        switch (props.judgeStatus) {
          case JudgeStatus.CriticalPerfect:
            judgeImage = note.isBreak ? JudgeIcon.UI_GAM_Critical_Break : JudgeIcon.UI_GAM_Critical;
            break;
          case JudgeStatus.Perfect:
            judgeImage = note.isBreak ? JudgeIcon.UI_GAM_Perfect_Break : JudgeIcon.UI_GAM_Perfect;
            break;
          case JudgeStatus.Great:
            judgeImage = JudgeIcon.UI_GAM_Great;
            break;
          case JudgeStatus.Good:
            judgeImage = JudgeIcon.UI_GAM_Good;
            break;
          case JudgeStatus.Miss:
            judgeImage = JudgeIcon.UI_GAM_Miss;
            break;
        }

        const k = 1.5;
        const judgeIconHeight = values.maimaiTapR * 1 * k;
        const judgeIconWidth = ((values.maimaiTapR * 1) / judgeImage.height) * judgeImage.width * k;

        const firstWord = note.pos.substring(0, 1);
        if (!isNaN(Number(firstWord))) {
          // 数字开头的位置
          θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
          x = values.center[0] - judgeIconWidth / 2;
          y = values.center[1] - (values.maimaiJudgeLineR - values.judgeDistance + judgeIconHeight / 2);
        } else {
          // TOUCH
          if (firstWord === '#' || firstWord === '@') {
            // 观赏谱 # @
            const touchPos = SpecPos.readPosFromStr(note.pos).getCoord(values);
            x = touchPos[0];
            y = touchPos[1];
          } else {
            // 字母开头的位置（TOUCH）
            const touchPos = note.pos.substring(1, 2);
            switch (firstWord) {
              case 'C':
                x = values.center[0];
                y = values.center[1];
                break;
              case 'A':
                θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
                if (note.type === NoteType.Touch) {
                  x = values.center[0] + values.maimaiADTouchR * Math.cos(θ);
                  y = values.center[1] + values.maimaiADTouchR * Math.sin(θ);
                } else {
                  x = values.center[0] + values.maimaiScreenR * Math.cos(θ);
                  y = values.center[1] + values.maimaiScreenR * Math.sin(θ);
                }
                break;
              case 'B':
                θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
                x = values.center[0] + values.maimaiBR * Math.cos(θ);
                y = values.center[1] + values.maimaiBR * Math.sin(θ);
                break;
              case 'D':
                θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
                if (note.type === NoteType.Touch) {
                  x = values.center[0] + values.maimaiADTouchR * Math.cos(θ);
                  y = values.center[1] + values.maimaiADTouchR * Math.sin(θ);
                } else {
                  x = values.center[0] + values.maimaiScreenR * Math.cos(θ);
                  y = values.center[1] + values.maimaiScreenR * Math.sin(θ);
                }
                break;
              case 'E':
                θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
                x = values.center[0] + values.maimaiER * Math.cos(θ);
                y = values.center[1] + values.maimaiER * Math.sin(θ);
                break;
              default:
                break;
            }
          }
        }

        drawJudgeImage(effectOverCtx, judgeImage, x, y, judgeIconWidth, judgeIconHeight, values.center[0], values.center[1], -22.5 + Number(note.pos) * 45);

        if (drawFastLast && props.judgeStatus !== JudgeStatus.CriticalPerfect && props.judgeStatus !== JudgeStatus.Miss) {
          if (props.judgeTime === JudgeTimeStatus.Fast) {
            fastlateImage = JudgeIcon.UI_GAM_Fast;
          } else {
            fastlateImage = JudgeIcon.UI_GAM_Late;
          }

          const k = 1.5;
          const fastlateIconHeight = values.maimaiTapR * 1 * k;
          const fastlateIconWidth = ((values.maimaiTapR * 1) / fastlateImage.height) * fastlateImage.width * k;

          const firstWord = note.pos.substring(0, 1);
          if (!isNaN(Number(firstWord))) {
            // 数字开头的位置
            θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
            x = values.center[0] - fastlateIconWidth / 2;
            y = values.center[1] - (values.maimaiJudgeLineR - values.judgeDistance * 2 + fastlateIconHeight / 2);
          }

          drawJudgeImage(effectOverCtx, fastlateImage, x, y, fastlateIconWidth, fastlateIconHeight, values.center[0], values.center[1], -22.5 + Number(note.pos) * 45);
        }
      }

      // // 特效
      // if(note.type === NoteType.Tap){
      // 	if(props.judgeStatus !== JudgeStatus.Miss){
      // 		const effectWidth = values.maimaiTapR * 2 * ()
      // 		drawRotationImage(effectOverCtx, EffectIcon.Hex, x, y, )
      // 	}
      // }
    }
  }
};
