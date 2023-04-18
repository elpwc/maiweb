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
import { UI } from './ui';

function App() {
  const [gameState, setGameState] = useState(GameState.Begin);
  const [gameState2, setGameState2] = useState(GameState.Begin);
  const [gameState3, setGameState3] = useState(GameState.Begin);
  const [winWidth, setwinWidth] = useState(0);
  const [winHeight, setwinHeight] = useState(0);
  const [size, setSize] = useState(0);
  const [key, setkey]: [string, any] = useState('');
  const [showEditor, setshowEditor]: [boolean, any] = useState(false);
  const [currentnotes, setcurrentnotes]: [string, any] = useState('');

  const beginRef = useRef(null);
  const selectRef = useRef(null);

  return (
    <UI
      size={size}
      setSize={setSize}
      onPlay={() => {
        document.getElementById('playButton')?.click();
      }}
      maisim={
        <Maisim
          id="1"
          style={{}}
          gameState={gameState}
          setGameState={(e: any) => {
            setGameState(e);
          }}
          w={size}
          h={size}
          tapStyle={TapStyles.Classic}
          holdStyle={RegularStyles.Classic}
          slideStyle={RegularStyles.Classic}
          slideColor={SlideColor.Pink}
          doShowEffect={true}
          doShowJudgement={true}
          outerColor={'#000000'}
          isAuto={true}
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
      }
    />
  );
}

export default App;
