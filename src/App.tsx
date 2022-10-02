import React, { useEffect, useState } from 'react';
import './App.css';
import { GameState } from './utils/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/noteStyles';
import { Area } from './Maisim/areas';

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
				slideColor={SlideColor.Blue}
				judgeLineStyle={0}
				showEffect={true}
				autoMode={true}
				showKeys={true}
				centerText={0}
				sheet={''}
				upDownMirror={false}
				leftRightMirror={false}
				onGameStart={function (): void {}}
				onGameRecordChange={function (gameRecord: object): void {}}
				onGameFinish={function (): void {}}
				uiContent={
					<div
						style={{ left: '300px', top: '200px', position: 'fixed', color: 'white' }}
						onClick={(e) => {
							console.log(e);
						}}
					>
						<p>114514</p>
						<button>123</button>
					</div>
				}
				showUIContent={false}
				onClick={function (area: Area): void {}}
        lightStatus = {[]}
			/>
		</div>
	);
}

export default App;
