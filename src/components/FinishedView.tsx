import { TournamentDisplay } from '../hooks/useTournament';
import { formatScore } from '../utils/format';
import Standings from './Standings';

interface Props {
  display: TournamentDisplay;
}

export default function FinishedView({ display }: Props) {
  const { participants } = display;

  const winner = [...participants].sort((a, b) => {
    const diff = b.score2x - a.score2x;
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  })[0];

  return (
    <div className="finished-view">
      <h2>Tournament Complete</h2>
      {winner && (
        <div className="winner-banner">
          <div className="trophy">♛</div>
          <div className="winner-name">{winner.name}</div>
          <div className="winner-score">{formatScore(winner.score2x)} points</div>
        </div>
      )}
      <Standings participants={participants} title="Final Standings" />
    </div>
  );
}
