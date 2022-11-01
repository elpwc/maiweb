import './index.css';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';

interface Props {
	onPress: (key: string) => void;
}

let timer;
let hasinit = false;

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
		alert(key);
	};

	useEffect(() => {
		if (!hasinit) {
			console.log(currentDegree);
			timer = setInterval(() => {
				setcurrentDegree((currentDegree) => currentDegree + 1);
			}, 16);
			hasinit = true;
		}
	}, []);

	return (
		<div className="container">
			<img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" style={{ rotate: currentDegree * 0.5 + 'deg' }} />
		</div>
	);
});
