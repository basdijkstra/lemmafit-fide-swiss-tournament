import { useState } from 'react';
import BigNumber from 'bignumber.js';
import App, {
  type GameResult,
  type Pairing,
  type Phase,
  type Participant,
  type CompletedRound,
  type ActiveRound,
  type Option,
} from '../dafny/app';
import { computePairings } from '../utils/pairingAlgorithm';

export interface TournamentDisplay {
  phase: Phase;
  participants: Participant[];
  totalRounds: number;
  completedRounds: CompletedRound[];
  activeRound: Option<ActiveRound>;
  currentRound: number;
  canUndo: boolean;
  canRedo: boolean;
  canStart: boolean;
  canSubmitPairings: boolean;
  canFinalize: boolean;
}

export function useTournament() {
  const [history, setHistory] = useState(() => App.Init());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = App.Present(history) as any;

  const display: TournamentDisplay = {
    phase: App.GetPhase(model),
    participants: App.GetParticipants(model),
    totalRounds: App.GetTotalRounds(model),
    completedRounds: App.GetCompletedRounds(model),
    activeRound: App.GetActiveRound(model),
    currentRound: App.CurrentRound(model),
    canUndo: App.CanUndo(history),
    canRedo: App.CanRedo(history),
    canStart: App.CanStart(model),
    canSubmitPairings: App.CanSubmitPairings(model),
    canFinalize: App.CanFinalize(model),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = (action: any) =>
    setHistory(h => App.Dispatch(h, action));

  const addParticipant = (name: string) =>
    dispatch(App.AddParticipant(name));

  const removeLastParticipant = () =>
    dispatch(App.RemoveLastParticipant());

  const setRounds = (n: number) =>
    dispatch(App.SetRounds(n));

  const startTournament = () =>
    dispatch(App.StartTournament());

  const finalizeRound = () =>
    dispatch(App.FinalizeRound());

  const undo = () => setHistory(h => App.Undo(h));
  const redo = () => setHistory(h => App.Redo(h));

  const recordResult = (pairingIdx: number, result: GameResult) => {
    const dafnyResult =
      result === 'WhiteWins' ? App.WhiteWins() :
      result === 'BlackWins' ? App.BlackWins() :
      App.Draw();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(App.RecordResult(pairingIdx, dafnyResult as any));
  };

  const generateAndSubmitPairings = () => {
    const participants = display.participants;
    const { pairings, byeIdx } = computePairings(participants);

    // Delegate color assignment to Dafny's verified ChooseColors (FIDE Rules 6-8)
    const coloredPairings: Pairing[] = pairings.map(([p1idx, p2idx]) => {
      const dafnyPair = App.ChooseColors(
        p1idx, p2idx,
        model.dtor_participants[p1idx],
        model.dtor_participants[p2idx],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return App.pairingToJson(dafnyPair as any);
    });

    const byeDafny = byeIdx !== null
      ? App.Some(new BigNumber(byeIdx))
      : App.None();

    // Dafny validates all structural FIDE rules before accepting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (App.ValidPairings(model, coloredPairings, byeDafny as any)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setHistory(h => App.Dispatch(h, App.SubmitPairings(coloredPairings, byeDafny as any)));
    }
  };

  return {
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
  };
}
