import {useState} from 'react';
import {ReplayDetails} from './ReplayDetails';
import {Replay} from './types';
import './ReplayRecord.css';

interface Props {
  replay: Replay;
}

export function ReplayRecord({ replay }: Props) {
  const [showReplayDetails, setShowReplayDetails] = useState<boolean>(false);

  const stripMapSuffix = (name: string) => {
    const separatedName = name.split(' ');

    if (separatedName[separatedName.length - 1] === 'LE') {
      return separatedName.slice(0, -1).join(' ');
    }
    return name;
  };

  const clanTagIndex = (name: string) => (
    name.indexOf('>') === -1 ? 0 : name.indexOf('>') + 1
  );

  return (
    <div
      className={`
        ReplayRecord
        ${showReplayDetails ? 'ReplayRecord--selected' : ''}
      `}
      onClick={() => setShowReplayDetails(prevState => !prevState)}
    >
      <div className="ReplayRecord__preview">
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
                {player.name.slice(clanTagIndex(player.name))}
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
            {stripMapSuffix(replay.map)}
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
      {showReplayDetails &&
        <ReplayDetails replay={replay} />}
    </div>
  );
}
