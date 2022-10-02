import React, { useEffect, useState } from 'react';
import './App.css';
import { GameState } from './utils/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/noteStyles';

function App() {
	const [gameState, setGameState] = useState(GameState.Standby);
	const [winWidth, setwinWidth] = useState(0);
	const [winHeight, setwinHeight] = useState(0);

	useEffect(() => {
		window.addEventListener('resize', (e) => {
			setwinHeight((e.target as Window).innerHeight);
			setwinWidth((e.target as Window).innerWidth);
		});

		setwinHeight(window.innerHeight);
		setwinWidth(window.innerWidth);
	}, []);

	return (
		<div className="App">
			<Maisim
				gameState={gameState}
				setGameState={(e) => {
					setGameState(e);
				}}
				w={winHeight > winWidth ? winWidth : winHeight}
				h={winHeight > winWidth ? winWidth : winHeight}
				tapStyle={TapStyles.Concise}
				holdStyle={RegularStyles.Concise}
				slideStyle={RegularStyles.Concise}
				slideColor={SlideColor.Pink}
				judgeLineStyle={0}
				showEffect={true}
				autoMode={true}
				showKeys={true}
				centerText={0}
				sheet={''}
				upDownMirror={false}
				leftRightMirror={false}
				onGameStart={function (): void {
					throw new Error('Function not implemented.');
				}}
				onGameRecordChange={function (gameRecord: object): void {
					throw new Error('Function not implemented.');
				}}
				onGameFinish={function (): void {
					throw new Error('Function not implemented.');
				}}
				uiContent={<div><p>114514</p><button>123</button></div>}
			/>
		</div>
	);
}

export default App;
