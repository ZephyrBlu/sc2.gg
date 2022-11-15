import {useState} from 'react';

export function useBuilds() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});

  const matchupBuildClusters = async (races: string[]) => {
    let url = `https://patient-wood-5201.fly.dev/clusters?m=${races.join(',').toLowerCase()}`;

    if (queryCache[url]) {
      return queryCache[url];
    }

    const response = await fetch(url).then(res => res.json());
    setQueryCache(prevState => ({
      ...prevState,
      [url]: response.results,
    }));
    return response.results;
  };

  const matchupBuildTree = async (races: string[]) => {
    let url = `https://patient-wood-5201.fly.dev/tree?m=${races.join(',').toLowerCase()}`;

    if (queryCache[url]) {
      return queryCache[url];
    }

    const response = await fetch(url).then(res => res.json());
    setQueryCache(prevState => ({
      ...prevState,
      [url]: response.results,
    }));
    return response.results;
  };

  return {matchupBuildClusters, matchupBuildTree};
}
