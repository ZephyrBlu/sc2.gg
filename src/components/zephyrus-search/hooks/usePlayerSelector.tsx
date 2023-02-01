import {useEffect, useState} from 'react';
import {PlayerSelector} from '../components/PlayerSelector';
import type {SelectorHookProps, Player} from '../types';

export function usePlayerSelector({playerList, identifier}: SelectorHookProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Player[] | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const searchPlayerList = (prefix: string) => (
    playerList.filter(player => player.name.startsWith(prefix))
  );

  useEffect(() => {
    if (!searchInput) {
      return;
    }

    const results = searchPlayerList(searchInput);
    setSearchResults(results);
  }, [searchInput]);

  const onPlayerSelection = (player: Player) => {
    setSelectedPlayer(player);
    setSearchInput('');
    setSearchResults(null);
  };

  const playerSelectorComponent = () => (
    <PlayerSelector identifier={identifier}>
      <div className="PlayerSelector__player">
        {selectedPlayer
          ? <Player name={selectedPlayer.name} iconPath={selectedPlayer.iconPath} />
          : (
            <input
              type="search"
              className="PlayerSelector__search-input"
              aria-label="search"
              value={searchInput}
              onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
            />
          )}
      </div>
      {!selectedPlayer && searchResults &&
        <div className="PlayerSelector__search-results">
          {searchResults.map(({name, iconPath}) => (
            <span
              role="button"
              className="PlayerSelector__search-result"
              onClick={() => onPlayerSelection({name, iconPath})}
            >
              <Player name={name} iconPath={iconPath} />
            </span>
          ))}
        </div>}
    </PlayerSelector>
  );

  return {
    player: selectedPlayer,
    PlayerSelector: playerSelectorComponent,
  };
}

function Player({name, iconPath}: Player) {
  return (
    <span className="Player">
      {iconPath &&
        <img
          src={iconPath}
          className="PlayerSelector__player-icon"
          alt={`icon for ${name}`}
        />}
      {name}
    </span>
  );
}
