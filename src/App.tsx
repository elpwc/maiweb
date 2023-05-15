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
import { MaisimInfo, UI } from './ui';
import { GameRecord } from './Maisim/utils/types/gameRecord';

function App() {
  const [gameState, setGameState] = useState(GameState.Begin);
  const [gameState2, setGameState2] = useState(GameState.Begin);
  const [gameState3, setGameState3] = useState(GameState.Begin);
  const [winWidth, setwinWidth] = useState(0);
  const [winHeight, setwinHeight] = useState(0);
  const [size, setSize] = useState(0);
  const [key, setkey]: [string, any] = useState('');
  const [showEditor, setshowEditor]: [boolean, any] = useState(false);
  const [maisimComponentKey, setMaisimComponentKey] = useState(1);

  const [info, setInfo] = useState<MaisimInfo>({
    currentNotes: {
      sheet: sheetdata2.notes,
      sheetProps: { wholeBPM: sheetdata2.wholebpm, first: sheetdata2.first },
      track: testtrack2,
      backgroundType: BackgroundType.Video,
      backgroundImage: testbgi2,
      backgroundAnime: testbga2
    },
    gameRecord: null,
    progress: 0,
    duration: 0
  });
  const [seekAction, setSeekAction] = useState<{ progress: number } | undefined>(undefined);

  const beginRef = useRef(null);
  const selectRef = useRef(null);
  
  const restarting = useRef(false);

  return (
    <UI
      size={size}
      setSize={setSize}
      info={info}
      onPlay={() => {
        if (restarting.current) {
          return;
        }
        // TODO: 這個太髒了，以後得把 GameState 相關的東西小重寫一下
        document.getElementById('playButton')!.click();
      }}
      onRestart={(sheet: string) => {
        if (restarting.current) {
          return;
        }
        restarting.current = true;
        // pause
        if (gameState == GameState.Play) {
          document.getElementById('playButton')!.click();
        }
        // reload
        if (sheet != info.currentNotes.sheet) {
          setInfo({ ...info, currentNotes: { ...info.currentNotes, sheet } });
        }
        setSeekAction(undefined);
        setGameState(GameState.Begin);
        setMaisimComponentKey(maisimComponentKey + 1);
        // auto play
        setTimeout(() => {
          document.getElementById('playButton')!.click();
          restarting.current = false;
        }, 1000);
      }}
      onSeek={(progress: number) => {
        if (restarting.current) {
          return;
        }
        setSeekAction({ progress });
      }}
      maisim={
        <Maisim
          id={String(maisimComponentKey)}
          key={String(maisimComponentKey)}
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
          doEnableKeyboard={true}
          doShowKeys={false}
          centerText={0}
          track={info.currentNotes.track}
          backgroundType={info.currentNotes.backgroundType}
          backgroundImage={info.currentNotes.backgroundImage}
          backgroundAnime={info.currentNotes.backgroundAnime}
          backgroundColor={'#136594'}
          sheet={info.currentNotes.sheet}
          sheetProps={info.currentNotes.sheetProps}
          onPlayStart={(duration: number) => { setInfo({ ...info, duration }) }}
          onGameRecordChange={function (gameRecord: GameRecord): void {}}
          onPlayFinish={function (): void {}}
          onProgress={(progress: number) => { setInfo({ ...info, progress }) }}
          seekAction={seekAction}
          uiContent={undefined}
          doShowUIContent={true}
          onScreenPressDown={function (key: string): void {
            setkey(key);
          }}
          onScreenPressUp={function (key: string): void {
            setkey('');
          }}
          lightStatus={[]}
          speedTap={2}
          speedTouch={6.5}
          slideTrackOffset={0}
        />
      }
    />
  );
}

export default App;
