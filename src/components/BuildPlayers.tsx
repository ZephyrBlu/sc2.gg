import type {Race} from "./BlockResults";
import {BuildWithHeader} from "./BuildWithHeader";

interface Props {
  builds: Partial<Record<Race, any[]>>;
  race: Race;
}

export function BuildPlayers({builds, race}: Props) {
  console.log('builds', builds);

  return (
    <div className="BuildPlayers">
      {Object.entries(builds).map(([buildRace, raceBuilds]) => (
        raceBuilds.map(({build, players}) => {
          const wins = players
            .filter(player => player.win)
            .reduce((totalWins, player) => totalWins + player.occurrences, 0);

          const losses = players
            .filter(player => !player.win)
            .reduce((totalLosses, player) => totalLosses + player.occurrences, 0);

          const winrate = wins / (wins + losses);
          const playrate = (wins + losses) / players[0].total;

          return (
            <BuildWithHeader
              winrate={Math.round(winrate * 1000) / 10}
              playrate={Math.round(playrate / 1000) / 10}
              total={wins + losses}
              build={build.split(',')}
              race={buildRace as Race}
            />
          );
        })
      ))}
    </div>
  );
}
