import { Participant } from '../dafny/app';
import { formatScore } from '../utils/format';

interface Props {
  participants: Participant[];
  title?: string;
}

// Sort by score descending, then by name for tiebreak — display concern only
function sortedStandings(participants: Participant[]) {
  return [...participants]
    .map((p, idx) => ({ ...p, originalIdx: idx }))
    .sort((a, b) => {
      const diff = b.score2x - a.score2x;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
}

export default function Standings({ participants, title = 'Standings' }: Props) {
  const rows = sortedStandings(participants);
  return (
    <div className="standings">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, rank) => (
            <tr key={p.originalIdx}>
              <td>{rank + 1}</td>
              <td>{p.name}</td>
              <td>{formatScore(p.score2x)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
