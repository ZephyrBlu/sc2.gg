import {useEffect, useState} from 'react';
import {PlayerSelector} from '../components/PlayerSelector';
import type {SelectorHookProps, Player} from '../types';

export function usePlayerSelector({playerList}: SelectorHookProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Player[] | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const searchPlayerList = (prefix: string) => (
    playerList.filter(player => player.name.startsWith(prefix))
  );

  useEffect(() => {
    const results = searchPlayerList(searchInput);
    setSearchResults(results);
  }, [searchInput]);

  const playerSelectorComponent = () => (
    <PlayerSelector>
      <details className="PlayerSelector__dropdown">
        <summary className="PlayerSelector__toggle">
          {selectedPlayer
            ? <Player name={selectedPlayer.name} iconPath={selectedPlayer.iconPath} />
            : 'Select a player'}
        </summary>
      </details>
      <input
        type="search"
        className="PlayerSelector__search-input"
        aria-label="search"
        value={searchInput}
        onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
      />
      {searchResults &&
        <div className="PlayerSelector__search-results">
          {searchResults.map(({name, iconPath}) => (
            <span className="PlayerSelector__search-result">
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
    <div className="Player">
      {iconPath &&
        <img
          src={iconPath}
          className="PlayerSelector__player-icon"
          alt={`icon for ${name}`}
        />}
      {name}
    </div>
  );
}
