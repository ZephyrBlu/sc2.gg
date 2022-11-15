import cluster from "cluster";
import {useState, useEffect} from "react";
import {useBuilds} from "./hooks";

const RACES = ['Protoss', 'Terran', 'Zerg'];

export function Builds() {
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
  
  console.log('clusters', clusters);
  console.log('trees', trees);

  return (
    <div className="Builds">
      {Object.entries(clusters).map(([race, opponents]) => (
        <div className="Builds__race">
          {Object.entries(opponents).map(([opponentRace, opponentCluster]) => (
            <div className="Builds__opponent-race">
              {opponentCluster.clusters.map((raceCluster) => (
                <div className="Builds__cluster">
                  {raceCluster.build.build}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
