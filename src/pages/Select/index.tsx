import './index.css';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Area } from '../../Maisim/areas';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';
import { π } from '../../math';
import { createSong } from '../../services/api/Song';
import { createNotes } from '../../services/api/Notes';

interface Props {
	onPress: (key: string) => void;
	w: number;
}
let timer;
let timer2;
let hasinit = false;

let bgCanvas: CanvasRenderingContext2D;

let w = 0,
	r = 0;

const drawBg = () => {
	bgCanvas.clearRect(0, 0, w, w);

	// 颜色底
	// 中间圆
	bgCanvas.beginPath();
	bgCanvas.arc(r, w * 0.543, r * 0.622, 0, π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	// 中间横贯
	bgCanvas.beginPath();
	bgCanvas.lineTo(0, w * 0.35);
	bgCanvas.lineTo(w, w * 0.35);
	bgCanvas.lineTo(w, w * 0.69);
	bgCanvas.lineTo(0, w * 0.69);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	// 左按钮
	bgCanvas.beginPath();
	bgCanvas.arc(w * 0.13, w * 0.71, w * 0.085, -0.5 * π, 0.5 * π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.lineTo(0, r);
	bgCanvas.lineTo(w * 0.14, r);
	bgCanvas.lineTo(w * 0.14, w * (0.71 + 0.085));
	bgCanvas.lineTo(0, w * (0.71 + 0.085));
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	// 右按钮
	bgCanvas.beginPath();
	bgCanvas.arc(w * 0.87, w * 0.71, w * 0.085, 0.5 * π, -0.5 * π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.lineTo(w * 0.86, r);
	bgCanvas.lineTo(w, r);
	bgCanvas.lineTo(w, w * (0.71 + 0.085));
	bgCanvas.lineTo(w * 0.86, w * (0.71 + 0.085));
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#9F51DC';
	bgCanvas.fill();

	// 灰白色
	// 左按钮
	bgCanvas.beginPath();
	bgCanvas.arc(w * 0.13, w * 0.71, w * 0.08, -0.5 * π, 0.5 * π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.lineTo(0, r);
	bgCanvas.lineTo(w * 0.14, r);
	bgCanvas.lineTo(w * 0.14, w * (0.71 + 0.08));
	bgCanvas.lineTo(0, w * (0.71 + 0.08));
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	// 右按钮
	bgCanvas.beginPath();
	bgCanvas.arc(w * 0.87, w * 0.71, w * 0.08, 0.5 * π, -0.5 * π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.lineTo(w * 0.86, r);
	bgCanvas.lineTo(w, r);
	bgCanvas.lineTo(w, w * (0.71 + 0.08));
	bgCanvas.lineTo(w * 0.86, w * (0.71 + 0.08));
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.arc(r, w * 0.543, r * 0.374, π, 2 * π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.arc(r, w * 0.543, r * 0.4675, 0, π);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	bgCanvas.beginPath();
	bgCanvas.lineTo(0, w * 0.41);
	bgCanvas.lineTo(w, w * 0.41);
	bgCanvas.lineTo(w, w * 0.68);
	bgCanvas.lineTo(0, w * 0.68);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#E6E6E6';
	bgCanvas.fill();

	// 顶部蓝色tip
	bgCanvas.beginPath();
	bgCanvas.lineTo(0, w * 0.33);
	bgCanvas.lineTo(w, w * 0.33);
	bgCanvas.lineTo(w, w * 0.35);
	bgCanvas.lineTo(0, w * 0.35);
	bgCanvas.closePath();
	bgCanvas.fillStyle = '#203CB4';
	bgCanvas.fill();
};

// eslint-disable-next-line import/no-anonymous-default-export
export default forwardRef((props: Props, ref) => {
	const [currentDegree, setcurrentDegree] = useState(0);

	useImperativeHandle(ref, () => ({
		onPress: (key: string) => {
			onPress(key);
			props.onPress(key);
		},
	}));

	const onPress = (key: string) => {
		if (key !== '') {
			console.log(props);
			if (key === 'K1') {
				createSong({ name: 'test', artist: 'test', copyright: 'test', genre: 0, version: 0, is_private: false })
					.then((e: any) => {
						console.log(e);
					})
					.catch((e: any) => {
						console.log(e);
					});
				props.onPress(key);
			} else if (key === 'K2') {
				createNotes({ lv: '12+', designer: 'yajuu', is_official: false, lv_base: 12.1, notes: '{180}(4),1,E', difficulty: 0, is_dx: false, utage_genre: 0, songId: 0, is_private: false })
					.then((e: any) => {
						console.log(e);
					})
					.catch((e: any) => {
						console.log(e);
					});
				props.onPress(key);
			}
		}
	};

	const initCanvas = () => {
		w = props.w;
		r = props.w / 2;
		bgCanvas = (document.getElementsByClassName('selectBgCanvas')[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
	};

	useEffect(() => {
		if (!hasinit) {
			initCanvas();
			timer = setInterval(() => {
				setcurrentDegree((currentDegree) => currentDegree + 1);
			}, 16);

			timer2 = setInterval(() => {
				drawBg();
			}, 16);

			hasinit = true;
		}
	}, []);

	useEffect(() => {
		w = props.w;
		r = props.w / 2;
	}, [props.w]);

	return (
		<div className="selectcontainer">
			<img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" style={{ rotate: currentDegree * 0.5 + 'deg' }} />
			<canvas className="selectBgCanvas" width={props.w} height={props.w}></canvas>
		</div>
	);
});
