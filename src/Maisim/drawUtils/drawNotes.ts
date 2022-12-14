import { ShowingNoteProps } from '../../utils/showingNoteProps';
import { cos, sin, π } from '../../math';
import {
	center,
	maimaiSummonLineR,
	maimaiScreenR,
	maimaiBR,
	maimaiER,
	touchMaxDistance,
	maimaiTapR,
	trackItemGap,
	trackItemWidth,
	trackItemHeight,
	holdHeadHeight,
	canvasWidth,
	maimaiADTouchR,
	maimaiJudgeLineR,
	fireworkInnerCircleR,
	canvasHeight,
	maimaiR,
	judgeDistance,
} from '../const';
import { getTrackProps } from '../slideTracks/tracks';
import { APositions, trackLength } from '../slideTracks/_global';
import { drawRotationImage, lineLen } from './_base';
import { NoteIcon } from '../resourceReaders/noteIconReader';
import { Note, SlideLine } from '../../utils/note';
import { NoteType } from '../../utils/noteType';
import { section } from '../slideTracks/section';
import { EffectIcon } from '../resourceReaders/effectIconReader';
import { RegularStyles, SlideColor, TapStyles } from '../../utils/noteStyles';
import { JudgeStatus, JudgeTimeStatus } from '../../utils/judgeStatus';
import { JudgeIcon } from '../resourceReaders/judgeIconReader';

let tapIcon: HTMLImageElement;
let tapEachIcon: HTMLImageElement;
let tapBreakIcon: HTMLImageElement;
let tapExIcon: HTMLImageElement;

let holdIcon: HTMLImageElement;
let holdEachIcon: HTMLImageElement;
let holdBreakIcon: HTMLImageElement;
let holdExIcon: HTMLImageElement;
let holdMissIcon: HTMLImageElement;

let starIcon: HTMLImageElement;
let starEachIcon: HTMLImageElement;
let starBreakIcon: HTMLImageElement;
let starExIcon: HTMLImageElement;

let starDoubleIcon: HTMLImageElement;
let starDoubleEachIcon: HTMLImageElement;
let starDoubleBreakIcon: HTMLImageElement;
let starDoubleExIcon: HTMLImageElement;

let slideIcon: HTMLImageElement;
let slideEachIcon: HTMLImageElement;
let slideBreakIcon: HTMLImageElement;

export const updateIcons = (tapStyle: TapStyles, holdStyle: RegularStyles, slideStyle: RegularStyles, slideColor: SlideColor) => {
	switch (tapStyle) {
		case TapStyles.Concise:
			tapIcon = NoteIcon.Tap_00;
			tapEachIcon = NoteIcon.Tap_Each_00;
			tapBreakIcon = NoteIcon.Break_00;
			tapExIcon = NoteIcon.Tap_Ex_00;
			break;
		case TapStyles.Classic:
			tapIcon = NoteIcon.Tap_01;
			tapEachIcon = NoteIcon.Tap_Each_01;
			tapBreakIcon = NoteIcon.Break_01;
			tapExIcon = NoteIcon.Tap_Ex_01;
			break;
		case TapStyles.DX:
			tapIcon = NoteIcon.Tap_02;
			tapEachIcon = NoteIcon.Tap_Each_02;
			tapBreakIcon = NoteIcon.Break_02;
			tapExIcon = NoteIcon.Tap_Ex_02;
			break;
		case TapStyles.Strip:
			tapIcon = NoteIcon.Tap_03;
			tapEachIcon = NoteIcon.Tap_Each_03;
			tapBreakIcon = NoteIcon.Break_03;
			tapExIcon = NoteIcon.Tap_Ex_03;
			break;
		case TapStyles.TAPKun:
			tapIcon = NoteIcon.Tap_04;
			tapEachIcon = NoteIcon.Tap_Each_04;
			tapBreakIcon = NoteIcon.Break_04;
			tapExIcon = NoteIcon.Tap_Ex_04;
			break;
	}

	switch (holdStyle) {
		case RegularStyles.Concise:
			holdIcon = NoteIcon.Hold_00;
			holdEachIcon = NoteIcon.Hold_Each_00;
			holdBreakIcon = NoteIcon.Hold_Break_00;
			holdExIcon = NoteIcon.Hold_Ex_00;
			holdMissIcon = NoteIcon.Miss_00;
			break;
		case RegularStyles.Classic:
			holdIcon = NoteIcon.Hold_01;
			holdEachIcon = NoteIcon.Hold_Each_01;
			holdBreakIcon = NoteIcon.Hold_Break_01;
			holdExIcon = NoteIcon.Hold_Ex_01;
			holdMissIcon = NoteIcon.Miss_01;
			break;
	}

	switch (slideStyle) {
		case RegularStyles.Concise:
			slideIcon = NoteIcon.Slide_00;
			slideEachIcon = NoteIcon.Slide_Each_00;
			slideBreakIcon = NoteIcon.Slide_Break_00;
			starBreakIcon = NoteIcon.BreakStar_00;
			starDoubleBreakIcon = NoteIcon.BreakStar_Double_00;
			starDoubleExIcon = NoteIcon.Star_Ex_00;
			starExIcon = NoteIcon.Star_Ex_00;
			starEachIcon = NoteIcon.Star_Each_00;
			starDoubleEachIcon = NoteIcon.Star_Each_00;
			switch (slideColor) {
				case SlideColor.Blue:
					starIcon = NoteIcon.Star_00;
					starDoubleIcon = NoteIcon.Star_00;
					break;
				case SlideColor.Pink:
					starIcon = NoteIcon.Star_Pink_00;
					starDoubleIcon = NoteIcon.Star_Pink_Double_00;
					break;
			}

			break;
		case RegularStyles.Classic:
			slideIcon = NoteIcon.Slide_01;
			slideEachIcon = NoteIcon.Slide_Each_01;
			slideBreakIcon = NoteIcon.Slide_Break_01;
			starDoubleBreakIcon = NoteIcon.BreakStar_Double_01;
			starDoubleExIcon = NoteIcon.Star_Ex_01;
			starExIcon = NoteIcon.Star_Ex_01;
			starEachIcon = NoteIcon.Star_Each_01;
			starDoubleEachIcon = NoteIcon.Star_Each_01;
			switch (slideColor) {
				case SlideColor.Blue:
					starIcon = NoteIcon.Star_01;
					starDoubleIcon = NoteIcon.Star_Double_01;
					break;
				case SlideColor.Pink:
					starIcon = NoteIcon.Star_Pink_01;
					starDoubleIcon = NoteIcon.Star_Pink_Double_01;
					break;
			}

			break;
	}
};

/**
 * 绘制一个Note
 * @param ctx 绘制Note的图层
 * @param ctx_slideTrack 绘制SLIDE TRACK的图层
 * @param note Note
 * @param isEach
 * @param props 当前的Note状态
 * @param effect
 * @param eachDistance
 * @param isEachPairFirst
 */
export const drawNote = (
	ctx: CanvasRenderingContext2D,
	ctx_slideTrack: CanvasRenderingContext2D,
	note: Note,
	isEach: boolean = false,
	props: ShowingNoteProps,
	effect: boolean = true,
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

		const firstWord = note.pos.substring(0, 1);
		if (!isNaN(Number(firstWord))) {
			// 数字开头的位置
			θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
			//console.log(note.pos, θ*180)
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
					if (note.type === NoteType.Touch || note.type === NoteType.FireWork) {
						x = center[0] + maimaiADTouchR * Math.cos(θ);
						y = center[1] + maimaiADTouchR * Math.sin(θ);
					} else {
						x = center[0] + maimaiScreenR * Math.cos(θ);
						y = center[1] + maimaiScreenR * Math.sin(θ);
					}
					break;
				case 'B':
					θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
					x = center[0] + maimaiBR * Math.cos(θ);
					y = center[1] + maimaiBR * Math.sin(θ);
					break;
				case 'D':
					θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
					if (note.type === NoteType.Touch || note.type === NoteType.FireWork) {
						x = center[0] + maimaiADTouchR * Math.cos(θ);
						y = center[1] + maimaiADTouchR * Math.sin(θ);
					} else {
						x = center[0] + maimaiScreenR * Math.cos(θ);
						y = center[1] + maimaiScreenR * Math.sin(θ);
					}
					break;
				case 'E':
					θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
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

		/** tapR修正 */
		let k = 0.542;
		/** holdR修正 */
		let kh = 0.8;
		/** effect circle */
		let k2 = 0.89;
		/** effect back line */
		let k3 = 0.98;

		const eachPairLines = [EffectIcon.EachLine1, EffectIcon.EachLine2, EffectIcon.EachLine3, EffectIcon.EachLine4];

		const drawNoteLine = (lineImage: HTMLImageElement) => {
			if (note.isBreak) {
				drawRotationImage(
					effectBackCtx!,
					EffectIcon.BreakLine,
					center[0] - (props.rho + maimaiSummonLineR) / k2,
					center[1] - (props.rho + maimaiSummonLineR) / k2,
					((props.rho + maimaiSummonLineR) / k2) * 2,
					((props.rho + maimaiSummonLineR) / k2) * 2,
					center[0],
					center[1],
					-22.5 + Number(note.pos) * 45
				);
			} else {
				if (note.isEach) {
					drawRotationImage(
						effectBackCtx!,
						EffectIcon.EachLine,
						center[0] - (props.rho + maimaiSummonLineR) / k2,
						center[1] - (props.rho + maimaiSummonLineR) / k2,
						((props.rho + maimaiSummonLineR) / k2) * 2,
						((props.rho + maimaiSummonLineR) / k2) * 2,
						center[0],
						center[1],
						-22.5 + Number(note.pos) * 45
					);
				} else {
					drawRotationImage(
						effectBackCtx!,
						lineImage,
						center[0] - (props.rho + maimaiSummonLineR) / k2,
						center[1] - (props.rho + maimaiSummonLineR) / k2,
						((props.rho + maimaiSummonLineR) / k2) * 2,
						((props.rho + maimaiSummonLineR) / k2) * 2,
						center[0],
						center[1],
						-22.5 + Number(note.pos) * 45
					);
				}
			}
		};

		const drawEachPairLine = () => {
			if (note.isEachPairFirst) {
				drawRotationImage(
					effectBackCtx!,
					eachPairLines[(note.eachPairDistance ?? 1) - 1],
					center[0] - (props.rho + maimaiSummonLineR) / k3,
					center[1] - (props.rho + maimaiSummonLineR) / k3,
					((props.rho + maimaiSummonLineR) / k3) * 2,
					((props.rho + maimaiSummonLineR) / k3) * 2,
					center[0],
					center[1],
					-22.5 - (note.eachPairDistance ?? 1) * 11.25 + Number(note.pos) * 45
				);
			}
		};

		const drawTapImage = (image: HTMLImageElement) => {
			const centerx = x,
				centery = y;

			if (effect) {
				drawEachPairLine();
				drawNoteLine(EffectIcon.NormalLine);
			}
			drawRotationImage(ctx, image, x - props.radius / k, y - props.radius / k, (props.radius * 2) / k, (props.radius * 2) / k, centerx, centery, -22.5 + Number(note.pos) * 45);
		};

		const drawSlideTapImage = (image: HTMLImageElement, rotate: boolean = true) => {
			const centerx = x,
				centery = y;
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

			if (effect) {
				drawEachPairLine();
				drawNoteLine(EffectIcon.SlideLine);
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
				-22.5 + Number(note.pos) * 45 + (rotate ? rotateK : 0)
			);
		};

		const drawHoldImage = (image: HTMLImageElement, isShortHold: boolean = false) => {
			//console.log(y, ty);
			const centerx = x,
				centery = y;

			if (effect) {
				drawEachPairLine();
				drawNoteLine(EffectIcon.NormalLine);
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
					1,
					0,
					0,
					image.width,
					holdHeadHeight
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
					1,
					0,
					0,
					image.width,
					holdHeadHeight
				);
			} else {
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
					1,
					0,
					0,
					image.width,
					holdHeadHeight
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
					1,
					0,
					holdHeadHeight,
					image.width,
					image.height - 2 * holdHeadHeight
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
					holdHeadHeight
				);
			}
		};

		const drawTouchImage = (image: HTMLImageElement, imageCenter: HTMLImageElement, imageTouchTwo: HTMLImageElement, imageTouchThree: HTMLImageElement) => {
			const centerx = x,
				centery = y;
			let k = (0.5 * maimaiR) / 350,
				centerk = (0.6 * maimaiR) / 350;

			// 多重TOUCH线
			if (note.touchCount ?? 0 >= 1) {
				drawRotationImage(ctx, imageTouchTwo, x - (imageTouchTwo.width * centerk) / 2, y - (imageTouchTwo.height * centerk) / 2, imageTouchTwo.width * centerk, imageTouchTwo.height * centerk);
			}
			if (note.touchCount === 2) {
				drawRotationImage(
					ctx,
					imageTouchThree,
					x - (imageTouchThree.width * centerk) / 2,
					y - (imageTouchThree.height * centerk) / 2,
					imageTouchThree.width * centerk,
					imageTouchThree.height * centerk
				);
			}

			for (let i = 0; i < 4; i++) {
				drawRotationImage(
					ctx,
					image,
					x - (image.width * k) / 2,
					y + touchMaxDistance - (6 * maimaiR) / 350 - props.rho,
					image.width * k,
					image.height * k,
					x,
					y,
					90 * i,
					props.radius / maimaiTapR
				);
			}
			drawRotationImage(ctx, imageCenter, x - (imageCenter.width * centerk) / 2, y - (imageCenter.height * centerk) / 2, imageCenter.width * centerk, imageCenter.height * centerk);
			// if (props.touched) {
			// 	drawRotationImage(ctx, NoteIcon.touch_just, x - (NoteIcon.touch_just.width ) / 2, y - (NoteIcon.touch_just.height ) / 2, NoteIcon.touch_just.width , NoteIcon.touch_just.height );
			// }
		};

		const drawTouchHoldImage = (is_miss: boolean, isShortHold: boolean = false, imageTouchTwo: HTMLImageElement, imageTouchThree: HTMLImageElement) => {
			const centerx = x,
				centery = y;

			let k = (0.5 * maimaiR) / 350,
				centerk = (0.6 * maimaiR) / 350;

			const touchHoldPieces = is_miss
				? [NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss, NoteIcon.touch_hold_miss]
				: [NoteIcon.touch_hold_1, NoteIcon.touch_hold_2, NoteIcon.touch_hold_3, NoteIcon.touch_hold_4];
			const touchHoldCenter = is_miss ? NoteIcon.touch_hold_center_miss : NoteIcon.touch_center;
			const touchHoldGage = is_miss ? NoteIcon.touch_hold_gage_miss : NoteIcon.touch_hold_gage;

			// 多重TOUCH线
			if (note.touchCount ?? 0 >= 1) {
				drawRotationImage(ctx, imageTouchTwo, x - (imageTouchTwo.width * centerk) / 2, y - (imageTouchTwo.height * centerk) / 2, imageTouchTwo.width * centerk, imageTouchTwo.height * centerk);
			}
			if (note.touchCount === 2) {
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
						y + touchMaxDistance - (6 * maimaiR) / 350 - props.rho,
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
							y + touchMaxDistance - (6 * maimaiR) / 350 - props.rho,
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
							y + touchMaxDistance - (6 * maimaiR) / 350 - props.rho,
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

					drawRotationImage(
						ctx,
						touchHoldGage,
						x - (touchHoldGage.width * centerk) / 2,
						y - (touchHoldGage.height * centerk) / 2,
						touchHoldGage.width * centerk,
						touchHoldGage.height * centerk
					);
					ctx.restore();
				}
			}
		};

		const drawSlideTrackImage = (imageTrack: HTMLImageElement, imageStar: HTMLImageElement, wifiTrack?: HTMLImageElement[]) => {
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
									(trackItemGap * slideLine.remainTime!) /
									trackLength(slideLine.slideType!, Number(slideLine.pos), Number(slideLine.endPos), slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos));

								// SLIDE分段信息
								const sectionInfo = section(slideLine.slideType, slideLine.pos!, slideLine.endPos ?? '', slideLine.turnPos);

								// 画SLIDE TRACK
								ctx_slideTrack.save();
								ctx_slideTrack.translate(center[0], center[1]);
								ctx_slideTrack.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);
								// 得从後往前画
								for (
									let i = slideLine.remainTime!;
									i >= sectionInfo![j === props.currentLineIndex ? props.currentSectionIndex : 0].start * slideLine.remainTime!;
									i -= trackItemGapTime
								) {
									const slideData = getTrackProps(
										slideLine.slideType!,
										Number(slideLine.pos),
										Number(slideLine.endPos),
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
							}

							// GUIDE STAR
							if (props.rho >= slideLine.beginTime! && props.rho < slideLine.beginTime! + slideLine.remainTime!) {
								ctx.save();
								ctx.translate(center[0], center[1]);
								ctx.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);

								const guideStarData = getTrackProps(
									slideLine.slideType!,
									Number(slideLine.pos),
									Number(slideLine.endPos),
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
							}
						} else {
							// WIFI 人体蜈蚣（会有吗（
							if (
								/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndexWifi[0] === -1 &&
								props.currentSectionIndexWifi[1] === -1 &&
								props.currentSectionIndexWifi[2] === -1
							) {
							} else {
								/** 目前Wifi中最小的还没画完的index, 也决定了要画的组的数量 (0 最多，6 最少)*/
								let min = 6;
								if (props.currentLineIndex === j) {
									props.currentSectionIndexWifi.forEach((w) => {
										if (w !== -1 && w <= min) min = w;
									});
								} else {
									min = 0;
								}

								// WIFI TRACK

								// WIFI TRACK开始于screenR而不是judgeR
								const startPoint = [center[0] + maimaiScreenR * cos((-5 / 8 + 1 / 4) * Math.PI), center[1] + maimaiScreenR * sin((-5 / 8 + 1 / 4) * Math.PI)];
								const getWifiTrackProps = (ct: number, rt: number): { x: number; y: number; direction: number }[] => {
									return [
										{
											x: startPoint[0] + (APositions[5][0] - startPoint[0]) * (ct / rt),
											y: startPoint[1] + (APositions[5][1] - startPoint[1]) * (ct / rt),
											direction: 22.5 * 5 + 202.5,
										},
										{
											x: startPoint[0] + (APositions[4][0] - startPoint[0]) * (ct / rt),
											y: startPoint[1] + (APositions[4][1] - startPoint[1]) * (ct / rt),
											direction: 22.5 * 4 + 202.5,
										},
										{
											x: 2 * APositions[0][0] - startPoint[0] + (APositions[3][0] - 2 * APositions[0][0] + startPoint[0]) * (ct / rt),
											y: startPoint[1] + (APositions[3][1] - startPoint[1]) * (ct / rt),
											direction: 22.5 * 3 + 202.5,
										},
									];
								};

								// 相邻两判定点的距离
								const dist = lineLen(APositions[4][0], APositions[4][1], APositions[5][0], APositions[5][1]);

								// SLIDE TRACK
								ctx_slideTrack.save();
								ctx_slideTrack.translate(center[0], center[1]);
								ctx_slideTrack.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);
								// 得从後往前画

								for (let i = 11; i >= min * 2 + (min === 0 ? 1 : 2); i--) {
									const ct = (slideLine.remainTime! * i) / 12;

									const slideData = getWifiTrackProps(ct, slideLine.remainTime!);

									drawRotationImage(
										ctx_slideTrack,
										wifiTrack![i - 1],
										slideData[0].x - center[0] - ((dist * i) / 12) * 0.076,
										slideData[0].y - center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
										(dist * i) / 12,
										((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
										slideData[0].x - center[0],
										slideData[0].y - center[1],
										22.534119524645373,
										props.radius * 0.5
									);

									ctx_slideTrack.save();
									ctx_slideTrack.scale(-1, 1); //左右镜像翻转
									drawRotationImage(
										ctx_slideTrack,
										wifiTrack![i - 1],
										slideData[2].x - (APositions[0][0] - APositions[7][0]) - center[0] - ((dist * i) / 12) * 0.076,
										slideData[2].y - center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
										(dist * i) / 12,
										((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
										slideData[2].x - (APositions[0][0] - APositions[7][0]) - center[0],
										slideData[2].y - center[1],
										-22.534119524645373,
										props.radius * 0.5
									);
									ctx_slideTrack.restore();
								}
								ctx_slideTrack.restore();

								// GUIDE STAR
								ctx.save();
								ctx.translate(center[0], center[1]);
								ctx.rotate(((Number(slideLine.pos) - 1) * 22.5 * π) / 90);

								const guideStarData = getTrackProps(
									slideLine.slideType!,
									Number(slideLine.pos),
									Number(slideLine.endPos),
									props.rho - slideLine.beginTime!,
									slideLine.remainTime!,
									slideLine.turnPos === undefined ? undefined : Number(slideLine.turnPos)
								) as {
									x: number;
									y: number;
									direction: number;
								}[];
								guideStarData.forEach((wifiguide) => {
									drawRotationImage(
										ctx,
										imageStar,
										wifiguide.x - props.guideStarRadius! * 2 - center[0],
										wifiguide.y - props.guideStarRadius! * 2 - center[1],
										props.guideStarRadius! * 4,
										props.guideStarRadius! * 4,
										wifiguide.x - center[0],
										wifiguide.y - center[1],
										wifiguide.direction,
										props.guideStarRadius! / maimaiTapR
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
								(trackItemGap * note.remainTime!) / trackLength(note.slideType!, Number(note.pos), Number(note.endPos), note.turnPos === undefined ? undefined : Number(note.turnPos));

							// SLIDE分段信息
							const sectionInfo = section(note.slideType, note.pos, note.endPos ?? '', note.turnPos);

							// 画SLIDE TRACK
							ctx_slideTrack.save();
							ctx_slideTrack.translate(center[0], center[1]);
							ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);
							// 得从後往前画
							for (let i = note.remainTime!; i >= sectionInfo![props.currentSectionIndex].start * note.remainTime!; i -= trackItemGapTime) {
								const slideData = getTrackProps(
									note.slideType!,
									Number(note.pos),
									Number(note.endPos),
									i,
									note.remainTime!,
									note.turnPos === undefined ? undefined : Number(note.turnPos)
								) as {
									x: number;
									y: number;
									direction: number;
								};
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
						}

						// GUIDE STAR
						ctx.save();
						ctx.translate(center[0], center[1]);
						ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

						const guideStarData = getTrackProps(
							note.slideType!,
							Number(note.pos),
							Number(note.endPos),
							props.rho,
							note.remainTime!,
							note.turnPos === undefined ? undefined : Number(note.turnPos)
						) as {
							x: number;
							y: number;
							direction: number;
						};
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
					} else {
						if (
							/*如果沒有全部画完（-1表示最後一段也画了）*/ props.currentSectionIndexWifi[0] === -1 &&
							props.currentSectionIndexWifi[1] === -1 &&
							props.currentSectionIndexWifi[2] === -1
						) {
						} else {
							/** 目前Wifi中最小的还没画完的index, 也决定了要画的数量 */
							let min = 6;
							props.currentSectionIndexWifi.forEach((w) => {
								if (w !== -1 && w <= min) min = w;
							});

							// WIFI TRACK

							// WIFI TRACK开始于screenR而不是judgeR
							const startPoint = [center[0] + maimaiScreenR * cos((-5 / 8 + 1 / 4) * Math.PI), center[1] + maimaiScreenR * sin((-5 / 8 + 1 / 4) * Math.PI)];
							const getWifiTrackProps = (ct: number, rt: number): { x: number; y: number; direction: number }[] => {
								return [
									{
										x: startPoint[0] + (APositions[5][0] - startPoint[0]) * (ct / rt),
										y: startPoint[1] + (APositions[5][1] - startPoint[1]) * (ct / rt),
										direction: 22.5 * 5 + 202.5,
									},
									{
										x: startPoint[0] + (APositions[4][0] - startPoint[0]) * (ct / rt),
										y: startPoint[1] + (APositions[4][1] - startPoint[1]) * (ct / rt),
										direction: 22.5 * 4 + 202.5,
									},
									{
										x: 2 * APositions[0][0] - startPoint[0] + (APositions[3][0] - 2 * APositions[0][0] + startPoint[0]) * (ct / rt),
										y: startPoint[1] + (APositions[3][1] - startPoint[1]) * (ct / rt),
										direction: 22.5 * 3 + 202.5,
									},
								];
							};

							// 相邻两判定点的距离
							const dist = lineLen(APositions[4][0], APositions[4][1], APositions[5][0], APositions[5][1]);

							// SLIDE TRACK
							ctx_slideTrack.save();
							ctx_slideTrack.translate(center[0], center[1]);
							ctx_slideTrack.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);
							// 得从後往前画

							for (let i = 11; i >= min * 2 + (min === 0 ? 1 : 2); i--) {
								const ct = (note.remainTime! * i) / 12;

								const slideData = getWifiTrackProps(ct, note.remainTime!);

								drawRotationImage(
									ctx_slideTrack,
									wifiTrack![i - 1],
									slideData[0].x - center[0] - ((dist * i) / 12) * 0.076,
									slideData[0].y - center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
									(dist * i) / 12,
									((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
									slideData[0].x - center[0],
									slideData[0].y - center[1],
									22.534119524645373,
									props.radius * 0.5
								);

								ctx_slideTrack.save();
								ctx_slideTrack.scale(-1, 1); //左右镜像翻转
								drawRotationImage(
									ctx_slideTrack,
									wifiTrack![i - 1],
									slideData[2].x - (APositions[0][0] - APositions[7][0]) - center[0] - ((dist * i) / 12) * 0.076,
									slideData[2].y - center[1] - (((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12) * 0.076,
									(dist * i) / 12,
									((wifiTrack![i - 1].height / wifiTrack![i - 1].width) * (dist * i)) / 12,
									slideData[2].x - (APositions[0][0] - APositions[7][0]) - center[0],
									slideData[2].y - center[1],
									-22.534119524645373,
									props.radius * 0.5
								);
								ctx_slideTrack.restore();
							}
							ctx_slideTrack.restore();

							// GUIDE STAR
							ctx.save();
							ctx.translate(center[0], center[1]);
							ctx.rotate(((Number(note.pos) - 1) * 22.5 * π) / 90);

							const guideStarData = getTrackProps(
								note.slideType!,
								Number(note.pos),
								Number(note.endPos),
								props.rho,
								note.remainTime!,
								note.turnPos === undefined ? undefined : Number(note.turnPos)
							) as {
								x: number;
								y: number;
								direction: number;
							}[];
							guideStarData.forEach((wifiguide) => {
								drawRotationImage(
									ctx,
									imageStar,
									wifiguide.x - props.guideStarRadius! * 2 - center[0],
									wifiguide.y - props.guideStarRadius! * 2 - center[1],
									props.guideStarRadius! * 4,
									props.guideStarRadius! * 4,
									wifiguide.x - center[0],
									wifiguide.y - center[1],
									wifiguide.direction,
									props.guideStarRadius! / maimaiTapR
								);
							});

							ctx.restore();
						}
					}
				}
			};

			if (note.isNoTapNoTameTimeSlide) {
				// !
				if (props.status >= 2 || props.status <= -1) {
					drawSlideTrackImage_();
				}
			} else {
				drawSlideTrackImage_();
			}
		};

		const drawFirework = () => {
			const alphaMaxK = 0.5;
			/** 烟花特效颜色变换的次数 */
			const fireworkChangeTimes = 5;
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
				45 * props.rho + (360 / 15) * Math.floor(props.rho * fireworkChangeTimes),
				// alpha = x<k ? x/k : (1-x)/(1-k)
				props.rho < alphaMaxK ? props.rho / alphaMaxK : (1 - props.rho) / (1 - alphaMaxK)
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
				1 - props.rho
			);
			// 第二亮区
			drawRotationImage(
				effectBackCtx,
				EffectIcon.FireworkInnerCircle,
				x - maimaiSummonLineR * 2 * props.rho ** 0.1,
				y - maimaiSummonLineR * 2 * props.rho ** 0.1,
				maimaiSummonLineR * 2 * 2 * props.rho ** 0.1,
				maimaiSummonLineR * 2 * 2 * props.rho ** 0.1,
				x,
				y,
				0,
				1 - props.rho ** 0.5
			);
			// 中心闪烁
			drawRotationImage(
				effectBackCtx,
				EffectIcon.FireworkCenter,
				x - fireworkInnerCircleR / 0.7,
				y - fireworkInnerCircleR / 0.7,
				(fireworkInnerCircleR * 2) / 0.7,
				(fireworkInnerCircleR * 2) / 0.7,
				x,
				y,
				0,
				1
			);
		};

		switch (note.type) {
			case NoteType.Tap:
				if (isEach) {
					if (note.isBreak) {
						drawTapImage(tapBreakIcon);
					} else {
						drawTapImage(tapEachIcon);
					}
				} else {
					if (note.isBreak) {
						drawTapImage(tapBreakIcon);
					} else {
						drawTapImage(tapIcon);
					}
				}
				if (note.isEx) {
					drawTapImage(tapExIcon);
				}
				break;
			case NoteType.Hold:
				if (props.isTouching || (!props.isTouching && props.rho < maimaiJudgeLineR - maimaiSummonLineR)) {
					if (isEach) {
						if (note.isBreak) {
							drawHoldImage(holdBreakIcon, note.isShortHold);
						} else {
							drawHoldImage(holdEachIcon, note.isShortHold);
						}
					} else {
						if (note.isBreak) {
							drawHoldImage(holdBreakIcon, note.isShortHold);
						} else {
							drawHoldImage(holdIcon, note.isShortHold);
						}
					}
				} else {
					drawHoldImage(holdMissIcon, note.isShortHold);
				}

				if (note.isEx) {
					drawHoldImage(holdExIcon, note.isShortHold);
				}
				break;
			case NoteType.Slide:
				// console.log(note, note.slideTracks)
				if (note.slideTracks?.length! > 1) {
					// DOUBLE TRACK
					if (isEach) {
						if (note.isBreak) {
							drawTapImage(starDoubleBreakIcon);
						} else {
							drawTapImage(starDoubleEachIcon);
						}
					} else {
						if (note.isBreak) {
							drawSlideTapImage(starDoubleBreakIcon);
						} else {
							drawSlideTapImage(starDoubleIcon);
						}
					}
					if (note.isEx) {
						drawSlideTapImage(starDoubleExIcon);
					}
				} else {
					// SINGLE
					if (isEach) {
						if (note.isBreak) {
							drawSlideTapImage(starBreakIcon);
						} else {
							drawSlideTapImage(starEachIcon);
						}
					} else {
						if (note.isBreak) {
							drawSlideTapImage(starBreakIcon);
						} else {
							drawSlideTapImage(starIcon);
						}
					}
					if (note.isEx) {
						drawSlideTapImage(starExIcon);
					}
				}
				break;
			case NoteType.Touch:
				if (isEach) {
					drawTouchImage(NoteIcon.touch_each, NoteIcon.touch_each_center, NoteIcon.touch_each_two, NoteIcon.touch_each_three);
				} else {
					drawTouchImage(NoteIcon.touch, NoteIcon.touch_center, NoteIcon.touch_two, NoteIcon.touch_three);
				}
				break;
			case NoteType.TouchHold:
				if (props.isTouching || (!props.isTouching && props.tailRho <= 0)) {
					drawTouchHoldImage(false, note.isShortHold, NoteIcon.touch_hold_two, NoteIcon.touch_hold_three);
				} else {
					drawTouchHoldImage(true, note.isShortHold, NoteIcon.touch_hold_two, NoteIcon.touch_hold_three);
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
					}
				}
				break;
			case NoteType.FireWork:
				if (props.fireworkTrigged) {
					drawFirework();
				}
				break;
			case NoteType.EndMark:
				//finish();
				break;
		}
	} else if (props.status === -3) {
		// 显示判定
		let θ = 0,
			// Note所在的坐标
			x = 0,
			y = 0;

		let judgeImage: HTMLImageElement;
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

			let lastLineDirection = 0;
			let lastLineEndPos = Number(lastLine.endPos);
			let lastLineStartPos = Number(lastLine.pos);
			// 确定左右上下方向
			if (lastLine.slideType === 'w') {
				// w
				if (lastLineEndPos > 2 && lastLineEndPos < 7) {
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
					lastLineDirection = 1;
				} else {
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
					lastLineDirection = 0;
				}
			} else if (lastLine.slideType === '<' || lastLine.slideType === '>' || lastLine.slideType === '^') {
				// 弧线
				let endPos = lastLineEndPos - lastLineStartPos + 1;
				if (endPos < 1) endPos += 8;

				// 确定该用左向的弧形判定还是右向的
				// 好麻烦
				let useLeft = false;
				if (lastLine.slideType === '^') {
					// 半圆弧
					if (endPos > 1 && endPos < 5) {
						useLeft = false;
						lastLineDirection = 0;
					} else if (endPos > 5 && endPos <= 8) {
						useLeft = true;
						lastLineDirection = 1;
					}
				} else if (lastLine.slideType === '<') {
					// <
					if (lastLineStartPos <= 2 || lastLineStartPos >= 7) {
						useLeft = true;
						lastLineDirection = 1;
					} else if (lastLineStartPos >= 3 && lastLineStartPos <= 6) {
						useLeft = false;
						lastLineDirection = 0;
					}
				} else if (lastLine.slideType === '>') {
					// <
					if (lastLineStartPos <= 2 || lastLineStartPos >= 7) {
						useLeft = false;
						lastLineDirection = 0;
					} else if (lastLineStartPos >= 3 && lastLineStartPos <= 6) {
						useLeft = true;
						lastLineDirection = 1;
					}
				}

				if (useLeft) {
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
				} else {
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
				}
			} else {
				// 直线
				if (lastLineEndPos > 4) {
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
					lastLineDirection = 1;
				} else {
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
					lastLineDirection = 0;
				}
			}

			const k = 2.5;
			const judgeIconHeight = maimaiTapR * 1 * k;
			const judgeIconWidth = ((maimaiTapR * 1) / judgeImage.height) * judgeImage.width * k;

			x = APositions[lastLineEndPos - 1][0]; // center[0] - judgeIconWidth / 2;
			y = APositions[lastLineEndPos - 1][1]; //center[1] - (maimaiJudgeLineR - judgeDistance + judgeIconHeight / 2);

			if (lastLineDirection === 0) {
				let a = note.slideLineDirection ?? 0;
				if (a === -90) {
					a += 180;
				}
				drawRotationImage(effectOverCtx, judgeImage, x - judgeIconWidth, y, judgeIconWidth, judgeIconHeight, x, y, a);
			} else {
				drawRotationImage(effectOverCtx, judgeImage, x, y, judgeIconWidth, judgeIconHeight, x, y, note.slideLineDirection ?? 0);
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
			const judgeIconHeight = maimaiTapR * 1 * k;
			const judgeIconWidth = ((maimaiTapR * 1) / judgeImage.height) * judgeImage.width * k;

			const firstWord = note.pos.substring(0, 1);
			if (!isNaN(Number(firstWord))) {
				// 数字开头的位置
				θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
				x = center[0] - judgeIconWidth / 2;
				y = center[1] - (maimaiJudgeLineR - judgeDistance + judgeIconHeight / 2);
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
						if (note.type === NoteType.Touch || note.type === NoteType.FireWork) {
							x = center[0] + maimaiADTouchR * Math.cos(θ);
							y = center[1] + maimaiADTouchR * Math.sin(θ);
						} else {
							x = center[0] + maimaiScreenR * Math.cos(θ);
							y = center[1] + maimaiScreenR * Math.sin(θ);
						}
						break;
					case 'B':
						θ = (-5 / 8 + (1 / 4) * Number(touchPos)) * Math.PI;
						x = center[0] + maimaiBR * Math.cos(θ);
						y = center[1] + maimaiBR * Math.sin(θ);
						break;
					case 'D':
						θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
						if (note.type === NoteType.Touch || note.type === NoteType.FireWork) {
							x = center[0] + maimaiADTouchR * Math.cos(θ);
							y = center[1] + maimaiADTouchR * Math.sin(θ);
						} else {
							x = center[0] + maimaiScreenR * Math.cos(θ);
							y = center[1] + maimaiScreenR * Math.sin(θ);
						}
						break;
					case 'E':
						θ = (-3 / 4 + (1 / 4) * Number(touchPos)) * Math.PI;
						x = center[0] + maimaiER * Math.cos(θ);
						y = center[1] + maimaiER * Math.sin(θ);
						break;
					default:
						break;
				}
			}

			drawRotationImage(effectOverCtx, judgeImage, x, y, judgeIconWidth, judgeIconHeight, center[0], center[1], -22.5 + Number(note.pos) * 45);

			if (drawFastLast && props.judgeStatus !== JudgeStatus.CriticalPerfect && props.judgeStatus !== JudgeStatus.Miss) {
				if (props.judgeTime === JudgeTimeStatus.Fast) {
					fastlateImage = JudgeIcon.UI_GAM_Fast;
				} else {
					fastlateImage = JudgeIcon.UI_GAM_Late;
				}

				const k = 1.5;
				const fastlateIconHeight = maimaiTapR * 1 * k;
				const fastlateIconWidth = ((maimaiTapR * 1) / fastlateImage.height) * fastlateImage.width * k;

				const firstWord = note.pos.substring(0, 1);
				if (!isNaN(Number(firstWord))) {
					// 数字开头的位置
					θ = (-5 / 8 + (1 / 4) * Number(note.pos)) * Math.PI;
					x = center[0] - fastlateIconWidth / 2;
					y = center[1] - (maimaiJudgeLineR - judgeDistance * 2 + fastlateIconHeight / 2);
				}

				drawRotationImage(effectOverCtx, fastlateImage, x, y, fastlateIconWidth, fastlateIconHeight, center[0], center[1], -22.5 + Number(note.pos) * 45);
			}
		}
	}
};
