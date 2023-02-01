import {MultiplePlayerSelector} from '../components';
import {usePlayerSelector} from './usePlayerSelector';
import type {SelectorHookProps} from '../types';

export function useMultiplePlayerSelector({playerList}: SelectorHookProps) {
  const {player, PlayerSelector} = usePlayerSelector({playerList});
  const {player: opponent, PlayerSelector: OpponentSelector} = usePlayerSelector({playerList});

  const multiplePlayerSelectorComponent = () => (
    <MultiplePlayerSelector>
      <PlayerSelector />
      <OpponentSelector />
    </MultiplePlayerSelector>
  );

  return {
    player,
    opponent,
    MultiplePlayerSelector: multiplePlayerSelectorComponent,
  };
}
