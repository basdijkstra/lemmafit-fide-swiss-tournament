import { Participant } from '../dafny/app';

// FIDE-style Swiss pairing algorithm.
// Sorts players by score, assigns bye to the lowest eligible player (odd count),
// then greedily pairs adjacent players avoiding rematches.
// Color assignment is NOT done here — it is delegated to Dafny's ChooseColors
// (FIDE Rules 6-8, formally verified).
export function computePairings(participants: Participant[]): {
  pairings: [number, number][];
  byeIdx: number | null;
} {
  const n = participants.length;

  // Sort indices by score descending, then by name for stable tiebreak
  const sorted = Array.from({ length: n }, (_, i) => i).sort((a, b) => {
    const diff = participants[b].score2x - participants[a].score2x;
    return diff !== 0 ? diff : participants[a].name.localeCompare(participants[b].name);
  });

  // Assign bye to lowest-ranked player who hasn't received one
  let byeIdx: number | null = null;
  const pool = [...sorted];

  if (n % 2 === 1) {
    for (let i = pool.length - 1; i >= 0; i--) {
      if (!participants[pool[i]].byeReceived) {
        byeIdx = pool[i];
        pool.splice(i, 1);
        break;
      }
    }
  }

  // Greedy pairing: pair each player with the highest-ranked unpaired opponent
  // they haven't faced before. Fall back to any unpaired opponent if needed.
  const pairings: [number, number][] = [];
  const used = new Set<number>();

  for (let i = 0; i < pool.length; i++) {
    const p1 = pool[i];
    if (used.has(p1)) continue;

    let matched = false;
    for (let j = i + 1; j < pool.length; j++) {
      const p2 = pool[j];
      if (used.has(p2)) continue;
      if (!participants[p1].opponents.includes(p2)) {
        pairings.push([p1, p2]);
        used.add(p1);
        used.add(p2);
        matched = true;
        break;
      }
    }

    // Fallback: pair with anyone (rematch is allowed if no other option)
    if (!matched) {
      for (let j = i + 1; j < pool.length; j++) {
        const p2 = pool[j];
        if (used.has(p2)) continue;
        pairings.push([p1, p2]);
        used.add(p1);
        used.add(p2);
        break;
      }
    }
  }

  return { pairings, byeIdx };
}
