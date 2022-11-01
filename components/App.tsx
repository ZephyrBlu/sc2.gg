import {useState, useMemo, useEffect, useLayoutEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {matchupRaceMapping, mirrorMatchups} from './constants';
import {useSearch} from './hooks';
import {Replay} from "./types";
import {LoadingAnimation} from './LoadingAnimation';
import './App.css';

const INDEXES = [
  'player',
  'race',
  'map',
];

export function App() {
  const [serialized] = useState<string | undefined>(
    document.getElementById('root')!.dataset.replays
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchIndexes, setSearchIndexes] = useState();
  const [replays, setReplays] = useState<Replay[]>();
  const [builds, setBuilds] = useState();
  const [quickSelectOptions, setQuickSelectOptions] = useState<{[option: string]: string | null}>({
    matchup: null,
    player: null,
  });
  const [buildSize, setBuildSize] = useState<number>(10);
  const [numResults, setNumResults] = useState<number>(0);
  const [showBuildsAndResults, setShowBuildsAndResults] = useState<boolean>(true);
  const [apiReplays, setApiReplays] = useState<Replay[]>();
  const {searchIndex} = useSearch();

  useEffect(() => {
    const search = async () => {
      let searchResults: Replay[] = [];

      if (quickSelectOptions.player) {
        const results = await searchIndex(quickSelectOptions.player.toLowerCase(), 'player');
        searchResults.push(...results);
      }

      if (quickSelectOptions.matchup) {
        await Promise.all(matchupRaceMapping[quickSelectOptions.matchup].map(async (matchup) => {
          const results = await searchIndex(matchup.toLowerCase(), 'race');
          searchResults.push(...results);
        }));
      }

      if (searchInput) {
        const terms = searchInput.split(' ');
        await Promise.all(terms.map(async (term) => {
          const inputQuery = encodeURIComponent(term).replace(/%20/g, '+');
          const results = await Promise.all(INDEXES.map(index => searchIndex(inputQuery.toLowerCase(), index)));
          searchResults.push(...results.flat());
        }));
      }

      console.log('raw api results', searchResults);

      // de-dupe results
      searchResults.sort(playedAtSort);
      setApiReplays(searchResults);

      console.log('just set api replays', searchResults);
    };

    search();
  }, [searchInput, quickSelectOptions]);

  useEffect(() => {
    const fetchIndexes = async () => {
      const response = await fetch('/data/indexes.json');
      const data = await response.json();
      setSearchIndexes(data);
    };

    const fetchReplays = async () => {
      const response = await fetch('/data/replays.json');
      const data = await response.json();
      setReplays(data.replays);
    };

    const fetchBuilds = async () => {
      const response = await fetch('/data/builds.json');
      const data = await response.json();
      setBuilds(data);
    };

    const fetchData = async () => {
      // fetching essential data
      await Promise.all([
        fetchIndexes(),
        fetchReplays(),
        fetchBuilds(),
      ]);

      // fetching secondary data
    };

    fetchData();
  }, []);

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

  const indexOrderedReplays = useMemo(() => (
    replays ? [...replays].sort((a, b) => a.id - b.id) : []
  ), [replays]);

  const playedAtSort = (a: Replay, b: Replay) => b.played_at - a.played_at;
  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      builds={builds}
      buildSize={buildSize}
      showBuildsAndResults={showBuildsAndResults}
    />
  );

  const orderedReplays = useMemo(() => (
    replays && builds ? [...replays]
      .sort(playedAtSort)
      .map(mapToReplayComponent) : []
  ), [replays, builds, buildSize, showBuildsAndResults]);

  // const searchResults = useMemo(() => {
  //   if (
  //     !searchIndexes ||
  //     !replays ||
  //     !builds ||
  //     (!searchInput && !quickSelectOptions.matchup && !quickSelectOptions.player)
  //   ) {
  //     return orderedReplays.slice(0, 100);
  //   }

  //   const searchTerms = searchInput.split(" ");

  //   const isMatchupSelected = quickSelectOptions.matchup && matchupRaceMapping[quickSelectOptions.matchup];
  //   if (isMatchupSelected) {
  //     searchTerms.push(...matchupRaceMapping[quickSelectOptions.matchup!]);
  //   }

  //   if (quickSelectOptions.player) {
  //     searchTerms.push(quickSelectOptions.player);
  //   }

  //   const searchTermResults: {[k: string]: any[]} = {};
  //   const searchTermReferences: {[k: string]: Set<number>} = {};

  //   Object.entries(searchIndexes).forEach(([name, index]) => {
  //     Object.entries(index).forEach(([key, references]) => {
  //       searchTerms.forEach((term) => {
  //         if (!term) {
  //           return;
  //         }

  //         if (!(term in searchTermResults)) {
  //           searchTermResults[term] = [];
  //         }

  //         if (!(term in searchTermReferences)) {
  //           searchTermReferences[term] = new Set();
  //         }

  //         if (key.toLowerCase().includes(term.toLowerCase())) {
  //           references.forEach(id => {
  //             if (!searchTermReferences[term].has(id)) {
  //               searchTermReferences[term].add(id);
  //               searchTermResults[term].push(indexOrderedReplays.find(replay => replay.content_hash === id));
  //             }
  //           });
  //         }
  //       });
  //     });
  //   });

  //   // https://stackoverflow.com/a/1885569
  //   // progressively applying this intersection logic to each search term results
  //   // creates intersection of all terms
  //   let rawResults = Object.values(searchTermResults);
  //   let intersectionResults: Replay[] = rawResults.reduce((current, next) => {
  //     return current.filter(value => next.includes(value))
  //   }, rawResults[0]);

  //   if (isMatchupSelected) {
  //     let mirrorRace: string | undefined;
  //     searchTerms.forEach(() => {
  //       if (Object.keys(mirrorMatchups).includes(quickSelectOptions.matchup!)) {
  //         mirrorRace = matchupRaceMapping[quickSelectOptions.matchup!][0];
  //       }
  //     });

  //     if (mirrorRace) {
  //       intersectionResults = intersectionResults.filter((replay) => {
  //         let mirror = true;
  //         replay.players.forEach((player) => {
  //           if (player.race !== mirrorRace) {
  //             mirror = false;
  //           }
  //         });
  //         return mirror;
  //       });
  //     }
  //   }

  //   setNumResults(intersectionResults.length);

  //   return intersectionResults.slice(0, 100).sort(playedAtSort).map(mapToReplayComponent);
  // }, [searchInput, replays, searchIndexes, builds, buildSize, quickSelectOptions, showBuildsAndResults, setNumResults]);

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
          {/* <select className="App__search-filters">
            <option value="results">Show builds and results</option>
            <option value="builds">Hide builds and results</option>
          </select> */}
        </div>
      </div>
      <div className="App__replay-list">
        {/* {searchIndexes && replays
          ? searchResults
          : serialized
            ? JSON.parse(atob(serialized)).map(mapToReplayComponent)
            : <LoadingAnimation />} */}
        {apiReplays && apiReplays.map(mapToReplayComponent)}
      </div>
    </div>
  )
}
