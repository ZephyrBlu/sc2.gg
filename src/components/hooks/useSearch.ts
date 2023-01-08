import {useState, useRef} from 'react';
import type {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});
  const requests = useRef<{[key: string]: number}>({});
  const API_URL = 'https://search.sc2.gg';

  const debounce = async (url: string, key: string, delay: number): Promise<Replay[]> => (
    new Promise((resolve) => {
      requests.current[key] = window.setTimeout(async () => {
        const results = await fetch(url).then(res => res.json()).catch(() => []);
        setQueryCache(prevState => ({
          ...prevState,
          [url]: results,
        }));
        resolve(results);
      }, delay);
    })
  );

  const search = async (url: string, endpoint: string): Promise<any> => {
    if (queryCache[url]) {
      return queryCache[url];
    }

    if (requests.current[endpoint]) {
      clearTimeout(requests.current[endpoint]);
    }

    const delay = 200;
    const results = await debounce(url, endpoint, delay);
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
