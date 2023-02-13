import type {Race} from './BlockResults';
import {Tree} from './Tree';
import './Builds.css';

interface Props {
  race: Race;
  trees: any;
}

export function MatchupTrees({ race, trees }: Props) {
  const RACES: Race[] = ['Protoss', 'Terran', 'Zerg'];

  return (
    <div className="Builds">
      <div className="Builds__race-builds">
        <div className="Builds__race-header">
          <h1 className="Builds__race">
            {race}
          </h1>
          <img
            src={`/icons/${race.toLowerCase()}-logo.svg`}
            className={`
              Builds__race-icon
              ${race.toLowerCase() === 'protoss' ? 'Builds__race-icon--protoss' : ''}
            `}
            alt={race}
          />
        </div>
        {RACES.map((opponentRace) => {
          let MAX_BRANCHES = 10;
          let MIN_TOTAL = 0;
          let MIN_PROBABILITY = 0;
          let MIN_PREFIX_TOTAL = 3;
          let MIN_PREFIX_PROBABILITY = 0.0;

          if (race === 'Protoss') {
            if (opponentRace === 'Protoss') {
              MAX_BRANCHES = 28;
            }

            if (opponentRace === 'Terran') {
              MAX_BRANCHES = 25;
            }

            if (opponentRace === 'Zerg') {
              MAX_BRANCHES = 30;
            }
          }

          if (race === 'Terran') {
            if (opponentRace === 'Protoss') {
              MAX_BRANCHES = 45;
            }

            if (opponentRace === 'Terran') {
              MAX_BRANCHES = 35;
            }

            if (opponentRace === 'Zerg') {
              MAX_BRANCHES = 25;
            }
          }

          if (race === 'Zerg') {
            if (opponentRace === 'Protoss') {
              MAX_BRANCHES = 25;
            }

            if (opponentRace === 'Terran') {
              MAX_BRANCHES = 15;
            }

            if (opponentRace === 'Zerg') {
              MAX_BRANCHES = 15;
            }
          }

          return (
            <>
              <Tree
                race={race}
                opponentRace={opponentRace}
                tree={trees[opponentRace]}
                opts={{
                  MAX_BRANCHES,
                  MIN_TOTAL,
                  MIN_PROBABILITY,
                  MIN_PREFIX_TOTAL,
                  MIN_PREFIX_PROBABILITY,
                }}
              />
              <hr className="Builds__cluster-divider" />
            </>
          );
        })}
      </div>
      <hr className="Builds__race-divider" />
    </div>
  );
}
