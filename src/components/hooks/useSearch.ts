import {useState, useRef} from 'react';
import type {Replay} from '../types';

type SearchState = 'success' | 'cancelled' | 'error';

export interface SearchResult<T> {
  query: string;
  value: T[];
  state: SearchState;
}

export interface SearchOptions {
  fuzzy: boolean;
  player?: string | null;
  map?: string | null;
  event?: string | null;
}

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: SearchResult<any>}>({});
  const requests = useRef<{[key: string]: AbortController}>({});
  const API_URL = 'https://search.sc2.gg';

  const quoted = (string: string) => `"${string.split('+').join(' ')}"`;

  const search = async (query: string, url: string, endpoint: string): Promise<SearchResult<any>> => {
    if (queryCache[url]) {
      return queryCache[url];
    }

    const controller = new AbortController();
    const signal = controller.signal;

    if (requests.current[endpoint]) {
      requests.current[endpoint].abort();
    }

    requests.current[endpoint] = controller;

    const results = await fetch(url, {signal}).then(async (res) => {
      const value = await res.json();
      const state = 'success';
      const results: SearchResult<any> = {query: quoted(query), value, state};
      return results;
    }).catch((e) => {
      let state: SearchState = 'error';
      if (e instanceof DOMException && e.name === "AbortError") {
        state = 'cancelled';
      }

      const results: SearchResult<any> = {query: quoted(query), value: [], state};
      return results;
    });

    if (results.state === 'success') {
      setQueryCache(prevState => ({
        ...prevState,
        [url]: results,
      }));
    }

    return results;
  };

  const searchGames = async (
    query: string,
    opts: SearchOptions = {fuzzy: true},
  ): Promise<SearchResult<Replay>> => {
    const endpoint = `${API_URL}/games`;

    const params = new URLSearchParams();
    if (opts.fuzzy === true) {
      params.set('q', query.toLowerCase());
      params.set('fuzzy', '');
    }

    if (opts.player) {
      params.set('player_name', opts.player);
    }

    if (opts.map) {
      params.set('map_name', opts.map);
    }

    if (opts.event) {
      params.set('event_name', opts.event);
    }

    return await search(query, `${endpoint}?${params.toString()}`, endpoint);
  };

  const searchPlayers = async (query: string): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/players`;
    const params = `q=${query.toLowerCase()}`;
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  const searchMaps = async (query: string): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/maps`;
    const params = `q=${query.toLowerCase()}`;
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  const searchEvents = async (query: string): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/events`;
    const params = `q=${query.toLowerCase()}`;
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  return {searchGames, searchPlayers, searchMaps, searchEvents};
}
