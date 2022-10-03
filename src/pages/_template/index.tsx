import './index.css';
import { useEffect } from 'react';
import { Area } from '../../Maisim/areas';

interface Props {
	press: string;
	onPress: (key: string) => void
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
	useEffect(() => {}, []);

	return <div className="container"></div>;
};
