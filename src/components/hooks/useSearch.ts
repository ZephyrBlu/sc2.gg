import {useState, useRef} from 'react';
import type {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});
  const requests = useRef<{[key: string]: number}>({});

  const debounce = async (url: string, key: string, delay: number): Promise<Replay[]> => (
    new Promise((resolve) => {
      requests.current[key] = window.setTimeout(async () => {
        const results = await fetch(url).then(res => res.json());
        setQueryCache(prevState => ({
          ...prevState,
          [url]: results,
        }));
        resolve(results);
      }, delay);
    })
  );

  const search = async (query: string): Promise<Replay[]> => {
    const route = `https://search.sc2.gg`;
    const params = `q=${query.toLowerCase()}`;
    const url = `${route}?${params}`;

    if (queryCache[url]) {
      return queryCache[url];
    }

    if (requests.current[route]) {
      clearTimeout(requests.current[route]);
    }

    const delay = 200;
    const results = await debounce(url, route, delay);
    return results;
  };

  return {search};
}
