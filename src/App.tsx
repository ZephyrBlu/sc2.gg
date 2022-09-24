import {useState, useMemo, useCallback, useRef} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {Replay} from "./types";
import serialized_replays from './assets/replays.json';
import indexes from './assets/indexes.json';
import './App.css';

export function App() {
  const [searchInput, setSearchInput] = useState<string>('');
  const numResults = useRef<number>(0);

  const indexOrderedReplays = useMemo(() => (
    [...serialized_replays.replays].sort((a, b) => a.id - b.id)
  ), []);

  const playedAtSort = (a: Replay, b: Replay) => b.played_at - a.played_at;
  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
    />
  );

  const orderedReplays = useMemo(() => (
    [...serialized_replays.replays]
      .sort(playedAtSort)
      .map(mapToReplayComponent)
  ), []);

  const searchIndexes = useCallback((input: string) => {
    if (!input) {
      return orderedReplays.slice(0, 100);
    }

    const searchTerms = input.split(" ");
    const searchTermResults: {[k: string]: any[]} = {};
    const searchTermReferences: {[k: string]: Set<number>} = {};

    Object.entries(indexes).forEach(([name, index]) => {
      Object.entries(index.entries).forEach(([value, references]) => {
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

          if (value.toLowerCase().includes(term.toLowerCase())) {
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
    let raw_results = Object.values(searchTermResults);
    let intersection_results: Replay[] = raw_results.reduce((current, next) => {
      return current.filter(value => next.includes(value))
    }, raw_results[0]);
    numResults.current = intersection_results.length;

    return intersection_results.slice(0, 100).sort(playedAtSort).map(mapToReplayComponent);
  }, []);

  return (
    <div className="App">
      <header className="App__header">
        StarCraft 2 Tournament Games
        <span className="App__sub-heading">
          This site is built with&nbsp;
          <a href="https://reactjs.org/" target="_blank">React</a>,
          hosted on&nbsp;
          <a href="https://pages.cloudflare.com/" target="_blank">Cloudflare Pages</a>
          {/* &nbsp;and&nbsp;
          <a href="https://github.com/ZephyrBlu/sc2.gg" target="_blank">Open Source on GitHub</a> */}
        </span>
      </header>
      <div className="App__search">
        <input
          type="search"
          className="App__search-input"
          value={searchInput}
          placeholder="Search 7000+ replays for any player, race, map or tournament"
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
