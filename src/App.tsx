import React, { useEffect, useState } from 'react';
import './App.css';
import { GameState } from './enums/gamestate';
import Maisim from './Maisim';

function App() {
  const [gameState, setGameState] = useState(GameState.Standby);

  useEffect(() => {}, []);

  return (
    <div className="App">
      <Maisim
        gameState={gameState}
        setGameState={(e) => {
          setGameState(e);
        }}
      />
    </div>
  );
}

export default App;
