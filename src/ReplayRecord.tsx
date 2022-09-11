import {Replay} from './types';
import './ReplayRecord.css';

interface Props {
  replay: Replay;
}

export function ReplayRecord({ replay }: Props) {
  return (
    <div className="ReplayRecord">
      <div className="ReplayRecord__players">
        {replay.players.map((player) => (
          <div
            className={`
              ReplayRecord__player-info
              ReplayRecord__player-info--${replay.winner === player.id ? 'win' : 'loss'}
            `}
          >
            <img
              key={`${player.name}-${player.race}-${player.id}`}
              src={`/icons/${player.race.toLowerCase()}-logo.svg`}
              className={`ReplayRecord__matchup-race-icon ReplayRecord__race-icon--player-${player.id}`}
              alt={player.race}
            />
            <span className="ReplayRecord__player-name">
              {player.name}
            </span>
            <span
              className={`
                ReplayRecord__player-result
                ReplayRecord__player-result--${replay.winner === player.id ? 'win' : 'loss'}
              `}
            >
              {replay.winner === player.id ? 'Won' : ''}
            </span>
          </div>
        ))}
      </div>
      <div className="ReplayRecord__match-info">
        <span className="ReplayRecord__map">
          {replay.map}
        </span>
        <span className="ReplayRecord__game-length">
          {Math.ceil(replay.game_length / 60)}min
        </span>
        <span className="ReplayRecord__tournament-info">
          {replay.metadata}
        </span>
        <span className="ReplayRecord__played-at">
          {(new Date(replay.played_at * 1000)).toISOString().split('T')[0]}
        </span>
      </div>
    </div>
  );
}
