import {useState, useRef, useEffect, useLayoutEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {matchupRaceMapping, mirrorMatchups} from './constants';
import {useSearch} from './hooks';
import {Replay} from "./types";
import {LoadingAnimation} from './LoadingAnimation';
import './App.css';
import {compare} from './utils';

const INDEXES = [
  'player',
  'race',
  'map',
];

export function App() {
  // const [serialized] = useState<string | undefined>(
  //   document.getElementById('root')!.dataset.replays
  // );
  const [searchInput, setSearchInput] = useState<string>('');
  // const [searchIndexes, setSearchIndexes] = useState();
  // const [replays, setReplays] = useState<Replay[]>();
  // const [builds, setBuilds] = useState();
  const [quickSelectOptions, setQuickSelectOptions] = useState<{[option: string]: string | null}>({
    matchup: null,
    player: null,
  });
  const [buildSize, setBuildSize] = useState<number>(10);
  const [numResults, setNumResults] = useState<number>(0);
  const [showBuildsAndResults, setShowBuildsAndResults] = useState<boolean>(true);
  const searchStartedAt = useRef(0);
  const [searchResults, setSearchResults] = useState<Replay[]>([]);
  const {searchIndex} = useSearch();

  useEffect(() => {
    const search = async () => {
      let replays: Replay[][] = [];
      let searchStartTime = Date.now();

      if (quickSelectOptions.player) {
        const results = await searchIndex(quickSelectOptions.player, 'player');
        replays.push(results);
      }

      if (quickSelectOptions.matchup) {
        const matchup = matchupRaceMapping[quickSelectOptions.matchup];
        const isMirror = matchup.length === 1;
        await Promise.all(matchup.map(async (matchup) => {
          const results = await searchIndex(matchup, 'race', {mirror: isMirror});
          replays.push(results);
        }));
      }

      if (searchInput) {
        const terms = searchInput.split(' ');
        const inputResults: Replay[][] = [];
        await Promise.all(terms.map(async (term) => {
          const inputQuery = encodeURIComponent(term).replace(/%20/g, '+');
          const results = await Promise.all(INDEXES.map(index => searchIndex(inputQuery, index)));
          inputResults.push(...results);
        }));
        const inputIntersectionResults = inputResults.filter(r => r.length > 0).reduce((current, next) => {
          return current.filter(value => next.map(r => r.content_hash).includes(value.content_hash))
        }, inputResults[0]);
        replays.push(inputIntersectionResults);
      }

      // if search results are fresher than existing results, update them
      if (replays.length > 0 && searchStartTime > searchStartedAt.current) {
        const intersectionResults = replays.filter(r => r.length > 0).reduce((current, next) => {
          return current.filter(value => next.map(r => r.content_hash).includes(value.content_hash))
        }, replays[0]);
        intersectionResults.sort(playedAtSort);
        console.log('intersection results', intersectionResults, replays);

        const exactMatches: Replay[] = [];
        const otherMatches: Replay[] = [];
        const terms = searchInput.split(' ');
        intersectionResults.forEach((replay) => {
          let exact = false;
          replay.players.forEach((player) => {
            // any exact name match should rank replay higher
            const exactMatch = terms.some((term: string) => compare(player.name, term));
            console.log('exact match?', player.name.toLowerCase(), terms[0].toLowerCase(), exactMatch);
            if (!exact && exactMatch) {
              exactMatches.push(replay);
              exact = true;
            }
          });

          if (!exact) {
            otherMatches.push(replay);
          }
        });

        const orderedResults = [...exactMatches, ...otherMatches];
        console.log('setting new results', intersectionResults, searchResults, orderedResults);
        setSearchResults(orderedResults);
        searchStartedAt.current = searchStartTime;
      }
    };

    search();
  }, [searchInput, quickSelectOptions, setSearchResults]);

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

  const playedAtSort = (a: Replay, b: Replay) => b.played_at - a.played_at;
  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
      showBuildsAndResults={showBuildsAndResults}
    />
  );

  console.log('new render, current search results', searchResults);

  return (
    <div className="App">
      <header className="App__header">
        StarCraft 2 Tournament Games
      </header>
      <div className="App__search">
        <input
          type="search"
          className="App__search-input"
          value={searchInput}
          placeholder="Search 7000+ replays for any player, race, map or tournament"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="App__quick-search">
          <div className="App__matchup-quick-select">
            {Object.keys(matchupRaceMapping).map((option) => (
              <button
                key={option}
                className={`
                  App__quick-option
                  ${option === quickSelectOptions.matchup ?
                    'App__quick-option--selected' : ''}
                `}
                onClick={() => {
                  let newOption: string | null = option;
                  if (option === quickSelectOptions.matchup) {
                    newOption = null;
                  }
                  setQuickSelectOptions(prevState => ({
                    ...prevState,
                    matchup: newOption,
                  }));
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="App__player-quick-select">
            {['Serral', 'ByuN', 'ShoWTimE', 'Maru'].map((option) => (
              <button
                key={option}
                className={`
                  App__quick-option
                  ${option === quickSelectOptions.player ?
                    'App__quick-option--selected' : ''}
                `}
                onClick={() => {
                  let newOption: string | null = option;
                  if (option === quickSelectOptions.player) {
                    newOption = null;
                  }
                  setQuickSelectOptions(prevState => ({
                    ...prevState,
                    player: newOption,
                  }));
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="App__search-header">
            <span className="App__search-results">
            {(searchInput || quickSelectOptions.matchup || quickSelectOptions.player) &&
              <>
                {numResults} replays found
              </>}
            </span>
          <span className="App__search-filters">
            <input
              className="App__filter-checkbox"
              type="checkbox"
              name="search-filter"
              checked={showBuildsAndResults}
              onChange={() => setShowBuildsAndResults(prevState => !prevState)}
            />
            <label className="App__filter-label" htmlFor="search-filter">
              Show builds and results
            </label>
          </span>
        </div>
      </div>
      <div className="App__replay-list">
        {searchResults.length > 0 &&
          searchResults.slice(0, 25).map(mapToReplayComponent)}
      </div>
    </div>
  )
}
