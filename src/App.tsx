import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { GameState } from './utils/gamestate';
import Maisim from './Maisim';
import { RegularStyles, SlideColor, TapStyles } from './utils/noteStyles';
import { Area } from './Maisim/areas';
import Begin from './pages/Begin';
import Select from './pages/Select';
import NotesEditor from './NotesEditor';
import HeadScreen from './HeadScreen';

function App() {
  const [gameState, setGameState] = useState(GameState.Begin);
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

    setwinHeight(window.innerHeight);
    setwinWidth(window.innerWidth);
  }, []);

  return (
    <div className="App">
      <div className="mainContainer">
        <div style={{ display: 'flex' }}>
          <HeadScreen
            showEditor={showEditor}
            setshowEditor={v => {
              setshowEditor(v);
            }}
            winWidth={winWidth}
            winHeight={winHeight}
          />
          <Maisim
            gameState={gameState}
            setGameState={e => {
              setGameState(e);
            }}
            w={winHeight > winWidth ? winWidth : winHeight}
            h={winHeight > winWidth ? winWidth : winHeight}
            l={(winHeight > winWidth ? winWidth : winHeight) * 0.78 * 0.3 + 50}
            t={0}
            tapStyle={TapStyles.Concise}
            holdStyle={RegularStyles.Concise}
            slideStyle={RegularStyles.Concise}
            slideColor={SlideColor.Blue}
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
                  return (
                    <Begin
                      ref={beginRef}
                      onPress={key => {
                        alert(123);
                        setGameState(GameState.Select);
                      }}
                    />
                  );
                case GameState.Select:
                  return (
                    <Select
                      ref={selectRef}
                      onPress={key => {
                        //setGameState(GameState.Select);
                      }}
                      w={winHeight > winWidth ? winWidth : winHeight}
                    />
                  );
                case GameState.Enter:
                case GameState.Play:
                case GameState.Pause:
                case GameState.Finish:
                default:
                  return <></>;
              }
            })()}
            showUIContent={true}
            onPressDown={function (key: string): void {
              setkey(key);
            }}
            onPressUp={function (key: string): void {
              setkey('');
              // @ts-ignore
              beginRef.current?.onPress(key);
              // @ts-ignore
              selectRef.current?.onPress(key);
            }}
            lightStatus={[]}
          />
        </div>
        {showEditor ? (
          <NotesEditor
            notes={currentnotes}
            onEdit={notes => {
              setcurrentnotes(notes);
            }}
            onPlay={() => {}}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
