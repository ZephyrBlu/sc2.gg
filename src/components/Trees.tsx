import type {Race} from './BlockResults';
import {Tree} from './Tree';
import './Builds.css';

interface Props {
  trees: any;
}

export function Trees({ trees }: Props) {
  const RACES: Race[] = ['Protoss', 'Terran', 'Zerg'];
  return (
    <div className="Builds">
      {Object.keys(trees).map(race => (
        <>
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
              // Zerg has less branching in their builds than other races
              // higher max branches makes openings too granular
              let MAX_BRANCHES = 15;
              let MIN_TOTAL = 10;
              let MIN_PROBABILITY = 0.02;
              let MIN_PREFIX_TOTAL = 25;
              let MIN_PREFIX_PROBABILITY = 0.02;

              if (race === 'Protoss') {
                MIN_TOTAL = 25;

                if (opponentRace === 'Terran') {
                  MAX_BRANCHES = 30;
                }

                if (opponentRace === 'Zerg') {
                  MAX_BRANCHES = 38;
                }
              }

              if (race === 'Terran') {
                MAX_BRANCHES = 30;
                MIN_TOTAL = 25;

                if (opponentRace === 'Protoss') {
                  MAX_BRANCHES = 25;
                }

                if (opponentRace === 'Terran') {
                  MAX_BRANCHES = 10;
                  MIN_PREFIX_PROBABILITY = 0.01;
                  MIN_TOTAL = 10;
                }

                if (opponentRace === 'Zerg') {
                  MAX_BRANCHES = 35;
                }
              }

              if (race === 'Zerg') {
                MAX_BRANCHES = 5;

                if (opponentRace === 'Protoss') {
                  MAX_BRANCHES = 20;
                }

                if (opponentRace === 'Zerg') {
                  MAX_BRANCHES = 10;
                  MIN_PROBABILITY = 0;
                  MIN_TOTAL = 5;
                  MIN_PREFIX_TOTAL = 10;
                }
              }

              return (
                <>
                  <Tree
                    race={race as Race}
                    opponentRace={opponentRace}
                    tree={trees[race][opponentRace]}
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
        </>
      ))}
    </div>
  );
}
