import {useState, useRef} from 'react';
import type {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});
  const requests = useRef<{[key: string]: any}>({});

  const debounce = async (url: string, key: string, delay: number) => (
    new Promise((resolve) => {
      requests.current[key] = setTimeout(async () => {
        const response = await fetch(url).then(res => res.json());
        setQueryCache(prevState => ({
          ...prevState,
          [url]: response.results,
        }));
        resolve(response.results);
      }, delay);
    })
  );

  const searchIndex = async (query: string, index: string, opts: any = {}) => {
    const route = `https://patient-wood-5201.fly.dev/search/${index}`;
    let params = `?q=${query.toLowerCase()}`;

    if (opts.mirror) {
      params += '&mirror=1';
    }

    const url = `${route}${params}`;

    if (queryCache[url]) {
      return queryCache[url];
    }

    if (!opts.preload && requests.current[route]) {
      clearTimeout(requests.current[route]);
    }

    const delay = opts.preload ? 0 : 200;
    const results = await debounce(url, route, delay);
    return results;
  };

  return {searchIndex};
}
