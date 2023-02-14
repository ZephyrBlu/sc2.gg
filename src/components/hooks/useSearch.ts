import {useState, useRef} from 'react';
import type {Replay} from '../../types';

export type SearchState = 'loading' | 'success' | 'cancelled' | 'error';

export type SearchResult<T> = {
  query: string;
  value: T[];
  state: SearchState;
}

export type SearchOptions = {
  fuzzy?: boolean;
  player?: string | null;
  map?: string | null;
  event?: string | null;
  matchup?: string | null;
  build?: string | null;
}

export function useSearch() {
  const [queryCache, setQueryCache] = useState<{[query: string]: SearchResult<any>}>({});
  const requests = useRef<{[key: string]: AbortController}>({});
  const API_URL = 'https://search.sc2.gg';

  const search = async (query: string, url: string, endpoint: string): Promise<SearchResult<any>> => {
    if (queryCache[url]) {
      return queryCache[url];
    }

    url += '&refresh';

    const controller = new AbortController();
    const signal = controller.signal;

    if (requests.current[endpoint]) {
      requests.current[endpoint].abort();
    }

    requests.current[endpoint] = controller;

    const results = await fetch(url, {signal}).then(async (res) => {
      const value = await res.json();
      const state = 'success';
      const results: SearchResult<any> = {query, value, state};
      return results;
    }).catch((e) => {
      let state: SearchState = 'error';
      if (e instanceof DOMException && e.name === "AbortError") {
        state = 'cancelled';
      }

      const results: SearchResult<any> = {query, value: [], state};
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

  const setQuery = (query: string, params: URLSearchParams) => {
    if (query.length > 2) {
      params.set('q', query.toLowerCase());
    }
  };

  const buildParams = (query: string, opts: SearchOptions = {}) => {
    const params = new URLSearchParams();
    if (typeof opts.fuzzy === 'boolean') {
      if (opts.fuzzy === true) {
        setQuery(query, params);
        params.set('fuzzy', '');
      }
    } else {
      setQuery(query, params);
    }

    let anySpecificOptions = false;

    if (opts.player) {
      params.set('player_name', opts.player);
      anySpecificOptions = true;
    }

    if (opts.map) {
      params.set('map_name', opts.map);
      anySpecificOptions = true;
    }

    if (opts.event) {
      params.set('event_name', opts.event);
      anySpecificOptions = true;
    }

    if (opts.matchup) {
      params.set('matchup_name', opts.matchup);
      anySpecificOptions = true;
    }

    if (opts.build) {
      params.set('build', opts.build);
      anySpecificOptions = true;
    }

    // if there are specific search criteria, don't perform fuzzy search
    if (anySpecificOptions) {
      params.delete('q');
    }

    return params.toString();
  };

  const searchGames = async (
    query: string,
    opts: SearchOptions = {},
  ): Promise<SearchResult<Replay>> => {
    const endpoint = `${API_URL}/games`;
    const params = buildParams(query, opts);
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  const searchPlayers = async (
    query: string,
    opts: SearchOptions = {},
  ): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/players`;
    const params = buildParams(query, opts);
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  const searchMaps = async (
    query: string,
    opts: SearchOptions = {},
  ): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/maps`;
    const params = buildParams(query, opts);
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  const searchEvents = async (
    query: string,
    opts: SearchOptions = {},
  ): Promise<SearchResult<any>> => {
    const endpoint = `${API_URL}/events`;
    const params = buildParams(query, opts);
    return await search(query, `${endpoint}?${params}`, endpoint);
  };

  return {searchGames, searchPlayers, searchMaps, searchEvents};
}
