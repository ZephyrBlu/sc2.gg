import {Image} from '@astrojs/image/components';
import {ReplaySummaryStat} from "./ReplaySummaryStat";
import type {Replay} from "./types";
import './ReplayDetails.css';

interface Props {
  replay: Replay;
}

export function ReplayDetails({ replay }: Props) {
  const orderedStatMapping = {
    avg_collection_rate: 'Avg Collection Rate',
    avg_unspent_resources: 'Avg Unspent Resources',
    workers_produced: 'Workers Produced',
    workers_lost: 'Workers Lost',
    resources_collected: 'Resources Collected',
    resources_lost: 'Resources Lost',
  };

  const clanTagIndex = (name: string) => (
    name.indexOf('>') === -1 ? 0 : name.indexOf('>') + 1
  );

  return (
    <div className="ReplayDetails">
      <div className="ReplayDetails__header">
        <a
          className="ReplayDetails__download"
          href={`https://pub-4349e9f678544230a1638c4806d981e9.r2.dev/${replay.content_hash}.SC2Replay`}
        >
          Download
        </a>
        <div className="ReplayDetails__player-info">
          {replay.players.map((player) => (
            <div key={player.id} className="ReplayDetails__player">
              <Image
                className="ReplayDetails__player-icon"
                src={`/icons/${player.race.toLowerCase()}-logo.svg`}
                alt={player.race}
                width={25}
                height={25}
              />
              <span className="ReplayDetails__player-name">
                  {player.name.slice(clanTagIndex(player.name))}
              </span>
            </div>
          ))}
        </div>
      </div>
      <table className="ReplayDetails__stats">
        <tbody>
          {Object.entries(orderedStatMapping).map(([key, name]) => (
            <ReplaySummaryStat
              key={key}
              replay={replay}
              statKey={key}
              statName={name}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}