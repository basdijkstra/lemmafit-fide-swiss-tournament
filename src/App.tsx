import './App.css';
import { useTournament } from './hooks/useTournament';
import SetupView from './components/SetupView';
import PlayingView from './components/PlayingView';
import FinishedView from './components/FinishedView';

function App() {
  const {
    display,
    addParticipant,
    removeLastParticipant,
    setRounds,
    startTournament,
    generateAndSubmitPairings,
    recordResult,
    finalizeRound,
    undo,
    redo,
  } = useTournament();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Swiss Tournament</h1>
        <div className="history-controls">
          <button onClick={undo} disabled={!display.canUndo} title="Undo">↩</button>
          <button onClick={redo} disabled={!display.canRedo} title="Redo">↪</button>
        </div>
      </header>

      {display.phase === 'Setup' && (
        <SetupView
          display={display}
          addParticipant={addParticipant}
          removeLastParticipant={removeLastParticipant}
          setRounds={setRounds}
          startTournament={startTournament}
        />
      )}
      {display.phase === 'Playing' && (
        <PlayingView
          display={display}
          generateAndSubmitPairings={generateAndSubmitPairings}
          recordResult={recordResult}
          finalizeRound={finalizeRound}
        />
      )}
      {display.phase === 'Finished' && (
        <FinishedView display={display} />
      )}
    </div>
  );
}

export default App;
