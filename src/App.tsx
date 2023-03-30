import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { GameState } from './utils/types/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/types/noteStyles';
import { Area } from './Maisim/areas';
import NotesEditor from './NotesEditor';
import HeadScreen from './HeadScreen';
import { sheetdata2 } from './Maisim/_notesInDev';

function App() {
  const [gameState, setGameState] = useState(GameState.Begin);
  const [gameState2, setGameState2] = useState(GameState.Begin);
  const [gameState3, setGameState3] = useState(GameState.Begin);
  const [winWidth, setwinWidth] = useState(0);
  const [winHeight, setwinHeight] = useState(0);
  const [key, setkey]: [string, any] = useState('');
  const [showEditor, setshowEditor]: [boolean, any] = useState(false);
  const [currentnotes, setcurrentnotes]: [string, any] = useState('');

  useEffect(() => {
    window.addEventListener('resize', e => {
      setwinHeight((e.target as Window).innerHeight);
      setwinWidth((e.target as Window).innerWidth);
    });

    setwinHeight(300);
    setwinWidth(300);
  }, []);

  return (
    <div className="App">
      <div className="mainContainer">
        <div>
          <Maisim
            id="1"
            gameState={gameState}
            setGameState={e => {
              setGameState(e);
            }}
            w={600}
            h={600}
            tapStyle={TapStyles.Classic}
            holdStyle={RegularStyles.Classic}
            slideStyle={RegularStyles.Classic}
            slideColor={SlideColor.Pink}
            doShowEffect={true}
            doShowJudgement={true}
            outerColor={'#000000'}
            isAuto={true}
            doShowKeys={false}
            centerText={0}
            sheet={sheetdata2.notes}
            sheetProps={{ first: sheetdata2.first, wholeBPM: sheetdata2.wholebpm }}
            onPlayStart={function (): void {}}
            onGameRecordChange={function (gameRecord: object): void {}}
            onPlayFinish={function (): void {}}
            uiContent={undefined}
            doShowUIContent={true}
            onScreenPressDown={function (key: string): void {
              setkey(key);
            }}
            onScreenPressUp={function (key: string): void {
              setkey('');
            }}
            lightStatus={[]}
          />
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default App;
