import { abs, atan, cos, sin, π } from '../../math';
import { center } from '../const';
import { APositions, ppPoints, qpCenterCircleR, qpLeftCircleCenter, qpLeftRighCircleR, qpRightCircleCenter, qqPoints, szLeftPoint, szRightPoint } from './_global';

/**
 * 确定SLIDE TRACK判定图像的角度
 * @param slideLine
 * @returns 角度喵
 */
export const getJudgeDirection = (endPosOri: string, startPosOri: string, turnPosOri: string, type: string) => {
	let endPos = Number(endPosOri) - Number(startPosOri) + 1;
	let turnPos = Number(turnPosOri) - Number(startPosOri) + 1;
	if (endPos < 1) endPos += 8;
	if (turnPos < 1) turnPos += 8;

	let angle = ((Number(startPosOri) - 1) * 360) / 8;

	let startPosX = APositions[0][0],
		startPosY = APositions[0][1];

	switch (type) {
		case '<':
		case '>':
		case '^':
			break;
		case '-':
		case 'w':
			break;
		case 's':
			startPosX = szLeftPoint[0];
			startPosY = szLeftPoint[1];
			break;
		case 'z':
			startPosX = szRightPoint[0];
			startPosY = szRightPoint[1];
			break;
		case 'v':
			startPosX = center[0];
			startPosY = center[1];
			break;
		case 'V':
			startPosX = APositions[turnPos - 1][0];
			startPosY = APositions[turnPos - 1][1];
			break;
		case 'p':
			{
				/** 圆弧开始画的角度 */
				const startAngle = -0.75;
				/** 圆弧的角度 */
				const angle = 0.25 * (endPos >= 6 ? 14 - endPos : 6 - endPos);
				/** 圆弧终止的点 */
				startPosX = center[0] + qpCenterCircleR * cos((startAngle - angle) * π);
				startPosY = center[1] + qpCenterCircleR * sin((startAngle - angle) * π);
			}
			break;
		case 'q':
			{
				/** 圆弧开始画的角度 */
				const startAngle = 0;
				/** 圆弧的角度 */
				const angle = 0.25 * (endPos <= 4 ? endPos + 4 : endPos - 4);

				startPosX = center[0] + qpCenterCircleR * cos((startAngle + angle) * π);
				startPosY = center[1] + qpCenterCircleR * sin((startAngle + angle) * π);
			}
			break;
		case 'pp':
			{
				const startAngle = ppPoints[0];
				const angle = endPos === 4 ? 1 - ppPoints[endPos] + 1 + startAngle + 2 : 1 - ppPoints[endPos] + 1 + startAngle;

				startPosX = qpRightCircleCenter[0] + qpLeftRighCircleR * cos((startAngle - angle) * π);
				startPosY = qpRightCircleCenter[1] + qpLeftRighCircleR * sin((startAngle - angle) * π);
			}
			break;
		case 'qq':
			{
				const startAngle = qqPoints[0];
				const angle = endPos === 7 ? qqPoints[endPos] - startAngle : 1 + qqPoints[endPos] + 1 - startAngle;

				startPosX = qpLeftCircleCenter[0] + qpLeftRighCircleR * cos((startAngle + angle) * π);
				startPosY = qpLeftCircleCenter[1] + qpLeftRighCircleR * sin((startAngle + angle) * π);
			}
			break;
		default:
			break;
	}

	if (type === '<' || type === '>' || type === '^') {
		let a = ((Number(endPos) - Number(startPosOri)) * 360) / 8;

		return a + angle;
	} else {
		let a = abs((atan((startPosY - APositions[endPos - 1][1]) / (startPosX - APositions[endPos - 1][0])) / π) * 180);
		if (Number(endPosOri) > 4) {
			a = -a;
		}
		if ((Number(endPosOri) > 6 || Number(endPosOri) < 3) && type === 'v') {
			a = -a;
		}
		return a + angle;
	}
};
