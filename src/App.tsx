import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { GameState } from './utils/types/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/types/noteStyles';
import { Area } from './Maisim/areas';
import NotesEditor from './NotesEditor';
import HeadScreen from './HeadScreen';
import { sheetdata } from './testTrack/1/sheet';
import testtrack from './testTrack/1/track.mp3';
import testbgi from './testTrack/1/bg.jpg';
import testbga from './testTrack/1/pv.mp4';
import { sheetdata2 } from './testTrack/2/sheet';
import testtrack2 from './testTrack/2/track.mp3';
import testbgi2 from './testTrack/2/bg.jpg';
import testbga2 from './testTrack/2/pv.mp4';
import { BackgroundType } from './Maisim/utils/types/backgroundType';
import { AutoType } from './Maisim/utils/types/autoType';

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
      <div className="mainContainer" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', backgroundColor: '#617e97', marginTop: '10px',padding: '20px 20px', borderRadius: '20px', boxShadow: 'rgb(141 141 141) 0px 0px 10px 0px' }}>
          <Maisim
            id="1"
            style={{}}
            gameState={gameState}
            setGameState={e => {
              setGameState(e);
            }}
            w={500}
            h={500}
            tapStyle={TapStyles.Classic}
            holdStyle={RegularStyles.Classic}
            slideStyle={RegularStyles.Classic}
            slideColor={SlideColor.Pink}
            doShowEffect={true}
            doShowJudgement={true}
            outerColor={'#000000'}
            isAuto={false}
            autoType={AutoType.Directly}
            doEnableKeyboard={false}
            doShowKeys={false}
            centerText={0}
            track={testtrack}
            backgroundType={BackgroundType.Video}
            backgroundImage={testbgi}
            backgroundAnime={testbga}
            backgroundColor={'#136594'}
            sheet={sheetdata.notes}
            sheetProps={{ first: sheetdata.first, wholeBPM: sheetdata.wholebpm }}
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
          <Maisim
            id="2"
            style={{}}
            gameState={gameState2}
            setGameState={e => {
              setGameState2(e);
            }}
            w={500}
            h={500}
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
            track={testtrack2}
            backgroundType={BackgroundType.Video}
            backgroundImage={testbgi2}
            backgroundAnime={testbga2}
            backgroundColor={'#136594'}
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
