import {useState, useLayoutEffect, Dispatch, useEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {LoadingAnimation} from './LoadingAnimation';
import type {Replay} from './types';
import type { SearchState } from './hooks';
import './BlockResults.css';

type Race = 'Protoss' | 'Terran' | 'Zerg';

type BlockResult = {
  element: JSX.Element,
  value: string,
  count?: number,
}

type Props = {
  title: string;
  description: string;
  input: string;
  loading: boolean;
  state: SearchState;
  // results: BlockResult[];
  results: any[];
  modifiers: string[];
  selectedMatchup: string | null;
  setSelectedMatchup: Dispatch<string | null>;
  max?: number;
}

export function BlockResults({
  title,
  description,
  input,
  loading,
  state,
  results,
  modifiers,
  selectedMatchup,
  setSelectedMatchup,
  max = 20,
}: Props) {
  const [showRaceSelectDropdown, setShowRaceSelectDropdown] = useState<{[key: string]: boolean}>({
    player: false,
    opponent: false,
  });
  const [selectedRace, setSelectedRace] = useState<{[key: string]: Race | null}>(() => {
    const initialSelection: {[key: string]: Race | null} = {
      player: null,
      opponent: null,
    };

    if (!selectedMatchup) {
      return initialSelection;
    }

    if (selectedMatchup.toLowerCase().includes('protoss')) {
      initialSelection.player = 'Protoss';
    }

    if (selectedMatchup.toLowerCase().includes('terran')) {
      if (initialSelection.player) {
        initialSelection.opponent = 'Terran';
        return initialSelection;
      } else {
        initialSelection.player = 'Terran';
      }
    }

    if (selectedMatchup.toLowerCase().includes('zerg')) {
      if (initialSelection.player) {
        initialSelection.opponent = 'Zerg';
        return initialSelection;
      } else {
        initialSelection.player = 'Zerg';
      }
    }

    return initialSelection;
  });
  const [buildSize, setBuildSize] = useState<number>(10);
  // TODO: useDropdown hook AND/OR dropdown component

  useEffect(() => {
    const matchup = [];

    if (selectedRace.player) {
      matchup.push(selectedRace.player);
    }

    if (selectedRace.opponent) {
      matchup.push(selectedRace.opponent);
    }

    matchup.sort();

    setSelectedMatchup(matchup.join('') || null);
  }, [selectedRace]);

  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
    />
  );

  const calculateBuildSize = () => {
    if (window.innerWidth < 340) {
      setBuildSize(4);
    } else if (window.innerWidth < 370) {
      setBuildSize(5);
    } else if (window.innerWidth < 390) {
      setBuildSize(6);
    } else if (window.innerWidth < 430) {
      setBuildSize(7);
    } else if (window.innerWidth < 500) {
      setBuildSize(8);
    } else if (window.innerWidth < 560) {
      setBuildSize(10);
    } else {
      setBuildSize(10);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", calculateBuildSize);
    calculateBuildSize();
  }, []);

  const races: Race[] = [
    'Protoss',
    'Terran',
    'Zerg',
  ];

  return (
    <div className="BlockResults">
      <span className="InlineResults__header">
        <h3 className="InlineResults__title">
          {title}
        </h3>
        <span className="InlineResults__modifiers">
          {!input && modifiers.length === 0 && description &&
            <span className="InlineResults__modifier InlineResults__modifier--description">
              {description}
            </span>}
          {/* {modifiers && modifiers.length > 0 &&
            modifiers.map((modifier) => (
              <span className="InlineResults__modifier">
                {modifier}
              </span>
            ))} */}
        </span>
        {!loading && results.length === 0 && state === 'success' &&
          <span className="InlineResults__no-results">
            No results
          </span>}
        {!loading && state === 'error' &&
          <span className="InlineResults__failed">
            Search failed
          </span>}
      </span>
      <div className="BlockResults__matchup-selector">
        <div className="BlockResults__race-selector">
          <details className="Search__search-type" open={showRaceSelectDropdown.player}>
            <summary
              className="Search__selected-search-type"
              onClick={() => setShowRaceSelectDropdown(prevState => ({
                ...prevState,
                player: !prevState.player,
              }))}
            >
              {selectedRace.player ? (
                <>
                  {/* <img
                    src={`/icons/${selectedRace.player.toLowerCase()}-logo.svg`}
                    className={`
                      Search__race-icon
                      Search__race-icon--block
                      Search__player-result--${selectedRace.player}
                    `}
                    alt={selectedRace.player}
                  /> */}
                  {selectedRace.player}
                </>
              ) : 'Select race'}
            </summary>
            <div className="Search__search-type-selection-dropdown">
              <span className="Search__search-type-option">
                <input
                  type="radio"
                  id="search-none-player"
                  className="Search__search-type-checkbox"
                  name="race-selection-player"
                  checked={selectedRace.player === null}
                  onClick={() => {
                    setSelectedRace(prevState => ({
                      ...prevState,
                      player: null,
                    }));
                    setShowRaceSelectDropdown(prevState => ({
                      ...prevState,
                      player: false,
                    }));
                  }}
                />
                <label
                  className="Search__search-type-label"
                  for="search-none"
                >
                  None
                </label>
              </span>
              {races.map(race => (
                <span className="Search__search-type-option">
                  <input
                    type="radio"
                    id={`search-${race}-player`}
                    className="Search__search-type-checkbox"
                    name="race-selection-player"
                    checked={selectedRace.player === race}
                    onClick={() => {
                      setSelectedRace(prevState => ({
                        ...prevState,
                        player: race,
                      }));
                      setShowRaceSelectDropdown(prevState => ({
                        ...prevState,
                        player: false,
                      }));
                    }}
                  />
                  <label
                    className="Search__search-type-label Search__search-type-label--block"
                    for={`search-${race}`}
                  >
                    <img
                      src={`/icons/${race.toLowerCase()}-logo.svg`}
                      className={`
                        Search__race-icon
                        Search__race-icon--block
                        Search__player-result--${race}
                      `}
                      alt={race}
                    />
                    {race}
                  </label>
                </span>
              ))}
            </div>
          </details>
          vs
          <details className="Search__search-type" open={showRaceSelectDropdown.opponent}>
            <summary
              className="Search__selected-search-type"
              onClick={() => setShowRaceSelectDropdown(prevState => ({
                ...prevState,
                opponent: !prevState.opponent,
              }))}
            >
              {selectedRace.opponent ? (
                <>
                  {/* <img
                    src={`/icons/${selectedRace.opponent.toLowerCase()}-logo.svg`}
                    className={`
                      Search__race-icon
                      Search__race-icon--block
                      Search__player-result--${selectedRace.opponent}
                    `}
                    alt={selectedRace.opponent}
                  /> */}
                  {selectedRace.opponent}
                </>
              ) : 'Select race'}
            </summary>
            <div className="Search__search-type-selection-dropdown">
              <span className="Search__search-type-option">
                <input
                  type="radio"
                  id="search-none-opponent"
                  className="Search__search-type-checkbox"
                  name="race-selection-opponent"
                  checked={selectedRace.opponent === null}
                  onClick={() => {
                    setSelectedRace(prevState => ({
                      ...prevState,
                      opponent: null,
                    }));
                    setShowRaceSelectDropdown(prevState => ({
                      ...prevState,
                      opponent: false,
                    }));
                  }}
                />
                <label
                  className="Search__search-type-label"
                  for="search-none"
                >
                  None
                </label>
              </span>
              {races.map(race => (
                <span className="Search__search-type-option">
                  <input
                    type="radio"
                    id={`search-${race}-opponent`}
                    className="Search__search-type-checkbox"
                    name="race-selection-opponent"
                    checked={selectedRace.opponent === race}
                    onClick={() => {
                      setSelectedRace(prevState => ({
                        ...prevState,
                        opponent: race,
                      }));
                      setShowRaceSelectDropdown(prevState => ({
                        ...prevState,
                        opponent: false,
                      }));
                    }}
                  />
                  <label
                    className="Search__search-type-label Search__search-type-label--block"
                    for={`search-${race}`}
                  >
                    <img
                      src={`/icons/${race.toLowerCase()}-logo.svg`}
                      className={`
                        Search__race-icon
                        Search__race-icon--block
                        Search__player-result--${race}
                      `}
                      alt={race}
                    />
                    {race}
                  </label>
                </span>
              ))}
            </div>
          </details>
        </div>
      </div>
      {loading && <LoadingAnimation />}
      {!loading && results.slice(0, max).map(mapToReplayComponent)}
    </div>
  );
}
