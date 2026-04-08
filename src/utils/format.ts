// Display helpers — no business logic here

export function formatScore(score2x: number): string {
  const whole = Math.floor(score2x / 2);
  const half = score2x % 2 === 1;
  return half ? `${whole}.5` : `${whole}`;
}

export function formatRound(current: number, total: number): string {
  return `Round ${current} of ${total}`;
}
