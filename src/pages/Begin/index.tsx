import './index.css';
import { useEffect, useState } from 'react';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';
import { Area } from '../../Maisim/areas';

interface Props {
	press: string;
	onPress: (key: string) => void;
}

let timer;
let hasinit = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
	const [currentDegree, setcurrentDegree] = useState(0);

	useEffect(() => {
		if (!hasinit) {
			console.log(currentDegree);
			timer = setInterval(() => {
				setcurrentDegree((currentDegree) => currentDegree + 1);
			}, 16);
			hasinit = true;
		}
	}, []);

	useEffect(() => {
		if (props.press !== '') {
			props.onPress(props.press);
		}
	}, [props.press]);

	return (
		<div className="begincontainer">
			<img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" style={{ rotate: currentDegree * 0.5 + 'deg' }} />
			<img src={uiIcon.mamaDX} className="logoimg" alt="logo" />
			<img src={uiIcon.UI_ADV_Img_PromoChara} className="dxkuma" alt="logo" />

			<div className="tip">
				<p className="beginTip">请点击mamaDX屏幕或按下任意键</p>
				<img src={uiIcon.Begin_Tip} className="tipsbg" alt="tip" />
			</div>

			<p className="tip2">某洗衣机的网页模拟器</p>
		</div>
	);
};
