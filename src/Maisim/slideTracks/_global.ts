import { center, maimaiJudgeLineR, maimaiScreenR } from '../const';
import { abs, acos, asin, atan, cos, sin, sqrt, π } from '../../math';
import { lineLen } from '../drawUtils/_base';

/** 尺寸改变後重新赋值 */
export const updateVarAfterSizeChanged = () => {
	APositions = [];
	for (let i = 1; i <= 8; i++) {
		APositions.push([center[0] + maimaiJudgeLineR * cos((-5 / 8 + (1 / 4) * i) * Math.PI), center[1] + maimaiJudgeLineR * sin((-5 / 8 + (1 / 4) * i) * Math.PI)]);
	}

	szk = (APositions[2][1] - APositions[6][1]) / (APositions[2][0] - APositions[6][0]);
	szLeftPoint = [APositions[7][0], szk * APositions[7][0] + APositions[2][1] - APositions[2][0] * szk];
	szRightPoint = [APositions[0][0], szk * APositions[0][0] + APositions[2][1] - APositions[2][0] * szk];

	qpCenterCircleR = maimaiScreenR * 0.356;

	qpLeftRightCircleCenterR = maimaiScreenR * 0.402;
	qpLeftRighCircleR = maimaiScreenR * 0.424;

	qpLeftCircleCenter = [center[0] + qpLeftRightCircleCenterR * cos(qpLeftCircleCenterAngle * π), center[1] + qpLeftRightCircleCenterR * sin(qpLeftCircleCenterAngle * π)];
	qpRightCircleCenter = [center[0] + qpLeftRightCircleCenterR * cos(qpRightCircleCenterAngle * π), center[1] + qpLeftRightCircleCenterR * sin(qpRightCircleCenterAngle * π)];

	qplen = lineLen(APositions[0][0], APositions[0][1], APositions[5][0], APositions[5][1]) / 2;
};

export let APositions: [number, number][] = [];

for (let i = 1; i <= 8; i++) {
	APositions.push([center[0] + maimaiJudgeLineR * cos((-5 / 8 + (1 / 4) * i) * Math.PI), center[1] + maimaiJudgeLineR * sin((-5 / 8 + (1 / 4) * i) * Math.PI)]);
}

// sz轨迹的左右拐点
let szk = (APositions[2][1] - APositions[6][1]) / (APositions[2][0] - APositions[6][0]);
export let szLeftPoint: [number, number] = [APositions[7][0], szk * APositions[7][0] + APositions[2][1] - APositions[2][0] * szk];
export let szRightPoint: [number, number] = [APositions[0][0], szk * APositions[0][0] + APositions[2][1] - APositions[2][0] * szk];

// qp中央圆半径
export let qpCenterCircleR = maimaiScreenR * 0.356;

// qqpp左右圆圆心距center距离
export let qpLeftRightCircleCenterR = maimaiScreenR * 0.402;
// qqpp左右圆半径
export let qpLeftRighCircleR = maimaiScreenR * 0.424;

// qq左圆圆心角度
export const qpLeftCircleCenterAngle = -0.75;
// pp右圆圆心角度
export const qpRightCircleCenterAngle = 0;

// qqpp左右圆圆心坐标
export let qpLeftCircleCenter = [center[0] + qpLeftRightCircleCenterR * cos(qpLeftCircleCenterAngle * π), center[1] + qpLeftRightCircleCenterR * sin(qpLeftCircleCenterAngle * π)];
export let qpRightCircleCenter = [center[0] + qpLeftRightCircleCenterR * cos(qpRightCircleCenterAngle * π), center[1] + qpLeftRightCircleCenterR * sin(qpRightCircleCenterAngle * π)];

/** qp一条直线的长度 */
export let qplen = lineLen(APositions[0][0], APositions[0][1], APositions[5][0], APositions[5][1]) / 2;

export const ppPoints = [
	-0.8516444944031569, -0.197563051907167, -0.007987334992532735, 0.4272852860246635, 0.8516444944031569, -0.891273030630514, -0.6949442499922761, -0.5225085064199887, -0.35985847476497856,
];

export const qqPoints = [
	0.10164449440315693, -0.552436948092833, -0.39014152523502166, -0.22749149358001142, -0.055055750007723836, 0.141273030630514, 0.3983555055968429, 0.8227147139753366, -0.7420126650074674,
];

export interface Segment {
	/** start */
	s: number;
	/** end */
	e: number;
	/** areas */
	a: string[];
}

export const trackLength = (type: string, startPos: number, endPosOri: number, turnPosOri?: number): number => {
	let endPos = endPosOri - startPos + 1;
	if (endPos < 1) endPos += 8;
	let turnPos = (turnPosOri ?? 0) - startPos + 1;
	if (turnPos < 1) turnPos += 8;

	switch (type) {
		case '-':
			return lineLen(APositions[0][0], APositions[0][1], APositions[endPos - 1][0], APositions[endPos - 1][1]);
		case '^':
			if (endPos > 1 && endPos < 5) {
				return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
			} else if (endPos > 5 && endPos <= 8) {
				return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
			}
			break;
		case '<':
			if (startPos <= 2 || startPos >= 7) {
				if (endPos > 1 && endPos <= 8) {
					return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
				} else if (endPos === 1) {
					return π * maimaiJudgeLineR * 2;
				}
			} else if (startPos >= 3 && startPos <= 6) {
				if (endPos > 1 && endPos <= 8) {
					return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
				} else if (endPos === 1) {
					return π * maimaiJudgeLineR * 2;
				}
			}

			break;
		case '>':
			if (startPos <= 2 || startPos >= 7) {
				if (endPos > 1 && endPos <= 8) {
					return π * maimaiJudgeLineR * 2 * ((endPos - 1) / 8);
				} else if (endPos === 1) {
					return π * maimaiJudgeLineR * 2;
				}
			} else if (startPos >= 3 && startPos <= 6) {
				if (endPos > 1 && endPos <= 8) {
					return π * maimaiJudgeLineR * 2 * ((9 - endPos) / 8);
				} else if (endPos === 1) {
					return π * maimaiJudgeLineR * 2;
				}
			}
			break;
		case 'v':
			return maimaiJudgeLineR * 2;
		case 'p':
			return 0.25 * (endPos >= 6 ? 14 - endPos : 6 - endPos) * qpCenterCircleR * π + qplen * 2;
		case 'q':
			return 0.25 * (endPos <= 4 ? endPos + 4 : endPos - 4) * qpCenterCircleR * π + qplen * 2;
		case 'pp':
			const ppangle = endPos === 4 ? 1 - ppPoints[endPos] + 1 + ppPoints[0] + 2 : 1 - ppPoints[endPos] + 1 + ppPoints[0];
			return (
				ppangle * qpLeftRighCircleR * π +
				lineLen(APositions[0][0], APositions[0][1], qpRightCircleCenter[0] + qpLeftRighCircleR * cos(ppPoints[0] * π), qpRightCircleCenter[1] + qpLeftRighCircleR * sin(ppPoints[0] * π)) +
				lineLen(
					APositions[endPos - 1][0],
					APositions[endPos - 1][1],
					qpRightCircleCenter[0] + qpLeftRighCircleR * cos((ppPoints[0] - ppangle) * π),
					qpRightCircleCenter[1] + qpLeftRighCircleR * sin((ppPoints[0] - ppangle) * π)
				)
			);

		case 'qq':
			const qqangle = endPos === 7 ? qqPoints[endPos] - qqPoints[0] : 1 + qqPoints[endPos] + 1 - qqPoints[0];
			return (
				qqangle * qpLeftRighCircleR * π +
				lineLen(APositions[0][0], APositions[0][1], qpLeftCircleCenter[0] + qpLeftRighCircleR * cos(qqPoints[0] * π), qpLeftCircleCenter[1] + qpLeftRighCircleR * sin(qqPoints[0] * π)) +
				lineLen(
					APositions[endPos - 1][0],
					APositions[endPos - 1][1],
					qpLeftCircleCenter[0] + qpLeftRighCircleR * cos((qqPoints[0] + qqangle) * π),
					qpLeftCircleCenter[1] + qpLeftRighCircleR * sin((qqPoints[0] + qqangle) * π)
				)
			);
		case 's':
			return maimaiJudgeLineR * 2.9932;
		case 'z':
			return maimaiJudgeLineR * 2.9932;
		case 'V':
			return (
				lineLen(APositions[turnPos - 1][0], APositions[turnPos - 1][1], APositions[0][0], APositions[0][1]) +
				lineLen(APositions[turnPos - 1][0], APositions[turnPos - 1][1], APositions[endPos - 1][0], APositions[endPos - 1][1])
			);
		case 'w':
			return lineLen(APositions[0][0], APositions[0][1], APositions[4][0], APositions[4][1]);
		default:
			break;
	}
	return 0;
};

// 只是开发中计算数值用的，沒有实装（也不需要
export const ppqqAnglCalc = () => {
	let res: number[] = [];
	// pp
	APositions.forEach((ap, i) => {
		const r = qpLeftRighCircleR;
		const l = lineLen(ap[0], ap[1], qpRightCircleCenter[0], qpRightCircleCenter[1]);
		const sita = atan(abs((qpRightCircleCenter[0] - ap[0]) / (qpRightCircleCenter[1] - ap[1])));
		const alpha = asin(r / l);

		const beta = asin(abs((qpRightCircleCenter[0] - ap[0]) / l)) / π;
		const gamma = acos(r / l) / π;

		switch (i + 1) {
			case 1:
				res.push(-0.5 - beta - gamma);
				res.push(-0.5 - beta + gamma);
				break;
			case 2:
				res.push(-0.5 + beta + gamma);
				break;
			case 3:
				res.push(0.5 - beta + gamma);
				break;
			case 4:
				res.push(0.5 + beta + gamma);
				break;
			case 5:
				res.push(-1.5 + beta + gamma);
				break;
			case 6:
				res.push(-1.5 + beta + gamma);
				break;
			case 7:
				res.push(-0.5 - beta + gamma);
				break;
			case 8:
				res.push(-0.5 - beta + gamma);
				break;
		}

		/**
      -0.8516444944031569 入点
      -0.197563051907167 1
      -0.007987334992532735 2
      0.4272852860246635 3
      0.8516444944031569 ...
      -0.891273030630514
      -0.6949442499922761
      -0.5225085064199887
      -0.35985847476497856
     */
		const result_after_two_hours = [
			-0.8516444944031569, -0.197563051907167, -0.007987334992532735, 0.4272852860246635, 0.8516444944031569, -0.891273030630514, -0.6949442499922761, -0.5225085064199887, -0.35985847476497856,
		];
	});
	console.log(res);

	res = [];
	// qq
	APositions.forEach((ap, i) => {
		const r = qpLeftRighCircleR;
		const l = lineLen(ap[0], ap[1], qpLeftCircleCenter[0], qpLeftCircleCenter[1]);
		const sita = atan(abs((qpLeftCircleCenter[0] - ap[0]) / (qpLeftCircleCenter[1] - ap[1])));
		const alpha = asin(r / l);

		const beta = asin(abs((qpLeftCircleCenter[0] - ap[0]) / l)) / π;
		const gamma = acos(r / l) / π;

		switch (i + 1) {
			case 1:
				res.push(-0.5 + beta + gamma);
				res.push(-0.5 + beta - gamma);
				break;
			case 2:
				res.push(-0.5 + beta - gamma);
				break;
			case 3:
				res.push(0.5 - beta - gamma);
				break;
			case 4:
				res.push(0.5 - beta - gamma);
				break;
			case 5:
				res.push(0.5 + beta - gamma);
				break;
			case 6:
				res.push(0.5 + beta - gamma);
				break;
			case 7:
				res.push(-0.5 - beta - gamma);
				break;
			case 8:
				res.push(-0.5 - beta - gamma);
				break;
		}

		const result_after_1_hours = [
			0.10164449440315693, -0.552436948092833, -0.39014152523502166, -0.22749149358001142, -0.055055750007723836, 0.141273030630514, 0.3983555055968429, -1.1772852860246634, -0.7420126650074674,
		];
	});
	console.log(res);
};

export const pqTrackJudgeCalc = () => {
	const len = lineLen(APositions[0][0], APositions[0][1], APositions[3][0], APositions[3][1]);
	const c = qpCenterCircleR * 2 * π;
	const len1 = len / 2;
	let sum = len + c;

	sum = (c / 8) * 5 + len;
	const res1 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.125 * 2 * c) / sum,
		(len1 + 0.125 * 3 * c) / sum,
		(len1 + (c / 8) * 5 + (len1 / 9) * 1.5) / sum,
		(len1 + (c / 8) * 5 + (len1 / 9) * 5.5) / sum,
		1,
	];

	sum = (c / 8) * 4 + len;
	const res2 = [
		0,
		((3.5 / 9) * len1) / sum,
		((8 / 9) * len1) / sum,
		(len1 + 0.125 * 1 * c) / sum,
		(len1 + 0.125 * 2 * c) / sum,
		(len1 + 0.125 * 3 * c) / sum,
		(len1 + 0.125 * 4 * c) / sum,
		(len1 + (c / 8) * 4 + (len1 / 9) * 3.5) / sum,
		1,
	];

	sum = (c / 8) * 3 + len;
	const res3 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.125 * 1 * c) / sum,
		(len1 + 0.125 * 2 * c) / sum,
		(len1 + 0.125 * 3 * c) / sum,
		(len1 + (c / 8) * 3 + (len1 / 9) * 3) / sum,
		(len1 + (c / 8) * 3 + (len1 / 9) * 5.5) / sum,
		1,
	];

	sum = (c / 8) * 2 + len;
	const res4 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.125 * 1 * c) / sum,
		(len1 + (c / 8) * 2) / sum,
		(len1 + (c / 8) * 2 + (len1 / 9) * 3) / sum,
		(len1 + (c / 8) * 2 + (len1 / 9) * 5.5) / sum,
		1,
	];

	sum = (c / 8) * 1 + len;
	const res5 = [0, ((3.5 / 9) * len1) / sum, len1 / sum, (len1 + (c / 8) * 1) / sum, (len1 + (c / 8) * 1 + (len1 / 9) * 3) / sum, (len1 + (c / 8) * 1 + (len1 / 9) * 5.5) / sum, 1];

	sum = (c / 8) * 8 + len;
	const res6 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.13542 * 1 * c) / sum,
		(len1 + 0.13542 * 2 * c) / sum,
		(len1 + 0.13542 * 3 * c) / sum,
		(len1 + 0.13542 * 4 * c) / sum,
		(len1 + 0.13542 * 5 * c) / sum,
		(len1 + 0.13542 * 6 * c) / sum,
		(len1 + c) / sum,
		(len1 + c + (len1 / 9) * 3) / sum,
		(len1 + c + (len1 / 9) * 5.7) / sum,
		1,
	];

	sum = (c / 8) * 7 + len;
	const res7 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.13542 * 1 * c) / sum,
		(len1 + 0.13542 * 2 * c) / sum,
		(len1 + 0.13542 * 3 * c) / sum,
		(len1 + 0.13542 * 4 * c) / sum,
		(len1 + 0.13542 * 5 * c) / sum,
		(len1 + 0.13542 * 6 * c) / sum,
		(len1 + (c / 8) * 7 + (len1 / 9) * 3) / sum,
		(len1 + (c / 8) * 7 + (len1 / 9) * 5.7) / sum,
		1,
	];

	sum = (c / 8) * 6 + len;
	const res8 = [
		0,
		((3.5 / 9) * len1) / sum,
		len1 / sum,
		(len1 + 0.125 * 1 * c) / sum,
		(len1 + 0.125 * 2 * c) / sum,
		(len1 + 0.125 * 3 * c) / sum,
		(len1 + 0.125 * 4 * c) / sum,
		(len1 + 0.125 * 5 * c) / sum,
		(len1 + 0.125 * 6 * c) / sum,
		(len1 + (c / 8) * 6 + (len1 / 9) * 3.5) / sum,
		1,
	];
	console.log(res1, res2, res3, res4, res5, res6, res7, res8);
};
