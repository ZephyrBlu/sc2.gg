// import {Image} from '@astrojs/image/components';
import type {Replay} from './types';
import './ReplayRecord.css';

interface Props {
  replay: Replay;
  buildSize: number;
}

export function ReplayRecord({ replay, buildSize }: Props) {
  return (
    <div className="ReplayRecord">
      <div className="ReplayRecord__preview">
        <div className="ReplayRecord__match-info">
          <span>
            <span className="ReplayRecord__map">
              {replay.map}
            </span>
            <span className="ReplayRecord__game-length">
              {Math.ceil(replay.game_length / 60)}min
            </span>
          </span>
          {/* <span className="ReplayRecord__tournament-info">
            {replay.metadata}
          </span> */}
          <span className="ReplayRecord__played-at">
            {replay.played_at}
          </span>
        </div>
        <div className="ReplayRecord__players">
          {replay.players.map((player, index) => (
            <div
              key={`${replay.id}-${player.name}`}
              className="ReplayRecord__player"
            >
              <div
                className={`
                  ReplayRecord__player-info
                  ReplayRecord__player-info--${
                    replay.winner_id === player.id ?
                      'win' : 'loss'
                  }
                `}
              >
                <img
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
                    ReplayRecord__player-result--${replay.winner_id === player.id ? 'win' : 'loss'}
                  `}
                >
                  {replay.winner_id === player.id ? 'Won' : ''}
                </span>
              </div>
              <div className="ReplayRecord__player-build">
                {replay.builds[index]
                  .slice(0, buildSize)
                  .map(building => (
                    <>
                      <img
                        alt={building}
                        title={building}
                        className="ReplayRecord__building-icon"
                        src={`/images/buildings/${replay.players[index].race}/${building}.png`}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="ReplayRecord__arrow-right">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="ReplayRecord__footer">
        <span className="ReplayRecord__tags">
            {replay.metadata ?
              replay.metadata.split(",").map((tag) => (
                <div key={tag} className="ReplayRecord__tag">
                  {tag}
                </div>
              )) : (
                <span className="ReplayRecord__no-tags">
                  No tags
                </span>
              )}
        </span>
        <a
          className="ReplayRecord__download"
          href={`https://pub-4349e9f678544230a1638c4806d981e9.r2.dev/${replay.content_hash}.SC2Replay`}
        >
          Download
        </a>
      </div> */}
    </div>
  );
}
