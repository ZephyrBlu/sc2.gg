import {useState, useMemo, useCallback} from 'react';
import {ReplayRecord} from './ReplayRecord';
import serialized_replays from './assets/replays.json';
import indexes from './assets/indexes.json';
import './App.css';

export function App() {
  const [searchInput, setSearchInput] = useState('');

  const indexOrderedReplays = useMemo(() => (
    [...serialized_replays.replays].sort((a, b) => a.id - b.id)
  ), []);

  const playedAtSort = (a: any, b: any) => b.played_at - a.played_at;
  const mapToReplayComponent = (replay: any) => (
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
      return orderedReplays;
    }

    console.log('index ordered replays', indexOrderedReplays);

    const results: any = [];
    const seenReferences = new Set();
    Object.entries(indexes).forEach(([name, index]) => {
      Object.entries(index.entries).forEach(([value, references]) => {
        if (value.toLowerCase().includes(input.toLowerCase())) {
          references.forEach(id => {
            if (!seenReferences.has(id)) {
              seenReferences.add(id);
              results.push(indexOrderedReplays[id]);
            }
          });
        }
      });
    });

    console.log('found matches for input', results.length, results);
    return results.sort(playedAtSort).map(mapToReplayComponent);
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
          &nbsp;and&nbsp;
          <a href="https://github.com/ZephyrBlu/sc2.gg" target="_blank">Open Source on GitHub</a>
        </span>
      </header>
      <div className="App__search">
        <input
          type="search"
          className="App__search-input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div className="App__replay-list">
        {searchIndexes(searchInput)}
      </div>
    </div>
  )
}
