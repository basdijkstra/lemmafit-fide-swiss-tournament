# Guarantees Report

Generated: 2026-04-09

## Coverage

- **14/14** verifiable spec entries covered
- **0 gaps**
- **0 axioms** (zero trust surface)
- **4 trusted entries** (presentation/runtime, not verifiable in Dafny)

## Claimcheck Results

| Requirement | Lemma | Status |
|------------|-------|--------|
| Participant count is between 2 and 19 when tournament is active or finished | `Guarantee_ParticipantCount` | Confirmed |
| Total rounds is at least 1 when tournament is active or finished | `Guarantee_TotalRoundsMin` | Confirmed |
| Current round count never exceeds total rounds | `Guarantee_CurrentRoundBound` | Confirmed |
| Participants have non-negative scores at all times | `Guarantee_ScoresNonNegative` | Confirmed |
| Opponent tracking is symmetric across all participants (FIDE Rule 2 foundation) | `Guarantee_OpponentsSymmetric` | Confirmed |
| Accepted round pairings contain no rematches between participants (FIDE Rule 2) | `NoRematchesWhenValid` | Confirmed |
| Each participant appears at most once in accepted round pairings (FIDE Rule 3) | `Guarantee_ParticipantAppearsOnce` | Confirmed |
| A bye is present when and only when the participant count is odd (FIDE Rule 3) | `ByeIffOddWhenValid` | Confirmed |
| Accepted bye recipient has not previously received a pairing-allocated bye (FIDE Rule 4) | `ByeRecipientEligibleWhenValid` | Confirmed |
| Active round always has structurally valid pairings and valid participant indices | `Guarantee_ActiveRoundValid` | Confirmed |
| Color history length equals total games played as white plus black for every participant | `Guarantee_ColorHistoryConsistency` | Confirmed |
| Color difference for every participant stays within minus 2 to 2 (FIDE Rule 6) | `ChooseColorsPreservesColorDiff` | Confirmed |
| No participant receives the same color three times consecutively (FIDE Rule 7) | `ColorAlternationPreservesNoThree` | Confirmed |
| All accepted pairings cover every participant exactly once (bye or paired) | `Guarantee_FullCoverage` | Confirmed |

## Proven Guarantees

### Tournament Setup (spec-001 to spec-003)
- Participant count is between 2 and 19 when tournament is active or finished — `Guarantee_ParticipantCount`
- Total rounds is at least 1 when tournament is active or finished — `Guarantee_TotalRoundsMin`
- Current round count never exceeds total rounds — `Guarantee_CurrentRoundBound`

### Scoring (spec-004)
- Participants have non-negative scores at all times — `Guarantee_ScoresNonNegative`

### Pairing Rules (spec-005 to spec-014)
- Opponent tracking is symmetric across all participants (FIDE Rule 2 foundation) — `Guarantee_OpponentsSymmetric`
- Accepted round pairings contain no rematches between participants (FIDE Rule 2) — `NoRematchesWhenValid`
- Each participant appears at most once in accepted round pairings (FIDE Rule 3) — `Guarantee_ParticipantAppearsOnce`
- A bye is present when and only when the participant count is odd (FIDE Rule 3) — `ByeIffOddWhenValid`
- Accepted bye recipient has not previously received a pairing-allocated bye (FIDE Rule 4) — `ByeRecipientEligibleWhenValid`
- Active round always has structurally valid pairings and valid participant indices — `Guarantee_ActiveRoundValid`
- Color history length equals total games played as white plus black for every participant — `Guarantee_ColorHistoryConsistency`
- Color difference for every participant stays within minus 2 to 2 (FIDE Rule 6) — `ChooseColorsPreservesColorDiff`
- No participant receives the same color three times consecutively (FIDE Rule 7) — `ColorAlternationPreservesNoThree`
- All accepted pairings cover every participant exactly once (bye or paired) — `Guarantee_FullCoverage`

## Trust Surface

**Axioms: 0** — All properties are fully proven.

**Trusted entries** (not verifiable in Dafny):
- spec-015: Tournament setup screen allows entering participant names and number of rounds
- spec-016: Pairings view shows White vs Black participant names for each game in the active round
- spec-017: User can record game results as White wins, Black wins, or Draw for each pairing
- spec-018: Standings table displays all participants sorted by score descending after each round
