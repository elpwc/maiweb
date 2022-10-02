import './index.css';
import { useEffect } from 'react';
import { Area } from '../../Maisim/areas';

interface Props {
	onPress: (area: Area) => void;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
	useEffect(() => {}, []);

	return <div className="container"></div>;
};
