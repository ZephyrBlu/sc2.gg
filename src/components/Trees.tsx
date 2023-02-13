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
              let MIN_PREFIX_PROBABILITY = 0.02;

              if (race === 'Protoss') {
                MIN_TOTAL = 25;

                if (opponentRace !== 'Protoss') {
                  MAX_BRANCHES = 25;
                }
              }

              if (race === 'Zerg') {
                MAX_BRANCHES = 10;
              }

              if (race === 'Terran') {
                MAX_BRANCHES = 30;
                MIN_TOTAL = 25;

                if (opponentRace === 'Terran') {
                  MAX_BRANCHES = 8;
                  MIN_PREFIX_PROBABILITY = 0.01;
                  MIN_TOTAL = 10;
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
