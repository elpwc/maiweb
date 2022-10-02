import './index.css';
import { useEffect } from 'react';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';
import { Area } from '../../Maisim/areas';

interface Props {
	onPress: (area: Area) => void
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
	useEffect(() => {}, []);

	return (
		<div className="container">
			
			<img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" />
			<img src={uiIcon.mamaDX} className="logoimg" alt="logo" />
			<img src={uiIcon.UI_ADV_Img_PromoChara} className="dxkuma" alt="logo" />

			<div className="tip">
				<p className="beginTip">请点击mamaDX屏幕或按下任意键</p>
				<img src={uiIcon.Begin_Tip} className="tipsbg" alt="tip"/>
			</div>

			<p className='tip2'>某洗衣机的网页模拟器</p>
		</div>
	);
};
