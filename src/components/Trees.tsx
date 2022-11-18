import {useState, useEffect} from "react";
import {useBuilds} from "./hooks";
import {Tree} from './Tree';
import './Builds.css';

const RACES = ['Protoss', 'Terran', 'Zerg'];

export function Trees() {
  const [clusters, setClusters] = useState({});
  const [trees, setTrees] = useState({});
  const {raceBuildClusters, raceBuildTrees} = useBuilds();

  useEffect(() => {
    const generateMatchups = () => {
      const matchups = RACES.map(outerRace => RACES.map(innerRace => {
        const matchup = [innerRace, outerRace];
        matchup.sort();
        return matchup.join(',');
      })).flat();
      return Array.from(new Set(matchups)).map(matchup => matchup.split(','));
    };

    const load = async () => {
      const raceClusters = await Promise.all(RACES.map(async (race) => {
        const results = await raceBuildClusters(race);
        return {[race]: results};
      }));

      let mappedClusters = {};
      raceClusters.forEach((cluster) => {
        mappedClusters = {
          ...mappedClusters,
          ...cluster,
        };
      });

      const raceTrees = await Promise.all(RACES.map(async (race) => {
        const results = await raceBuildTrees(race);
        return {[race]: results};
      }));

      let mappedTrees = {};
      raceTrees.forEach((tree) => {
        mappedTrees = {
          ...mappedTrees,
          ...tree,
        };
      });
      setClusters(mappedClusters);
      setTrees(mappedTrees);
    };

    load();
  }, []);

  return (
    <div className="Builds">
      {Object.entries(trees).map(([race, opponents]) => (
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
          {Object.entries(opponents).map(([opponentRace, opponentTree]) => (
            <div className="Builds__opponent-race-builds">
              <div className="Builds__race-header">
                <h2 className="Builds__race">
                  vs {opponentRace}
                </h2>
                <img
                  src={`/icons/${opponentRace.toLowerCase()}-logo.svg`}
                  className={`
                    Builds__race-icon-opponent
                    ${opponentRace.toLowerCase() === 'protoss' ? 'Builds__race-icon-opponent--protoss' : ''}
                  `}
                  alt={opponentRace}
                />
              </div>
              <Tree race={race} oppRace={opponentRace} tree={opponentTree} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
