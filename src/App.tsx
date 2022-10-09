import {useState, useMemo, useCallback, useRef, useLayoutEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {Replay} from "./types";
import serialized_replays from './assets/replays.json';
import indexes from './assets/indexes.json';
import './App.css';

export function App() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [quickSelectOptions, setQuickSelectOptions] = useState<{[option: string]: string | null}>({
    matchup: null,
    player: null,
  });
  const [buildSize, setBuildSize] = useState<number>(10);
  const numResults = useRef<number>(0);

  const matchupRaceMapping: {[matchup: string]: string[]} = {
    'PvZ': ['Protoss', 'Zerg'],
    'ZvT': ['Zerg', 'Terran'],
    'TvP': ['Terran', 'Protoss'],
    'PvP': ['Protoss'],
    'TvT': ['Terran'],
    'ZvZ': ['Zerg'],
  }

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
    [...serialized_replays.replays].sort((a, b) => a.id - b.id)
  ), []);

  const playedAtSort = (a: Replay, b: Replay) => b.played_at - a.played_at;
  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
    />
  );

  const orderedReplays = useMemo(() => (
    [...serialized_replays.replays]
      .sort(playedAtSort)
      .map(mapToReplayComponent)
  ), [buildSize]);

  const searchIndexes = useCallback((input: string) => {
    if (!input && !quickSelectOptions.matchup && !quickSelectOptions.player) {
      return orderedReplays.slice(0, 100);
    }

    // builds
    if (input.includes("(")) {
      const buildSearchTokens = input
        .replace(/[()]/g, "")
        .split(",")
        .map(building => building.trim());

      if (buildSearchTokens.length < 3) {
        return orderedReplays.slice(0, 100);
      }

      const searchTrigrams = [];
      for (let i = 0; i < buildSearchTokens.length - 2; i++) {
        searchTrigrams.push(buildSearchTokens.slice(i, i + 3).join(","));
      }

      const buildIndex: {[k: string]: number[]} = indexes.build.entries;
      const buildSearchResults: Set<number> = new Set();
      searchTrigrams.forEach((key: string) => {
        if (buildIndex[key]) {
          buildIndex[key].forEach((id) => {
            buildSearchResults.add(id);
          });
        }
      });
      numResults.current = Array.from(buildSearchResults).length;

      return Array.from(buildSearchResults)
        .map(id => indexOrderedReplays[id])
        .slice(0, 100)
        .sort(playedAtSort).map(mapToReplayComponent);
    }

    const searchTerms = input.split(" ");

    if (quickSelectOptions.matchup && matchupRaceMapping[quickSelectOptions.matchup]) {
      searchTerms.push(...matchupRaceMapping[quickSelectOptions.matchup]);
    }

    if (quickSelectOptions.player) {
      searchTerms.push(quickSelectOptions.player);
    }

    console.log('serach terms', searchTerms);

    const searchTermResults: {[k: string]: any[]} = {};
    const searchTermReferences: {[k: string]: Set<number>} = {};

    Object.entries(indexes).forEach(([name, index]) => {
      Object.entries(index.entries).forEach(([key, references]) => {
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
                searchTermResults[term].push(indexOrderedReplays[id]);
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
    numResults.current = intersectionResults.length;

    return intersectionResults.slice(0, 100).sort(playedAtSort).map(mapToReplayComponent);
  }, [buildSize, quickSelectOptions]);

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
                className={`
                  App__quick-option
                  ${option === quickSelectOptions.matchup ?
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
          <div className="App__player-quick-select">
            {['Serral', 'ByuN', 'ShoWTimE', 'Maru'].map((option) => (
              <button
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
        {searchInput &&
          <span className="App__search-results">
            {numResults.current} replays found
          </span>}
      </div>
      <div className="App__replay-list">
        {searchIndexes(searchInput)}
      </div>
    </div>
  )
}
