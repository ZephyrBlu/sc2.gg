import {useState} from 'react';
import type {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});

  const searchIndex = async (query: string, index: string, opts: any = {}) => {
    let url = `https://patient-wood-5201.fly.dev/search/${index}?q=${query.toLowerCase()}`;

    if (opts.mirror) {
      url += '&mirror=1';
    }

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

  return {searchIndex};
}
