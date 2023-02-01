import { useEffect } from "react";
import { useSearch } from "./hooks";
import type { SearchOptions } from "./hooks";

export function ComparePlayers() {
  const {searchPlayerBuilds} = useSearch();

  useEffect(() => {
    const search = async () => {
      const searchOptions: SearchOptions = {
        player: 'byun',
        // opponent: 'solar',
        race: 'protoss',
      };
      const results = await searchPlayerBuilds(searchOptions);
      console.log('player build results', results);
    };

    search();
  }, []);

  return (
    <div className="ComparePlayers">
      Hello world
    </div>
  );
}
