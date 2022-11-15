import { useEffect } from "react";
import {useBuilds} from "./hooks";

export function Builds() {
  const {matchupBuildClusters, matchupBuildTree} = useBuilds();

  useEffect(() => {
    const preload = async () => {
      const clusters = await matchupBuildClusters(['Protoss', 'Zerg']);
      const tree = await matchupBuildTree(['Protoss', 'Zerg']);
      console.log('clusters', clusters);
      console.log('tree', tree);
    };

    preload();
  }, []);
  
  return (
    <div className="Builds">
      Hello world
    </div>
  );
}
