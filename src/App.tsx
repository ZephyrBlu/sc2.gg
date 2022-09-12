import {useMemo} from 'react';
import {ReplayRecord} from './ReplayRecord';
import serialized_replays from './assets/replays.json';
import './App.css';

export function App() {
  const orderedReplays = useMemo(() => serialized_replays.replays.sort((a, b) => (
    b.played_at - a.played_at
  )), []);

  return (
    <div className="App">
      <header className="App__header">
        StarCraft II Tournament Games
        <span className="App__sub-heading">
          This site is built with&nbsp;
          <a href="https://reactjs.org/" target="_blank">React</a>,
          hosted on&nbsp;
          <a href="https://pages.cloudflare.com/" target="_blank">Cloudflare Pages</a>
          &nbsp;and&nbsp;
          <a href="https://github.com/ZephyrBlu/sc2.gg" target="_blank">Open Source on GitHub</a>
        </span>
      </header>
      <div className="App__replay-list">
        {orderedReplays.map((replay) => (
          <ReplayRecord
            key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
            replay={replay}
          />
        ))}
      </div>
    </div>
  )
}
