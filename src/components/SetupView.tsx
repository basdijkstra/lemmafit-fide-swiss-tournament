import { useState } from 'react';
import { TournamentDisplay } from '../hooks/useTournament';

interface Props {
  display: TournamentDisplay;
  addParticipant: (name: string) => void;
  removeLastParticipant: () => void;
  setRounds: (n: number) => void;
  startTournament: () => void;
}

export default function SetupView({
  display,
  addParticipant,
  removeLastParticipant,
  setRounds,
  startTournament,
}: Props) {
  const [nameInput, setNameInput] = useState('');
  const { participants, totalRounds, canStart } = display;

  const handleAdd = () => {
    const name = nameInput.trim();
    if (name && participants.length < 19) {
      addParticipant(name);
      setNameInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="setup-view">
      <h2>Tournament Setup</h2>

      <div className="section">
        <h3>Participants ({participants.length}/19)</h3>
        <div className="input-row">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Player name"
            maxLength={64}
            disabled={participants.length >= 19}
          />
          <button
            onClick={handleAdd}
            disabled={!nameInput.trim() || participants.length >= 19}
          >
            Add
          </button>
        </div>
        {participants.length > 0 && (
          <ul className="participant-list">
            {participants.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>
        )}
        {participants.length > 0 && (
          <button className="danger" onClick={removeLastParticipant}>
            Remove last
          </button>
        )}
      </div>

      <div className="section">
        <h3>Rounds</h3>
        <div className="input-row">
          <label>Number of rounds:</label>
          <select
            value={totalRounds}
            onChange={e => setRounds(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section">
        {participants.length < 2 && (
          <p className="hint">Add at least 2 participants to start.</p>
        )}
        <button
          className="primary"
          onClick={startTournament}
          disabled={!canStart}
        >
          Start Tournament
        </button>
      </div>
    </div>
  );
}
