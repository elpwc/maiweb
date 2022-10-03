import React, { useEffect, useState } from 'react';
import './App.css';
import { GameState } from './utils/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/noteStyles';
import { Area } from './Maisim/areas';
import Begin from './pages/Begin';

function App() {
	const [gameState, setGameState] = useState(GameState.Begin);
	const [winWidth, setwinWidth] = useState(0);
	const [winHeight, setwinHeight] = useState(0);
	const [key, setkey]:[string, any] = useState('');

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
				uiContent={(() => {
					switch (gameState) {
						case GameState.Begin:
							return <Begin press={key} onPress={(key) => {
								console.log(12)
								setGameState(GameState.Play)
							}}/>;
						case GameState.Select:
						case GameState.Difficulty:
						case GameState.Confirm:
						case GameState.Setting:
						case GameState.Enter:
						case GameState.Play:
						case GameState.Pause:
						case GameState.Finish:
						default:
							return <></>;
					}
				})()}
				showUIContent={true}
				onClick={function (key: string): void {
					setkey(key);
				}}
				lightStatus={[]}
			/>
		</div>
	);
}

export default App;
