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

  const beginRef = useRef(null);
  const selectRef = useRef(null);

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
            w={400}
            h={400}
            l={0}
            t={0}
            tapStyle={TapStyles.Concise}
            holdStyle={RegularStyles.Concise}
            slideStyle={RegularStyles.Concise}
            slideColor={SlideColor.Blue}
            doShowEffect={true}
            isAuto={true}
            doShowKeys={true}
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
        <div>

        <Maisim
            id="2"
            gameState={gameState2}
            setGameState={e => {
              setGameState2(e);
            }}
            w={400}
            h={400}
            l={500}
            t={0}
            tapStyle={TapStyles.Concise}
            holdStyle={RegularStyles.Concise}
            slideStyle={RegularStyles.Concise}
            slideColor={SlideColor.Blue}
            doShowEffect={true}
            isAuto={true}
            doShowKeys={true}
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

      </div>
    </div>
  );
}

export default App;
