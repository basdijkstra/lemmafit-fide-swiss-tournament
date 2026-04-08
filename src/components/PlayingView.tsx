import { GameResult, ActiveRound } from '../dafny/app';
import { TournamentDisplay } from '../hooks/useTournament';
import { formatRound } from '../utils/format';
import Standings from './Standings';

interface Props {
  display: TournamentDisplay;
  generateAndSubmitPairings: () => void;
  recordResult: (pairingIdx: number, result: GameResult) => void;
  finalizeRound: () => void;
}

function ActiveRoundView({
  round,
  participants,
  recordResult,
  canFinalize,
  finalizeRound,
}: {
  round: ActiveRound;
  participants: TournamentDisplay['participants'];
  recordResult: Props['recordResult'];
  canFinalize: boolean;
  finalizeRound: () => void;
}) {
  return (
    <div className="active-round">
      <h3>Pairings</h3>
      {round.bye.type === 'Some' && (
        <p className="bye-notice">
          Bye: <strong>{participants[round.bye.value]?.name}</strong>
        </p>
      )}
      <div className="pairings-list">
        {round.pairings.map((pairing, idx) => {
          const result = round.results[idx];
          const white = participants[pairing.whiteIdx]?.name ?? `#${pairing.whiteIdx}`;
          const black = participants[pairing.blackIdx]?.name ?? `#${pairing.blackIdx}`;
          const recorded = result.type === 'Some' ? result.value : null;

          return (
            <div key={idx} className={`pairing-card ${recorded ? 'recorded' : ''}`}>
              <div className="matchup">
                <span className="white-player">♔ {white}</span>
                <span className="vs">vs</span>
                <span className="black-player">♚ {black}</span>
              </div>
              {recorded ? (
                <div className="result-badge">
                  {recorded === 'WhiteWins' && `${white} wins`}
                  {recorded === 'BlackWins' && `${black} wins`}
                  {recorded === 'Draw' && 'Draw'}
                </div>
              ) : (
                <div className="result-buttons">
                  <button onClick={() => recordResult(idx, 'WhiteWins')}>
                    {white} wins
                  </button>
                  <button onClick={() => recordResult(idx, 'Draw')}>
                    Draw
                  </button>
                  <button onClick={() => recordResult(idx, 'BlackWins')}>
                    {black} wins
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="primary"
        onClick={finalizeRound}
        disabled={!canFinalize}
      >
        Finalize Round
      </button>
    </div>
  );
}

export default function PlayingView({
  display,
  generateAndSubmitPairings,
  recordResult,
  finalizeRound,
}: Props) {
  const { participants, totalRounds, currentRound, activeRound, canSubmitPairings, canFinalize } = display;
  const hasActiveRound = activeRound.type === 'Some';
  const hasPairings = hasActiveRound && activeRound.value.pairings.length > 0;

  return (
    <div className="playing-view">
      <h2>{formatRound(currentRound, totalRounds)}</h2>

      {!hasPairings && (
        <div className="section">
          <button
            className="primary"
            onClick={generateAndSubmitPairings}
            disabled={!canSubmitPairings}
          >
            Generate Pairings
          </button>
        </div>
      )}

      {hasPairings && activeRound.type === 'Some' && (
        <ActiveRoundView
          round={activeRound.value}
          participants={participants}
          recordResult={recordResult}
          canFinalize={canFinalize}
          finalizeRound={finalizeRound}
        />
      )}

      <Standings participants={participants} />
    </div>
  );
}
