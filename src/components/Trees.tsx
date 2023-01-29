import {Tree} from './Tree';
import './Builds.css';

export function Trees({ trees, objectType }) {
  const RACES = ['Protoss', 'Terran', 'Zerg'];
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
            {RACES.map(opponentRace => (
              <>
                <Tree
                  race={race}
                  opponentRace={opponentRace}
                  tree={trees[race][opponentRace]}
                  objectType={objectType}
                />
                <hr className="Builds__cluster-divider" />                  
              </>
            ))}
          </div>
          <hr className="Builds__race-divider" />
        </>
      ))}
    </div>
  );
}
