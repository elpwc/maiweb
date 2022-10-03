import './index.css';
import { useEffect, useState } from 'react';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';

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
		<div className="container">
			<img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" style={{ rotate: currentDegree * 0.5 + 'deg' }} />

		</div>
	);
};
