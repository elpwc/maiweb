import { atan2, cos, sin, π } from '../../math';
import { center } from '../const';
import {
	APositions,
	ppPoints,
	qpCenterCircleR,
	qpLeftCircleCenter,
	qpLeftRighCircleR,
	qpRightCircleCenter,
	qqPoints,
	rotateCoordination,
	rotateCoordination2,
	szLeftPoint,
	szRightPoint,
} from './_global';

/**
 * 确定SLIDE TRACK判定图像的角度
 * @param slideLine
 * @returns 角度喵
 */
export const getJudgeDirectionParams = (endPosOri_: string, startPosOri_: string, turnPosOri_: string, type: string) => {
	let startPos = Number(startPosOri_);
	let endPosOri = Number(endPosOri_);
	let turnPosOri = Number(turnPosOri_);

	let endPos = endPosOri - startPos + 1;
	let turnPos = turnPosOri - startPos + 1;
	if (endPos < 1) endPos += 8;
	if (turnPos < 1) turnPos += 8;

	let angle = ((startPos - 1) * 2 * π) / 8;

	// let startPosX = APositions[0][0],
	// 	startPosY = APositions[0][1];

	let startPosX = APositions[startPos - 1][0],
		startPosY = APositions[startPos - 1][1];

	switch (type) {
		case '<':
		case '>':
		case '^':
		case '-':
		case 'w':
			break;
		case 's':
			{
				const startPosPx = rotateCoordination2(szRightPoint, center, angle);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
				console.log(startPosX, startPosY, szRightPoint, angle, (angle / π) * 180);
			}
			break;
		case 'z':
			{
				const startPosPx = rotateCoordination2(szLeftPoint, center, angle);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
			}
			break;
		case 'v':
			startPosX = center[0];
			startPosY = center[1];
			break;
		case 'V':
			startPosX = APositions[turnPosOri - 1][0];
			startPosY = APositions[turnPosOri - 1][1];
			break;
		case 'p':
			{
				/** 圆弧开始画的角度 */
				const startAngle = -0.75;
				/** 圆弧的角度 */
				const angle = 0.25 * (endPosOri >= 6 ? 14 - endPosOri : 6 - endPosOri);
				/** 圆弧终止的点 */
				const startPosPx = rotateCoordination(
					center[0] + qpCenterCircleR * cos((startAngle - angle) * π),
					center[1] + qpCenterCircleR * sin((startAngle - angle) * π),
					center[0],
					center[1],
					angle
				);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
			}
			break;
		case 'q':
			{
				/** 圆弧开始画的角度 */
				const startAngle = 0;
				/** 圆弧的角度 */
				const angle = 0.25 * (endPosOri <= 4 ? endPosOri + 4 : endPosOri - 4);

				const startPosPx = rotateCoordination(
					center[0] + qpCenterCircleR * cos((startAngle + angle) * π),
					center[1] + qpCenterCircleR * sin((startAngle + angle) * π),
					center[0],
					center[1],
					angle
				);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
			}
			break;
		case 'pp':
			{
				const startAngle = ppPoints[0];
				const angle = endPosOri === 4 ? 1 - ppPoints[endPosOri] + 1 + startAngle + 2 : 1 - ppPoints[endPosOri] + 1 + startAngle;

				const startPosPx = rotateCoordination(
					qpRightCircleCenter[0] + qpLeftRighCircleR * cos((startAngle - angle) * π),
					qpRightCircleCenter[1] + qpLeftRighCircleR * sin((startAngle - angle) * π),
					center[0],
					center[1],
					angle
				);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
			}
			break;
		case 'qq':
			{
				const startAngle = qqPoints[0];
				const angle = endPosOri === 7 ? qqPoints[endPosOri] - startAngle : 1 + qqPoints[endPosOri] + 1 - startAngle;

				const startPosPx = rotateCoordination(
					qpLeftCircleCenter[0] + qpLeftRighCircleR * cos((startAngle + angle) * π),
					qpLeftCircleCenter[1] + qpLeftRighCircleR * sin((startAngle + angle) * π),
					center[0],
					center[1],
					angle
				);
				startPosX = startPosPx[0];
				startPosY = startPosPx[1];
			}
			break;
		default:
			break;
	}

	if (type === '<' || type === '>' || type === '^' || type === 'w') {
		const direction = getJudgeDirection(startPos, endPosOri, turnPosOri, type);

		let angle = 0;

		if (type === '^') {
			// 半圆弧
			if (endPos > 1 && endPos < 5) {
				angle = ((endPos - 1 + startPos - 1) * 360) / 8;
			} else if (endPos > 5 && endPos <= 8) {
				angle = ((endPos - 8 + startPos - 1) * 360) / 8;
			}
		} else if (type === '<') {
			// <
			if (startPos > 2 && startPos < 7) {
				angle = ((endPos - 1 + startPos - 1) * 360) / 8;
			} else if (startPos < 3 || startPos > 6) {
				angle = ((endPos - 8 + startPos - 1) * 360) / 8;
			}
		} else if (type === '>') {
			// >
			if (startPos > 2 && startPos < 7) {
				angle = ((endPos - 8 + startPos - 1) * 360) / 8;
			} else if (startPos < 3 || startPos > 6) {
				angle = ((endPos - 1 + startPos - 1) * 360) / 8;
			}
		} else if (type === 'w') {
			// w
			if (direction === 0) {
				// 向上
				angle = ((endPosOri - 1 + 0.5) * 360) / 8;
			} else {
				// 向下
				angle = ((endPosOri - 5 + 0.5) * 360) / 8;
			}
		}

		return {
			image: type === 'w' ? 2 : 1,
			direction,
			angle,
		};
	} else {
		const direction = getJudgeDirection(startPos, endPosOri, turnPosOri, type);
		let angle = 0;
		if (direction === 0) {
			angle = (atan2(APositions[endPosOri - 1][1] - startPosY, APositions[endPosOri - 1][0] - startPosX) / π) * 180 - 180;
		} else {
			angle = (atan2(APositions[endPosOri - 1][1] - startPosY, APositions[endPosOri - 1][0] - startPosX) / π) * 180;
		}

		return {
			image: 0,
			direction,
			angle,
		};
	}
};

const getJudgeDirection = (startPos: number, endPosOri: number, turnPosOri: number, slideType: string) => {
	/** 位置在哪一竖列上，从右往左数 */
	const whichLine = (pos: number) =>
		[
			[2, 3],
			[1, 4],
			[8, 5],
			[7, 6],
		].findIndex((line) => {
			return line.includes(pos);
		});

	let lastLineDirection = 0;
	// 确定左右上下方向
	if (slideType === 'w') {
		// w
		if (endPosOri > 2 && endPosOri < 7) {
			// 向下
			lastLineDirection = 1;
		} else {
			// 向上
			lastLineDirection = 0;
		}
	} else if (slideType === '<' || slideType === '>' || slideType === '^') {
		// 弧线
		let endPos = endPosOri - startPos + 1;
		if (endPos < 1) endPos += 8;
		// 好麻烦
		if (slideType === '^') {
			// 半圆弧
			if (endPos > 1 && endPos < 5) {
				lastLineDirection = 1;
			} else if (endPos > 5 && endPos <= 8) {
				lastLineDirection = 0;
			}
		} else if (slideType === '<') {
			// <
			if (startPos > 2 && startPos < 7) {
				lastLineDirection = 1;
			} else if (startPos < 3 || startPos > 6) {
				lastLineDirection = 0;
			}
		} else if (slideType === '>') {
			// >
			if (startPos > 2 && startPos < 7) {
				lastLineDirection = 0;
			} else if (startPos < 3 || startPos > 6) {
				lastLineDirection = 1;
			}
		}
	} else {
		if (slideType === '-' || slideType === 's' || slideType === 'z') {
			// 直线
			const startLine = whichLine(startPos);
			const endLine = whichLine(endPosOri);
			if (endLine > startLine) {
				lastLineDirection = 0;
			} else {
				lastLineDirection = 1;
			}
		} else if (slideType === 'v') {
			// v
			const endLine = whichLine(endPosOri);
			if (endLine > 1) {
				// 朝左
				lastLineDirection = 0;
			} else {
				// 朝右
				lastLineDirection = 1;
			}
		} else if (slideType === 'V') {
			// V
			const startLine = whichLine(turnPosOri);
			const endLine = whichLine(endPosOri);
			if (endLine > startLine) {
				lastLineDirection = 0;
			} else {
				lastLineDirection = 1;
			}
		} else {
			// pqppqq
			const endLine = whichLine(endPosOri);
			if (endLine > 1) {
				lastLineDirection = 0;
			} else {
				lastLineDirection = 1;
			}
		}
	}
	return lastLineDirection;
};
