import {useState} from 'react';
import {Replay} from '../types';

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: Replay[]}>({});

  const searchIndex = async (query: string, index: string) => {
    const url = process.env.NODE_ENV === 'production'
      ? `/api/search/${index}?q=${query}`
      : `https://ssg-refactor.sc2-gg.pages.dev/api/search/${index}?q=${query}`;

    if (queryCache[url]) {
      return queryCache[url];
    }

    const results = await fetch(url).then(res => res.json());
    setQueryCache(prevState => ({
      ...prevState,
      [url]: results,
    }));
    return results;
  };

  return {searchIndex};
}
