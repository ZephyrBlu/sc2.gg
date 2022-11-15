import { useEffect } from "react";
import {useBuilds} from "./hooks";

const RACES = ['Protoss', 'Terran', 'Zerg'];

export function Builds() {
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
      const clusters = await Promise.all(RACES.map((race) => (
        raceBuildClusters(race)
      )));

      const trees = await Promise.all(RACES.map((race) => (
        raceBuildTrees(race)
      )));

      console.log('clusters', clusters);
      console.log('tree', trees);
    };

    load();
  }, []);
  
  return (
    <div className="Builds">
      Hello world
    </div>
  );
}
