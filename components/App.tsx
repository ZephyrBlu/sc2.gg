import {useState, useMemo, useEffect, useLayoutEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {matchupRaceMapping, mirrorMatchups} from './constants';
import {Replay} from "./types";
import {LoadingAnimation} from './LoadingAnimation';
import './App.css';

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

  const searchResults = useMemo(() => {
    if (
      !searchIndexes ||
      !replays ||
      !builds ||
      (!searchInput && !quickSelectOptions.matchup && !quickSelectOptions.player)
    ) {
      return orderedReplays.slice(0, 100);
    }

    // // builds
    // if (input.includes("(")) {
    //   const buildSearchTokens = input
    //     .replace(/[()]/g, "")
    //     .split(",")
    //     .map(building => building.trim());

    //   if (buildSearchTokens.length < 3) {
    //     return orderedReplays.slice(0, 100);
    //   }

    //   const searchTrigrams = [];
    //   for (let i = 0; i < buildSearchTokens.length - 2; i++) {
    //     searchTrigrams.push(buildSearchTokens.slice(i, i + 3).join(","));
    //   }

    //   const buildIndex: {[k: string]: number[]} = searchIndexes.build.entries;
    //   const buildSearchResults: Set<number> = new Set();
    //   searchTrigrams.forEach((key: string) => {
    //     if (buildIndex[key]) {
    //       buildIndex[key].forEach((id) => {
    //         buildSearchResults.add(id);
    //       });
    //     }
    //   });
    //   numResults.current = Array.from(buildSearchResults).length;

    //   return Array.from(buildSearchResults)
    //     .map(id => indexOrderedReplays[id])
    //     .slice(0, 100)
    //     .sort(playedAtSort).map(mapToReplayComponent);
    // }

    const searchTerms = searchInput.split(" ");

    const isMatchupSelected = quickSelectOptions.matchup && matchupRaceMapping[quickSelectOptions.matchup];
    if (isMatchupSelected) {
      searchTerms.push(...matchupRaceMapping[quickSelectOptions.matchup!]);
    }

    if (quickSelectOptions.player) {
      searchTerms.push(quickSelectOptions.player);
    }

    const searchTermResults: {[k: string]: any[]} = {};
    const searchTermReferences: {[k: string]: Set<number>} = {};

    Object.entries(searchIndexes).forEach(([name, index]) => {
      Object.entries(index).forEach(([key, references]) => {
        searchTerms.forEach((term) => {
          if (!term) {
            return;
          }

          if (!(term in searchTermResults)) {
            searchTermResults[term] = [];
          }

          if (!(term in searchTermReferences)) {
            searchTermReferences[term] = new Set();
          }

          if (key.toLowerCase().includes(term.toLowerCase())) {
            references.forEach(id => {
              if (!searchTermReferences[term].has(id)) {
                searchTermReferences[term].add(id);
                searchTermResults[term].push(indexOrderedReplays.find(replay => replay.content_hash === id));
              }
            });
          }
        });
      });
    });

    // https://stackoverflow.com/a/1885569
    // progressively applying this intersection logic to each search term results
    // creates intersection of all terms
    let rawResults = Object.values(searchTermResults);
    let intersectionResults: Replay[] = rawResults.reduce((current, next) => {
      return current.filter(value => next.includes(value))
    }, rawResults[0]);

    if (isMatchupSelected) {
      let mirrorRace: string | undefined;
      searchTerms.forEach(() => {
        if (Object.keys(mirrorMatchups).includes(quickSelectOptions.matchup!)) {
          mirrorRace = matchupRaceMapping[quickSelectOptions.matchup!][0];
        }
      });

      if (mirrorRace) {
        intersectionResults = intersectionResults.filter((replay) => {
          let mirror = true;
          replay.players.forEach((player) => {
            if (player.race !== mirrorRace) {
              mirror = false;
            }
          });
          return mirror;
        });
      }
    }

    setNumResults(intersectionResults.length);

    return intersectionResults.slice(0, 100).sort(playedAtSort).map(mapToReplayComponent);
  }, [searchInput, replays, searchIndexes, builds, buildSize, quickSelectOptions, showBuildsAndResults, setNumResults]);

  return (
    <div className="App">
      <header className="App__header">
        StarCraft 2 Tournament Games
        {/* <span className="App__sub-heading">
          This site is built with&nbsp;
          <a href="https://reactjs.org/" target="_blank">React</a>,
          hosted on&nbsp;
          <a href="https://pages.cloudflare.com/" target="_blank">Cloudflare Pages</a>
          &nbsp;and&nbsp;
          <a href="https://github.com/ZephyrBlu/sc2.gg" target="_blank">Open Source on GitHub</a>
        </span> */}
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
        {searchIndexes && replays
          ? searchResults
          : serialized
            ? JSON.parse(atob(serialized)).map(mapToReplayComponent)
            : <LoadingAnimation />}
      </div>
    </div>
  )
}
