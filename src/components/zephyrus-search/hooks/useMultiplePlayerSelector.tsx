import {MultiplePlayerSelector} from '../components';
import {usePlayerSelector} from './usePlayerSelector';
import type {SelectorHookProps} from '../types';

export function useMultiplePlayerSelector({playerList, identifier}: SelectorHookProps) {
  const {
    player,
    PlayerSelector,
  } = usePlayerSelector({playerList, identifier: 'player'});
  const {
    player: opponent,
    PlayerSelector: OpponentSelector,
  } = usePlayerSelector({playerList, identifier: 'opponent'});

  const multiplePlayerSelectorComponent = () => (
    <MultiplePlayerSelector identifier={identifier}>
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
