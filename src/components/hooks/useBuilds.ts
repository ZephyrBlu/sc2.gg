import {useState} from 'react';
import {
  MatchupBuildCluster,
  MatchupBuildTree,
  RaceBuildCluster,
  RaceBuildTree,
} from '../../types';

type BuildClusters = {
  [race: string]: MatchupBuildCluster | RaceBuildCluster,
};
type BuildTrees = {
  [race: string]: MatchupBuildTree | RaceBuildTree,
};

export function useBuilds() {
  const [queryCache, setQueryCache] = useState<{
    [query: string]: BuildClusters | BuildTrees
  }>({});

  const matchupBuildClusters = async (races: string[]): Promise<BuildClusters> => {
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

  const matchupBuildTree = async (races: string[]): Promise<MatchupBuildTree> => {
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

  const raceBuildClusters = async (race: string): Promise<BuildClusters> => {
    let url = `https://patient-wood-5201.fly.dev/clusters/${race.toLowerCase()}`;

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

  const raceBuildTrees = async (race: string): Promise<BuildTrees> => {
    let url = `https://patient-wood-5201.fly.dev/trees/${race.toLowerCase()}`;

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

  return {
    matchupBuildClusters,
    matchupBuildTree,
    raceBuildClusters,
    raceBuildTrees,
  };
}
