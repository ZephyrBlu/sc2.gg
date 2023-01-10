import {useState, useRef} from 'react';
import type {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});
  const requests = useRef<{[key: string]: AbortController}>({});
  const API_URL = 'https://search.sc2.gg';

  const search = async (url: string, endpoint: string): Promise<any> => {
    if (queryCache[url]) {
      return queryCache[url];
    }

    const controller = new AbortController();
    const signal = controller.signal;

    if (requests.current[endpoint]) {
      requests.current[endpoint].abort();
    }

    requests.current[endpoint] = controller;

    const results = await fetch(url, {signal}).then(res => res.json()).catch(() => null);

    if (results) {
      setQueryCache(prevState => ({
        ...prevState,
        [url]: results,
      }));
    }

    return results;
  };

  const searchGames = async (query: string): Promise<Replay[]> => {
    const endpoint = `${API_URL}/games`;
    const params = `q=${query.toLowerCase()}`;
    return await search(`${endpoint}?${params}`, endpoint);
  };

  const searchPlayers = async (query: string): Promise<any> => {
    const endpoint = `${API_URL}/players`;
    const params = `q=${query.toLowerCase()}`;
    return await search(`${endpoint}?${params}`, endpoint);
  };

  const searchMaps = async (query: string): Promise<any> => {
    const endpoint = `${API_URL}/maps`;
    const params = `q=${query.toLowerCase()}`;
    return await search(`${endpoint}?${params}`, endpoint);
  };

  const searchEvents = async (query: string): Promise<any> => {
    const endpoint = `${API_URL}/events`;
    const params = `q=${query.toLowerCase()}`;
    return await search(`${endpoint}?${params}`, endpoint);
  };

  return {searchGames, searchPlayers, searchMaps, searchEvents};
}
