import serialized_replays from './assets/replays.json';
import { ReplayRecord } from './ReplayRecord';
import './ReplayList.css';

export function ReplayList() {
  const orderedReplays = serialized_replays.replays.sort((a, b) => (
    b.played_at - a.played_at
  ));

  return (
    <div className="ReplayList">
      {orderedReplays.map((replay) => (
        <ReplayRecord
          key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
          replay={replay}
        />
      ))}
    </div>
  );
}
