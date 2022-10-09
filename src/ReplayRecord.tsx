import {Fragment, useState} from 'react';
import {ReplayDetails} from './ReplayDetails';
import {Replay} from './types';
import './ReplayRecord.css';

interface Props {
  replay: Replay;
  buildSize: number;
}

export function ReplayRecord({ replay, buildSize }: Props) {
  const [showReplayDetails, setShowReplayDetails] = useState<boolean>(false);

  const stripMap = (name: string) => {
    let strippedMapName = name.split(' ');

    if (strippedMapName[strippedMapName.length - 1] === 'LE') {
      strippedMapName = strippedMapName.slice(0, -1);
    }

    if (strippedMapName[0] === "[ESL]" || strippedMapName[0] === "[TLMC15]") {
      strippedMapName = strippedMapName.slice(1);
    }

    return strippedMapName.join(' ');
  };

  const filterBuild = (build: string[]) => (
    build.filter((building) => !(
      building.includes('Reactor') || building.includes('TechLab')
    ))
  );

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
        <div className="ReplayRecord__match-info">
          <span>
            <span className="ReplayRecord__map">
              {stripMap(replay.map)}
            </span>
            <span className="ReplayRecord__game-length">
              {Math.ceil(replay.game_length / 60)}min
            </span>
          </span>
          {/* <span className="ReplayRecord__tournament-info">
            {replay.metadata}
          </span> */}
          <span className="ReplayRecord__played-at">
            {(new Date(replay.played_at * 1000)).toISOString().split('T')[0]}
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
                  ReplayRecord__player-info--${replay.winner === player.id ? 'win' : 'loss'}
                `}
              >
                <img
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
              <div className="ReplayRecord__player-build">
                {filterBuild(replay.builds[index]).slice(0, buildSize).map((building, buildingIndex) => (
                  <Fragment key={`${replay.id}-${building}-${buildingIndex}`}>
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
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="ReplayRecord__related-builds">
          {[0, 1].map(index => (
            <a
              key={`build-${index}`}
              href=""
              className="ReplayRecord__build-recommendation"
              onClick={() => null}
            >
              See more builds like this
            </a>
          ))}
        </div> */}
      {showReplayDetails &&
        <ReplayDetails replay={replay} />}
    </div>
  );
}
