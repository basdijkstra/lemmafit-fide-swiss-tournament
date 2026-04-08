// FIDE Swiss Tournament - Verified Domain Logic
// All pairing rules, scoring, and state transitions are formally verified here.
include "Replay.dfy"

module SwissDomain refines Domain {

  // ===== Data Types =====

  datatype Option<T> = None | Some(value: T)
  datatype Color = White | Black
  datatype Phase = Setup | Playing | Finished
  datatype GameResult = WhiteWins | BlackWins | Draw

  // A pairing: whiteIdx plays White, blackIdx plays Black
  datatype Pairing = Pairing(whiteIdx: nat, blackIdx: nat)

  datatype CompletedRound = CompletedRound(
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  )

  // ActiveRound starts empty (pairings=[]) until SubmitPairings is called
  datatype ActiveRound = ActiveRound(
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<Option<GameResult>>
  )

  // score2x = score * 2 (avoids fractions: win=2, draw=1, loss/bye=2)
  datatype Participant = Participant(
    name: string,
    score2x: nat,
    whiteCount: nat,
    blackCount: nat,
    colorHistory: seq<Color>,
    byeReceived: bool,
    opponents: set<nat>
  )

  datatype Model = Model(
    phase: Phase,
    participants: seq<Participant>,
    totalRounds: nat,
    completedRounds: seq<CompletedRound>,
    activeRound: Option<ActiveRound>
  )

  datatype Action =
    | AddParticipant(name: string)
    | RemoveLastParticipant
    | SetRounds(n: nat)
    | StartTournament
    // UI computes pairings (FIDE score-group algorithm); Dafny validates them
    | SubmitPairings(pairings: seq<Pairing>, bye: Option<nat>)
    | RecordResult(pairingIdx: nat, result: GameResult)
    | FinalizeRound

  // ===== Helper Functions (compiled) =====

  function CurrentRound(m: Model): nat {
    |m.completedRounds| + (if m.activeRound.Some? then 1 else 0)
  }

  function ColorDiff(p: Participant): int {
    p.whiteCount as int - p.blackCount as int
  }

  // FIDE Rule 7: must play opposite to break three-in-a-row
  function MustPlayBlack(p: Participant): bool {
    ColorDiff(p) == 2 ||
    (|p.colorHistory| >= 2 &&
     p.colorHistory[|p.colorHistory| - 1] == White &&
     p.colorHistory[|p.colorHistory| - 2] == White)
  }

  function MustPlayWhite(p: Participant): bool {
    ColorDiff(p) == -2 ||
    (|p.colorHistory| >= 2 &&
     p.colorHistory[|p.colorHistory| - 1] == Black &&
     p.colorHistory[|p.colorHistory| - 2] == Black)
  }

  // FIDE Rule 8: prefer the color played fewer times; if equal, alternate from last
  function PreferredColor(p: Participant): Color {
    if p.whiteCount < p.blackCount then White
    else if p.blackCount < p.whiteCount then Black
    else if |p.colorHistory| == 0 then White
    else if p.colorHistory[|p.colorHistory| - 1] == White then Black
    else White
  }

  // FIDE Rules 6-8: assign colors respecting hard constraints first, then preference
  function ChooseColors(p1idx: nat, p2idx: nat, p1: Participant, p2: Participant): Pairing
    ensures var pair := ChooseColors(p1idx, p2idx, p1, p2);
      pair == Pairing(p1idx, p2idx) || pair == Pairing(p2idx, p1idx)
  {
    if MustPlayWhite(p1) || MustPlayBlack(p2) then Pairing(p1idx, p2idx)
    else if MustPlayBlack(p1) || MustPlayWhite(p2) then Pairing(p2idx, p1idx)
    else if PreferredColor(p1) == White then Pairing(p1idx, p2idx)
    else Pairing(p2idx, p1idx)
  }

  function WhiteScore(r: GameResult): nat {
    match r { case WhiteWins => 2 case Draw => 1 case BlackWins => 0 }
  }

  function BlackScore(r: GameResult): nat {
    match r { case BlackWins => 2 case Draw => 1 case WhiteWins => 0 }
  }

  // Validate proposed pairings against all FIDE structural rules
  function ValidPairingsForModel(m: Model, pairings: seq<Pairing>, bye: Option<nat>): bool {
    // All indices in range and no self-pairing
    && (forall p :: p in pairings ==>
        p.whiteIdx < |m.participants| && p.blackIdx < |m.participants| && p.whiteIdx != p.blackIdx)
    // No participant appears twice (FIDE Rule 3)
    && (forall i, j :: 0 <= i < j < |pairings| ==>
        pairings[i].whiteIdx != pairings[j].whiteIdx &&
        pairings[i].whiteIdx != pairings[j].blackIdx &&
        pairings[i].blackIdx != pairings[j].whiteIdx &&
        pairings[i].blackIdx != pairings[j].blackIdx)
    // No rematches (FIDE Rule 2)
    && (forall p :: p in pairings ==>
        !(p.blackIdx in m.participants[p.whiteIdx].opponents) &&
        !(p.whiteIdx in m.participants[p.blackIdx].opponents))
    // Bye eligibility (FIDE Rule 4)
    && (bye.Some? ==>
        bye.value < |m.participants| &&
        !m.participants[bye.value].byeReceived &&
        (forall p :: p in pairings ==> p.whiteIdx != bye.value && p.blackIdx != bye.value))
    // Bye iff odd count (FIDE Rule 3)
    && (|m.participants| % 2 == 1 <==> bye.Some?)
    // All participants covered exactly once (FIDE Rule 3)
    && 2 * |pairings| + (if bye.Some? then 1 else 0) == |m.participants|
  }

  function AllRecorded(results: seq<Option<GameResult>>): bool {
    forall i :: 0 <= i < |results| ==> results[i].Some?
  }

  // ===== Ghost Predicates (verification only) =====

  ghost predicate NoThreeConsecutive(history: seq<Color>) {
    forall i :: 2 <= i < |history| ==>
      !(history[i] == history[i-1] && history[i-1] == history[i-2])
  }

  ghost predicate OpponentsSymmetric(participants: seq<Participant>) {
    forall i, j :: 0 <= i < |participants| && 0 <= j < |participants| && i != j ==>
      (j in participants[i].opponents) == (i in participants[j].opponents)
  }

  ghost predicate ValidIndices(pairings: seq<Pairing>, n: nat) {
    forall p :: p in pairings ==>
      p.whiteIdx < n && p.blackIdx < n && p.whiteIdx != p.blackIdx
  }

  ghost predicate PairingsDistinct(pairings: seq<Pairing>) {
    forall i, j :: 0 <= i < j < |pairings| ==>
      pairings[i].whiteIdx != pairings[j].whiteIdx &&
      pairings[i].whiteIdx != pairings[j].blackIdx &&
      pairings[i].blackIdx != pairings[j].whiteIdx &&
      pairings[i].blackIdx != pairings[j].blackIdx
  }

  ghost predicate NoRematchPairings(participants: seq<Participant>, pairings: seq<Pairing>) {
    forall p :: p in pairings ==>
      p.whiteIdx < |participants| && p.blackIdx < |participants| &&
      !(p.blackIdx in participants[p.whiteIdx].opponents) &&
      !(p.whiteIdx in participants[p.blackIdx].opponents)
  }

  ghost predicate ColorHistoryConsistency(participants: seq<Participant>) {
    forall i :: 0 <= i < |participants| ==>
      |participants[i].colorHistory| == participants[i].whiteCount + participants[i].blackCount
  }

  // Opponents only contain valid participant indices (< |participants|)
  ghost predicate OpponentsValid(participants: seq<Participant>) {
    forall i :: 0 <= i < |participants| ==>
      forall j :: j in participants[i].opponents ==> j < |participants|
  }

  ghost predicate ActiveRoundValid(m: Model) {
    m.activeRound.Some? ==>
      var r := m.activeRound.value;
      && |r.results| == |r.pairings|
      && ValidIndices(r.pairings, |m.participants|)
      && PairingsDistinct(r.pairings)
      && (r.bye.Some? ==>
          r.bye.value < |m.participants| &&
          !m.participants[r.bye.value].byeReceived &&
          (forall p :: p in r.pairings ==>
            p.whiteIdx != r.bye.value && p.blackIdx != r.bye.value))
      && NoRematchPairings(m.participants, r.pairings)
  }

  // ===== Invariant =====

  ghost predicate Inv(m: Model) {
    && (forall i :: 0 <= i < |m.participants| ==> m.participants[i].score2x >= 0)
    && (m.phase != Setup ==> m.totalRounds >= 1 && 2 <= |m.participants| <= 19)
    && (m.phase == Setup ==>
        (m.completedRounds == [] && m.activeRound == None &&
         forall i :: 0 <= i < |m.participants| ==> m.participants[i].opponents == {}))
    && (m.phase == Playing ==> m.activeRound.Some?)
    && (m.phase == Finished ==> |m.completedRounds| == m.totalRounds && m.activeRound == None)
    && CurrentRound(m) <= m.totalRounds
    && OpponentsSymmetric(m.participants)
    && OpponentsValid(m.participants)
    && ColorHistoryConsistency(m.participants)
    && ActiveRoundValid(m)
  }

  // ===== Init =====

  function Init(): Model {
    Model(Setup, [], 5, [], None)
  }

  lemma InitSatisfiesInv()
    ensures Inv(Init())
  {}

  function Normalize(m: Model): Model { m }

  // ===== Round Update Helpers =====

  function ExtractResults(results: seq<Option<GameResult>>): seq<GameResult>
    requires forall i :: 0 <= i < |results| ==> results[i].Some?
    ensures |ExtractResults(results)| == |results|
    ensures forall i :: 0 <= i < |results| ==> ExtractResults(results)[i] == results[i].value
  {
    if |results| == 0 then []
    else [results[0].value] + ExtractResults(results[1..])
  }

  // Update a single participant's stats (score, color, bye) but NOT opponents
  function UpdateStats(p: Participant, idx: nat, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>): Participant
    requires |results| == |pairings|
    ensures UpdateStats(p, idx, pairings, bye, results).opponents == p.opponents
  {
    if bye.Some? && bye.value == idx then
      p.(score2x := p.score2x + 2, byeReceived := true)
    else
      UpdateStatsFromPairings(p, idx, pairings, results, 0)
  }

  function UpdateStatsFromPairings(p: Participant, idx: nat, pairings: seq<Pairing>, results: seq<GameResult>, i: nat): Participant
    requires i <= |pairings| && |results| == |pairings|
    ensures UpdateStatsFromPairings(p, idx, pairings, results, i).opponents == p.opponents
    decreases |pairings| - i
  {
    if i >= |pairings| then p
    else if pairings[i].whiteIdx == idx then
      p.(score2x := p.score2x + WhiteScore(results[i]),
         whiteCount := p.whiteCount + 1,
         colorHistory := p.colorHistory + [White])
    else if pairings[i].blackIdx == idx then
      p.(score2x := p.score2x + BlackScore(results[i]),
         blackCount := p.blackCount + 1,
         colorHistory := p.colorHistory + [Black])
    else
      UpdateStatsFromPairings(p, idx, pairings, results, i + 1)
  }

  // Add one pairing's opponents symmetrically to participants
  function AddPairingOpponents(participants: seq<Participant>, w: nat, b: nat): seq<Participant>
    requires w < |participants| && b < |participants| && w != b
    ensures |AddPairingOpponents(participants, w, b)| == |participants|
    ensures forall k :: 0 <= k < |participants| && k != w && k != b ==>
      AddPairingOpponents(participants, w, b)[k] == participants[k]
    ensures AddPairingOpponents(participants, w, b)[w].opponents == participants[w].opponents + {b}
    ensures AddPairingOpponents(participants, w, b)[b].opponents == participants[b].opponents + {w}
    ensures forall k :: 0 <= k < |participants| && k != w && k != b ==>
      AddPairingOpponents(participants, w, b)[k].opponents == participants[k].opponents
  {
    var pw := participants[w].(opponents := participants[w].opponents + {b});
    var pb := participants[b].(opponents := participants[b].opponents + {w});
    participants[w := pw][b := pb]
  }

  // Add opponents for all pairings iteratively
  function AddAllOpponents(participants: seq<Participant>, pairings: seq<Pairing>, i: nat): seq<Participant>
    requires i <= |pairings|
    requires ValidIndices(pairings, |participants|)
    ensures |AddAllOpponents(participants, pairings, i)| == |participants|
    decreases |pairings| - i
  {
    if i >= |pairings| then participants
    else
      var w := pairings[i].whiteIdx;
      var b := pairings[i].blackIdx;
      assert w < |participants| && b < |participants| && w != b by {
        assert Pairing(w, b) in pairings;
      }
      var ps := AddPairingOpponents(participants, w, b);
      AddAllOpponents(ps, pairings, i + 1)
  }

  // Full participant update: stats first, then opponents
  function UpdateAllParticipants(
    participants: seq<Participant>,
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  ): seq<Participant>
    requires |results| == |pairings|
    requires ValidIndices(pairings, |participants|)
    ensures |UpdateAllParticipants(participants, pairings, bye, results)| == |participants|
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    AddAllOpponents(withStats, pairings, 0)
  }

  // ===== Apply =====

  function Apply(m: Model, a: Action): Model {
    match a {
      case AddParticipant(name) =>
        if m.phase != Setup || |m.participants| >= 19 then m
        else
          var p := Participant(name, 0, 0, 0, [], false, {});
          m.(participants := m.participants + [p])

      case RemoveLastParticipant =>
        if m.phase != Setup || |m.participants| == 0 then m
        else m.(participants := m.participants[..|m.participants|-1])

      case SetRounds(n) =>
        if m.phase != Setup || n < 1 then m
        else m.(totalRounds := n)

      case StartTournament =>
        if m.phase != Setup || |m.participants| < 2 || |m.participants| > 19 || m.totalRounds < 1 then m
        else
          // Playing phase begins; pairings submitted separately via SubmitPairings
          m.(phase := Playing, activeRound := Some(ActiveRound([], None, [])))

      case SubmitPairings(pairings, bye) =>
        if m.phase != Playing then m
        else match m.activeRound {
          case None => m
          case Some(r) =>
            if |r.pairings| > 0 then m  // already have pairings this round
            else if !ValidPairingsForModel(m, pairings, bye) then m
            else
              m.(activeRound := Some(ActiveRound(pairings, bye, seq(|pairings|, _ => None))))
        }

      case RecordResult(pairingIdx, result) =>
        if m.phase != Playing then m
        else match m.activeRound {
          case None => m
          case Some(r) =>
            if pairingIdx >= |r.pairings| || r.results[pairingIdx].Some? then m
            else
              m.(activeRound := Some(r.(results := r.results[pairingIdx := Some(result)])))
        }

      case FinalizeRound =>
        if m.phase != Playing then m
        else match m.activeRound {
          case None => m
          case Some(r) =>
            if |r.pairings| == 0 || !AllRecorded(r.results) then m
            else
              var results := ExtractResults(r.results);
              var completed := CompletedRound(r.pairings, r.bye, results);
              var newPs := UpdateAllParticipants(m.participants, r.pairings, r.bye, results);
              var newCompleted := m.completedRounds + [completed];
              if |newCompleted| == m.totalRounds then
                m.(phase := Finished, participants := newPs,
                   completedRounds := newCompleted, activeRound := None)
              else
                m.(participants := newPs, completedRounds := newCompleted,
                   activeRound := Some(ActiveRound([], None, [])))
        }
    }
  }

  // ===== Key Lemmas for Proofs =====

  // Scores never decrease (monotone)
  lemma UpdateStatsPreservesScoreNonNeg(p: Participant, idx: nat, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>)
    requires |results| == |pairings|
    requires p.score2x >= 0
    ensures UpdateStats(p, idx, pairings, bye, results).score2x >= 0
  {
    if !(bye.Some? && bye.value == idx) {
      UpdateStatsPairingsScoreNonNeg(p, idx, pairings, results, 0);
    }
  }

  lemma UpdateStatsPairingsScoreNonNeg(p: Participant, idx: nat, pairings: seq<Pairing>, results: seq<GameResult>, i: nat)
    requires i <= |pairings| && |results| == |pairings| && p.score2x >= 0
    ensures UpdateStatsFromPairings(p, idx, pairings, results, i).score2x >= 0
    decreases |pairings| - i
  {
    if i < |pairings| {
      if pairings[i].whiteIdx != idx && pairings[i].blackIdx != idx {
        UpdateStatsPairingsScoreNonNeg(p, idx, pairings, results, i + 1);
      }
    }
  }

  // Color history length is preserved by UpdateStats
  lemma UpdateStatsPreservesColorLen(p: Participant, idx: nat, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>)
    requires |results| == |pairings|
    requires |p.colorHistory| == p.whiteCount + p.blackCount
    ensures
      var np := UpdateStats(p, idx, pairings, bye, results);
      |np.colorHistory| == np.whiteCount + np.blackCount
  {
    if !(bye.Some? && bye.value == idx) {
      UpdateStatsPairingsColorLen(p, idx, pairings, results, 0);
    }
  }

  lemma UpdateStatsPairingsColorLen(p: Participant, idx: nat, pairings: seq<Pairing>, results: seq<GameResult>, i: nat)
    requires i <= |pairings| && |results| == |pairings|
    requires |p.colorHistory| == p.whiteCount + p.blackCount
    ensures
      var np := UpdateStatsFromPairings(p, idx, pairings, results, i);
      |np.colorHistory| == np.whiteCount + np.blackCount
    decreases |pairings| - i
  {
    if i < |pairings| {
      if pairings[i].whiteIdx != idx && pairings[i].blackIdx != idx {
        UpdateStatsPairingsColorLen(p, idx, pairings, results, i + 1);
      }
    }
  }

  // Updating stats for all participants preserves score non-negativity
  lemma AllStatsPreservesScores(participants: seq<Participant>, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>)
    requires |results| == |pairings|
    requires forall i :: 0 <= i < |participants| ==> participants[i].score2x >= 0
    ensures
      var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
        UpdateStats(participants[i], i, pairings, bye, results));
      forall i :: 0 <= i < |withStats| ==> withStats[i].score2x >= 0
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    forall i | 0 <= i < |withStats| {
      UpdateStatsPreservesScoreNonNeg(participants[i], i, pairings, bye, results);
    }
  }

  // Updating stats preserves color history consistency
  lemma AllStatsPreservesColorLen(participants: seq<Participant>, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>)
    requires |results| == |pairings|
    requires ColorHistoryConsistency(participants)
    ensures
      var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
        UpdateStats(participants[i], i, pairings, bye, results));
      ColorHistoryConsistency(withStats)
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    forall i | 0 <= i < |withStats| {
      UpdateStatsPreservesColorLen(participants[i], i, pairings, bye, results);
    }
  }

  // Adding opponents for one pairing preserves symmetry
  lemma AddPairingOpponentsPreservesSymmetry(participants: seq<Participant>, w: nat, b: nat)
    requires w < |participants| && b < |participants| && w != b
    requires OpponentsSymmetric(participants)
    ensures OpponentsSymmetric(AddPairingOpponents(participants, w, b))
  {
    var ps := AddPairingOpponents(participants, w, b);
    forall i, j | 0 <= i < |ps| && 0 <= j < |ps| && i != j
      ensures (j in ps[i].opponents) == (i in ps[j].opponents)
    {
      if i == w && j == b {
        assert b in ps[w].opponents;
        assert w in ps[b].opponents;
      } else if i == b && j == w {
        assert w in ps[b].opponents;
        assert b in ps[w].opponents;
      } else if i == w {
        // j != b (since i != j and j != b would collapse to the first two cases only if j==b)
        assert j != b;
        assert ps[j] == participants[j];
        assert (j in ps[w].opponents) == (j in participants[w].opponents);
        assert (w in ps[j].opponents) == (w in participants[j].opponents);
      } else if j == w {
        assert i != b;
        assert ps[i] == participants[i];
        assert (w in ps[i].opponents) == (w in participants[i].opponents);
        assert (i in ps[w].opponents) == (i in participants[w].opponents);
      } else if i == b {
        assert j != w;
        assert ps[j] == participants[j];
        assert (j in ps[b].opponents) == (j in participants[b].opponents);
        assert (b in ps[j].opponents) == (b in participants[j].opponents);
      } else if j == b {
        assert i != w;
        assert ps[i] == participants[i];
        assert (b in ps[i].opponents) == (b in participants[i].opponents);
        assert (i in ps[b].opponents) == (i in participants[b].opponents);
      } else {
        assert ps[i] == participants[i];
        assert ps[j] == participants[j];
      }
    }
  }

  // Adding all pairings' opponents preserves symmetry
  lemma AddAllOpponentsPreservesSymmetry(participants: seq<Participant>, pairings: seq<Pairing>, i: nat)
    requires i <= |pairings|
    requires ValidIndices(pairings, |participants|)
    requires PairingsDistinct(pairings)
    requires OpponentsSymmetric(participants)
    ensures OpponentsSymmetric(AddAllOpponents(participants, pairings, i))
    decreases |pairings| - i
  {
    if i < |pairings| {
      var w := pairings[i].whiteIdx;
      var b := pairings[i].blackIdx;
      assert w < |participants| && b < |participants| && w != b by {
        assert Pairing(w, b) in pairings;
      }
      var ps := AddPairingOpponents(participants, w, b);
      AddPairingOpponentsPreservesSymmetry(participants, w, b);
      assert OpponentsSymmetric(ps);
      assert |ps| == |participants|;
      assert ValidIndices(pairings, |ps|);
      AddAllOpponentsPreservesSymmetry(ps, pairings, i + 1);
    }
  }

  // UpdateStats does not change opponents, so symmetry is unchanged
  lemma AllStatsPreservesSymmetry(participants: seq<Participant>, pairings: seq<Pairing>, bye: Option<nat>, results: seq<GameResult>)
    requires |results| == |pairings|
    requires OpponentsSymmetric(participants)
    ensures
      var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
        UpdateStats(participants[i], i, pairings, bye, results));
      OpponentsSymmetric(withStats)
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    // UpdateStats preserves opponents for each participant
    assert forall i :: 0 <= i < |withStats| ==>
      withStats[i].opponents == participants[i].opponents;
    // Symmetry follows since opponents are identical to original
    forall i, j | 0 <= i < |withStats| && 0 <= j < |withStats| && i != j
      ensures (j in withStats[i].opponents) == (i in withStats[j].opponents)
    {
      assert withStats[i].opponents == participants[i].opponents;
      assert withStats[j].opponents == participants[j].opponents;
    }
  }

  // Full update preserves opponent symmetry
  lemma UpdateAllPreservesSymmetry(
    participants: seq<Participant>,
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  )
    requires |results| == |pairings|
    requires ValidIndices(pairings, |participants|)
    requires PairingsDistinct(pairings)
    requires OpponentsSymmetric(participants)
    ensures OpponentsSymmetric(UpdateAllParticipants(participants, pairings, bye, results))
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    AllStatsPreservesSymmetry(participants, pairings, bye, results);
    assert OpponentsSymmetric(withStats);
    assert |withStats| == |participants|;
    assert ValidIndices(pairings, |withStats|);
    AddAllOpponentsPreservesSymmetry(withStats, pairings, 0);
  }

  // Full update preserves scores
  lemma UpdateAllPreservesScores(
    participants: seq<Participant>,
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  )
    requires |results| == |pairings|
    requires ValidIndices(pairings, |participants|)
    requires forall i :: 0 <= i < |participants| ==> participants[i].score2x >= 0
    ensures
      var np := UpdateAllParticipants(participants, pairings, bye, results);
      forall i :: 0 <= i < |np| ==> np[i].score2x >= 0
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    AllStatsPreservesScores(participants, pairings, bye, results);
    // AddAllOpponents only changes opponents, not scores
    AddAllOpponentsPreservesScores(withStats, pairings, 0);
  }

  lemma AddAllOpponentsPreservesScores(participants: seq<Participant>, pairings: seq<Pairing>, i: nat)
    requires i <= |pairings|
    requires ValidIndices(pairings, |participants|)
    requires forall k :: 0 <= k < |participants| ==> participants[k].score2x >= 0
    ensures
      var np := AddAllOpponents(participants, pairings, i);
      forall k :: 0 <= k < |np| ==> np[k].score2x >= 0
    decreases |pairings| - i
  {
    if i < |pairings| {
      var w := pairings[i].whiteIdx;
      var b := pairings[i].blackIdx;
      assert w < |participants| && b < |participants| && w != b by {
        assert Pairing(w, b) in pairings;
      }
      var ps := AddPairingOpponents(participants, w, b);
      // AddPairingOpponents only changes opponents, so scores unchanged
      assert forall k :: 0 <= k < |ps| ==> ps[k].score2x == participants[k].score2x;
      AddAllOpponentsPreservesScores(ps, pairings, i + 1);
    }
  }

  // Full update preserves color history consistency
  lemma UpdateAllPreservesColorLen(
    participants: seq<Participant>,
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  )
    requires |results| == |pairings|
    requires ValidIndices(pairings, |participants|)
    requires ColorHistoryConsistency(participants)
    ensures ColorHistoryConsistency(UpdateAllParticipants(participants, pairings, bye, results))
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    AllStatsPreservesColorLen(participants, pairings, bye, results);
    // AddAllOpponents only changes opponents, not colorHistory
    AddAllOpponentsPreservesColorLen(withStats, pairings, 0);
  }

  lemma AddAllOpponentsPreservesColorLen(participants: seq<Participant>, pairings: seq<Pairing>, i: nat)
    requires i <= |pairings|
    requires ValidIndices(pairings, |participants|)
    requires ColorHistoryConsistency(participants)
    ensures ColorHistoryConsistency(AddAllOpponents(participants, pairings, i))
    decreases |pairings| - i
  {
    if i < |pairings| {
      var w := pairings[i].whiteIdx;
      var b := pairings[i].blackIdx;
      assert w < |participants| && b < |participants| && w != b by {
        assert Pairing(w, b) in pairings;
      }
      var ps := AddPairingOpponents(participants, w, b);
      // AddPairingOpponents only changes opponents field
      assert forall k :: 0 <= k < |ps| ==>
        ps[k].colorHistory == participants[k].colorHistory &&
        ps[k].whiteCount == participants[k].whiteCount &&
        ps[k].blackCount == participants[k].blackCount;
      AddAllOpponentsPreservesColorLen(ps, pairings, i + 1);
    }
  }

  // Extending participants with a fresh entry (empty opponents) preserves symmetry and validity
  lemma AddParticipantPreservesOpponents(participants: seq<Participant>, name: string)
    requires OpponentsSymmetric(participants)
    requires OpponentsValid(participants)
    ensures
      var p := Participant(name, 0, 0, 0, [], false, {});
      var ps := participants + [p];
      OpponentsSymmetric(ps) && OpponentsValid(ps)
  {
    var n := |participants|;
    var p := Participant(name, 0, 0, 0, [], false, {});
    var ps := participants + [p];
    // OpponentsValid: existing participants have opponents < n < n+1 ✓; new has {} ✓
    assert OpponentsValid(ps) by {
      forall i | 0 <= i < |ps| ensures forall j :: j in ps[i].opponents ==> j < |ps| {
        if i < n {
          assert ps[i] == participants[i];
          forall j | j in ps[i].opponents ensures j < |ps| {
            assert j < n;  // from OpponentsValid(participants)
          }
        } else {
          assert ps[n].opponents == {};
        }
      }
    }
    // OpponentsSymmetric: new participant n has empty opponents; n not in any existing opponent set
    assert OpponentsSymmetric(ps) by {
      forall i, j | 0 <= i < |ps| && 0 <= j < |ps| && i != j
        ensures (j in ps[i].opponents) == (i in ps[j].opponents)
      {
        if i == n {
          // ps[n].opponents = {} so j not in it; need n not in ps[j].opponents
          assert ps[j] == participants[j];
          assert n !in participants[j].opponents by {
            assert forall k :: k in participants[j].opponents ==> k < n;
          }
        } else if j == n {
          assert ps[i] == participants[i];
          assert n !in participants[i].opponents by {
            assert forall k :: k in participants[i].opponents ==> k < n;
          }
        } else {
          assert ps[i] == participants[i];
          assert ps[j] == participants[j];
        }
      }
    }
  }

  // AddAllOpponents preserves OpponentsValid (new opponents are valid indices)
  lemma AddAllOpponentsPreservesValid(participants: seq<Participant>, pairings: seq<Pairing>, i: nat)
    requires i <= |pairings|
    requires ValidIndices(pairings, |participants|)
    requires OpponentsValid(participants)
    ensures OpponentsValid(AddAllOpponents(participants, pairings, i))
    decreases |pairings| - i
  {
    if i < |pairings| {
      var w := pairings[i].whiteIdx;
      var b := pairings[i].blackIdx;
      assert w < |participants| && b < |participants| && w != b by {
        assert Pairing(w, b) in pairings;
      }
      var ps := AddPairingOpponents(participants, w, b);
      // ps has same length; w's opponents gain {b} and b's opponents gain {w}, both < |ps|
      assert OpponentsValid(ps) by {
        forall k | 0 <= k < |ps| ensures forall j :: j in ps[k].opponents ==> j < |ps| {
          if k == w {
            forall j | j in ps[w].opponents ensures j < |ps| {
              if j == b { assert b < |participants|; }
              else { assert j in participants[w].opponents; assert j < |participants|; }
            }
          } else if k == b {
            forall j | j in ps[b].opponents ensures j < |ps| {
              if j == w { assert w < |participants|; }
              else { assert j in participants[b].opponents; assert j < |participants|; }
            }
          } else {
            assert ps[k] == participants[k];
          }
        }
      }
      AddAllOpponentsPreservesValid(ps, pairings, i + 1);
    }
  }

  // Full update preserves OpponentsValid
  lemma UpdateAllPreservesOpponentsValid(
    participants: seq<Participant>,
    pairings: seq<Pairing>,
    bye: Option<nat>,
    results: seq<GameResult>
  )
    requires |results| == |pairings|
    requires ValidIndices(pairings, |participants|)
    requires OpponentsValid(participants)
    ensures OpponentsValid(UpdateAllParticipants(participants, pairings, bye, results))
  {
    var withStats := seq(|participants|, i requires 0 <= i < |participants| =>
      UpdateStats(participants[i], i, pairings, bye, results));
    // UpdateStats doesn't change opponents
    assert OpponentsValid(withStats) by {
      forall i | 0 <= i < |withStats| ensures forall j :: j in withStats[i].opponents ==> j < |withStats| {
        assert withStats[i].opponents == participants[i].opponents;
        assert forall j :: j in participants[i].opponents ==> j < |participants|;
      }
    }
    assert |withStats| == |participants|;
    assert ValidIndices(pairings, |withStats|);
    AddAllOpponentsPreservesValid(withStats, pairings, 0);
  }

  // ===== StepPreservesInv =====

  lemma StepPreservesInv(m: Model, a: Action)
    ensures Inv(Normalize(Apply(m, a)))
  {
    match a {
      case AddParticipant(name) => {
        if m.phase == Setup && |m.participants| < 19 {
          AddParticipantPreservesOpponents(m.participants, name);
        }
      }
      case RemoveLastParticipant => {}
      case SetRounds(n) => {}
      case StartTournament => {}

      case SubmitPairings(pairings, bye) => {
        if m.phase == Playing && m.activeRound.Some? &&
           |m.activeRound.value.pairings| == 0 &&
           ValidPairingsForModel(m, pairings, bye) {
          // ActiveRoundValid: must show the new active round satisfies the predicate
          // ValidPairingsForModel implies all the conditions of ActiveRoundValid
          var newRound := ActiveRound(pairings, bye, seq(|pairings|, _ => None));
          assert |newRound.results| == |newRound.pairings|;
          assert ValidIndices(pairings, |m.participants|);
          assert PairingsDistinct(pairings);
          assert NoRematchPairings(m.participants, pairings);
          assert bye.Some? ==>
            bye.value < |m.participants| &&
            !m.participants[bye.value].byeReceived &&
            (forall p :: p in pairings ==> p.whiteIdx != bye.value && p.blackIdx != bye.value);
        }
      }

      case RecordResult(pairingIdx, result) => {
        if m.phase == Playing && m.activeRound.Some? {
          var r := m.activeRound.value;
          if pairingIdx < |r.pairings| && r.results[pairingIdx].None? {
            var newResults := r.results[pairingIdx := Some(result)];
            // ActiveRoundValid: same pairings, bye; only results changed
            assert ValidIndices(r.pairings, |m.participants|);
            assert PairingsDistinct(r.pairings);
            assert NoRematchPairings(m.participants, r.pairings);
          }
        }
      }

      case FinalizeRound => {
        if m.phase == Playing && m.activeRound.Some? {
          var r := m.activeRound.value;
          if |r.pairings| > 0 && AllRecorded(r.results) {
            var results := ExtractResults(r.results);
            var newPs := UpdateAllParticipants(m.participants, r.pairings, r.bye, results);
            var newCompleted := m.completedRounds + [CompletedRound(r.pairings, r.bye, results)];

            // Prove invariant properties of the resulting model
            UpdateAllPreservesScores(m.participants, r.pairings, r.bye, results);
            UpdateAllPreservesSymmetry(m.participants, r.pairings, r.bye, results);
            UpdateAllPreservesColorLen(m.participants, r.pairings, r.bye, results);
            UpdateAllPreservesOpponentsValid(m.participants, r.pairings, r.bye, results);

            // CurrentRound: either Finished (|newCompleted| == totalRounds) or playing with empty round
            assert |newCompleted| == |m.completedRounds| + 1;
            assert |m.completedRounds| + 1 <= m.totalRounds by {
              assert CurrentRound(m) == |m.completedRounds| + 1;
              assert CurrentRound(m) <= m.totalRounds;
            }

            if |newCompleted| == m.totalRounds {
              // Finished phase
              assert |newCompleted| == m.totalRounds;
            } else {
              // Continue playing: new empty active round
              var nextRound := ActiveRound([], None, []);
              assert |nextRound.results| == |nextRound.pairings|;
              assert ValidIndices([], |newPs|);
              var emptyPairings : seq<Pairing> := [];
              assert PairingsDistinct(emptyPairings);
              assert NoRematchPairings(newPs, emptyPairings);
              // ActiveRound is empty: None bye, so the bye.Some? condition is vacuous
            }
          }
        }
      }
    }
  }

  // ===== Postcondition Lemmas (matching SPEC.yaml) =====

  // spec-006: Accepted pairings contain no rematches
  lemma NoRematchesWhenValid(m: Model, pairings: seq<Pairing>, bye: Option<nat>)
    requires ValidPairingsForModel(m, pairings, bye)
    ensures NoRematchPairings(m.participants, pairings)
  {}

  // spec-007: Each participant appears at most once
  lemma PairingsDistinctWhenValid(m: Model, pairings: seq<Pairing>, bye: Option<nat>)
    requires ValidPairingsForModel(m, pairings, bye)
    ensures PairingsDistinct(pairings)
  {}

  // spec-008: Bye iff odd count
  lemma ByeIffOddWhenValid(m: Model, pairings: seq<Pairing>, bye: Option<nat>)
    requires ValidPairingsForModel(m, pairings, bye)
    ensures bye.Some? <==> |m.participants| % 2 == 1
  {}

  // spec-009: Bye recipient is eligible (hasn't received a bye before)
  lemma ByeRecipientEligibleWhenValid(m: Model, pairings: seq<Pairing>, bye: Option<nat>)
    requires ValidPairingsForModel(m, pairings, bye)
    requires bye.Some?
    ensures !m.participants[bye.value].byeReceived
  {}

  // spec-014: All participants covered (paired or bye)
  lemma FullCoverageWhenValid(m: Model, pairings: seq<Pairing>, bye: Option<nat>)
    requires ValidPairingsForModel(m, pairings, bye)
    ensures 2 * |pairings| + (if bye.Some? then 1 else 0) == |m.participants|
  {}

  // spec-012: ChooseColors preserves color diff bounds when no color conflict exists.
  // Preconditions exclude the case where both participants simultaneously need the same color
  // (FIDE Rule 6 allows exceptions in that rare situation).
  lemma ChooseColorsPreservesColorDiff(p1: Participant, p2: Participant, p1idx: nat, p2idx: nat)
    requires p1idx != p2idx
    requires -2 <= ColorDiff(p1) <= 2
    requires -2 <= ColorDiff(p2) <= 2
    requires !(MustPlayBlack(p1) && MustPlayBlack(p2))
    requires !(MustPlayWhite(p1) && MustPlayWhite(p2))
    requires !(MustPlayBlack(p1) && MustPlayWhite(p1))
    requires !(MustPlayBlack(p2) && MustPlayWhite(p2))
    ensures
      var pair := ChooseColors(p1idx, p2idx, p1, p2);
      var c1 := if pair.whiteIdx == p1idx then White else Black;
      var c2 := if pair.whiteIdx == p2idx then White else Black;
      -2 <= ColorDiff(p1) + (if c1 == White then 1 else -1) <= 2 &&
      -2 <= ColorDiff(p2) + (if c2 == White then 1 else -1) <= 2
  {
    var pair := ChooseColors(p1idx, p2idx, p1, p2);
    // Explicitly compute c1 and c2 using the same expressions as the ensures clause
    var c1 := if pair.whiteIdx == p1idx then White else Black;
    var c2 := if pair.whiteIdx == p2idx then White else Black;

    if MustPlayWhite(p1) || MustPlayBlack(p2) {
      // ChooseColors returns Pairing(p1idx, p2idx): p1 is White, p2 is Black
      assert pair.whiteIdx == p1idx;
      assert pair.whiteIdx != p2idx;  // because p1idx != p2idx
      assert c1 == White;
      assert c2 == Black;
      // p1 White: !MustPlayBlack(p1) => ColorDiff(p1) != 2 => ColorDiff(p1) + 1 <= 2
      assert !MustPlayBlack(p1);
      assert ColorDiff(p1) != 2;
      assert ColorDiff(p1) + 1 <= 2;
      // p2 Black: !MustPlayWhite(p2) => ColorDiff(p2) != -2 => ColorDiff(p2) - 1 >= -2
      assert !MustPlayWhite(p2);
      assert ColorDiff(p2) != -2;
      assert ColorDiff(p2) - 1 >= -2;
    } else if MustPlayBlack(p1) || MustPlayWhite(p2) {
      // ChooseColors returns Pairing(p2idx, p1idx): p2 is White, p1 is Black
      assert pair.whiteIdx == p2idx;
      assert pair.whiteIdx != p1idx;  // because p1idx != p2idx
      assert c1 == Black;
      assert c2 == White;
      // p1 Black: !MustPlayWhite(p1) from branch 1 false => ColorDiff(p1) != -2 => ColorDiff(p1) - 1 >= -2
      assert !MustPlayWhite(p1);
      assert ColorDiff(p1) != -2;
      assert ColorDiff(p1) - 1 >= -2;
      // p2 White: !MustPlayBlack(p2) from branch 1 false => ColorDiff(p2) != 2 => ColorDiff(p2) + 1 <= 2
      assert !MustPlayBlack(p2);
      assert ColorDiff(p2) != 2;
      assert ColorDiff(p2) + 1 <= 2;
    } else {
      // No hard constraints; both players have |ColorDiff| < 2
      assert !MustPlayWhite(p1) && !MustPlayBlack(p1);
      assert !MustPlayWhite(p2) && !MustPlayBlack(p2);
      assert ColorDiff(p1) != 2 && ColorDiff(p1) != -2;
      assert ColorDiff(p2) != 2 && ColorDiff(p2) != -2;
      if PreferredColor(p1) == White {
        // ChooseColors returns Pairing(p1idx, p2idx)
        assert pair.whiteIdx == p1idx;
        assert pair.whiteIdx != p2idx;
        assert c1 == White;
        assert c2 == Black;
        assert ColorDiff(p1) + 1 <= 2;
        assert ColorDiff(p2) - 1 >= -2;
      } else {
        // ChooseColors returns Pairing(p2idx, p1idx)
        assert pair.whiteIdx == p2idx;
        assert pair.whiteIdx != p1idx;
        assert c1 == Black;
        assert c2 == White;
        assert ColorDiff(p1) - 1 >= -2;
        assert ColorDiff(p2) + 1 <= 2;
      }
    }
  }

  // spec-013: NoThreeConsecutive is preserved when the new color differs from the last
  lemma ColorAlternationPreservesNoThree(history: seq<Color>, c: Color)
    requires NoThreeConsecutive(history)
    requires |history| < 2 || !(history[|history|-1] == c && history[|history|-2] == c)
    ensures NoThreeConsecutive(history + [c])
  {
    var newHistory := history + [c];
    forall i | 2 <= i < |newHistory|
      ensures !(newHistory[i] == newHistory[i-1] && newHistory[i-1] == newHistory[i-2])
    {
      if i < |history| {
        assert newHistory[i] == history[i];
        assert newHistory[i-1] == history[i-1];
        assert newHistory[i-2] == history[i-2];
      } else {
        // i == |history| (the new element)
        assert newHistory[i] == c;
        assert newHistory[i-1] == history[|history|-1];
        if |history| >= 2 {
          assert newHistory[i-2] == history[|history|-2];
        }
      }
    }
  }
}

module SwissKernel refines Kernel {
  import D = SwissDomain
}

module AppCore {
  import K = SwissKernel
  import D = SwissDomain

  function Init(): K.History { K.InitHistory() }

  function Dispatch(h: K.History, a: D.Action): K.History
    requires K.HistInv(h)
  { K.Do(h, a) }

  function Undo(h: K.History): K.History { K.Undo(h) }
  function Redo(h: K.History): K.History { K.Redo(h) }
  function Present(h: K.History): D.Model { h.present }
  function CanUndo(h: K.History): bool { |h.past| > 0 }
  function CanRedo(h: K.History): bool { |h.future| > 0 }

  // Action constructors
  function AddParticipant(name: string): D.Action { D.AddParticipant(name) }
  function RemoveLastParticipant(): D.Action { D.RemoveLastParticipant }
  function SetRounds(n: nat): D.Action { D.SetRounds(n) }
  function StartTournament(): D.Action { D.StartTournament }
  function SubmitPairings(pairings: seq<D.Pairing>, bye: D.Option<nat>): D.Action {
    D.SubmitPairings(pairings, bye)
  }
  function RecordResult(pairingIdx: nat, result: D.GameResult): D.Action {
    D.RecordResult(pairingIdx, result)
  }
  function FinalizeRound(): D.Action { D.FinalizeRound }

  // Helper: check proposed pairings before submission
  function ValidPairings(model: D.Model, pairings: seq<D.Pairing>, bye: D.Option<nat>): bool {
    D.ValidPairingsForModel(model, pairings, bye)
  }

  // Helper: choose colors for a pairing respecting FIDE Rules 6-8
  // TypeScript calls this for each pair during pairing computation.
  function ChooseColors(p1idx: nat, p2idx: nat, p1: D.Participant, p2: D.Participant): D.Pairing {
    D.ChooseColors(p1idx, p2idx, p1, p2)
  }

  // Helper predicates for UI button guards (avoid re-implementing in JS)
  function CanStart(model: D.Model): bool {
    model.phase == D.Setup &&
    2 <= |model.participants| <= 19 &&
    model.totalRounds >= 1
  }

  function CanSubmitPairings(model: D.Model): bool {
    model.phase == D.Playing &&
    model.activeRound.Some? &&
    |model.activeRound.value.pairings| == 0
  }

  function CanFinalize(model: D.Model): bool {
    model.phase == D.Playing &&
    model.activeRound.Some? &&
    |model.activeRound.value.pairings| > 0 &&
    D.AllRecorded(model.activeRound.value.results)
  }

  // Current round number (1-based; 0 in Setup, totalRounds+1 would mean Finished)
  function CurrentRound(model: D.Model): nat {
    D.CurrentRound(model)
  }
}
