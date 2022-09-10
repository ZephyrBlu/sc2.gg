import serialized_replays from './assets/replays.json';

export function Replays() {
  return (
    <div className="Replays">
      List of replays go here
      {serialized_replays.replays.map((replay) => (
        <div>
          {replay.map} {replay.played_at}
        </div>
      ))}
    </div>
  );
}
