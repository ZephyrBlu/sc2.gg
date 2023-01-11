import { useState, useRef, useEffect, useLayoutEffect, MutableRefObject } from 'react';
import { ReplayRecord } from './ReplayRecord';
import { SearchResult, useSearch } from './hooks';
import type { Replay } from "./types";
import './Search.css';
import { compare } from './utils';
import { InlineResults } from './InlineResults';

interface Results {
  replays: SearchResult;
  players: SearchResult;
  maps: SearchResult;
  events: SearchResult;
}

interface Props {
  initialResults: Results;
}

export function Search({ initialResults }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>(searchRef.current?.value || '');
  const [buildSize, setBuildSize] = useState<number>(10);
  const searchStartedAt = useRef(0);
  const [searchResults, setSearchResults] = useState<{
    loading: boolean,
    searching: boolean,
    query: string | null,
    results: Results,
  }>({
    loading: false,
    searching: false,
    query: null,
    results: initialResults,
  });
  const {searchGames, searchPlayers, searchMaps, searchEvents} = useSearch();

  useEffect(() => {
    const updateSearchInput = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('q')) {
        setSearchInput(params.get('q')?.split('+').join(' ') || '');
      }
    };

    updateSearchInput();

    window.addEventListener('popstate', updateSearchInput);
    return () => window.removeEventListener('popstate', updateSearchInput);
  }, []);

  const noSearchResultsPresent = (
    searchResults.results.replays.value.length === 0 &&
    searchResults.results.players.value.length === 0 &&
    searchResults.results.maps.value.length === 0 &&
    searchResults.results.events.value.length === 0
  );

  useEffect(() => {
    const startSearch = async () => {
      setSearchResults(prevState => ({
        ...prevState,
        loading: noSearchResultsPresent,
        searching: true,
        query: searchInput,
      }));

      let replays: Replay[][] = [];
      let searchStartTime = Date.now();

      const terms = searchInput.split(' ');
      const urlEncodedSearchInput = encodeURIComponent(searchInput.trim()).replace(/%20/, '+');

      let inputResults: Replay[][] = [];
      const gamesPromise = Promise.all(terms.map(async (term) => {
        const results = await searchGames(term);
        inputResults.push(results || []);
      }));

      const playersPromise = new Promise<SearchResult>(async (resolve) => {
        const results = await searchPlayers(urlEncodedSearchInput);
        resolve(results);
      });

      const mapsPromise = new Promise<SearchResult>(async (resolve) => {
        const results = await searchMaps(urlEncodedSearchInput);
        resolve(results);
      });

      const eventsPromise = new Promise<SearchResult>(async (resolve) => {
        const result = await searchEvents(urlEncodedSearchInput);
        resolve(result);
      });

      const [_, players, maps, events] = await Promise.all([
        gamesPromise,
        playersPromise,
        mapsPromise,
        eventsPromise,
      ]);

      let results: {[key: string]: SearchResult} = {players, maps, events};

      // if search fails or is cancelled, set result value to previous value

      if (players.state !== 'success') {
        results.players.query = searchResults.results.players.query;
        results.players.value = searchResults.results.players.value;
      } else {
        const exactMatches: Replay[] = [];
        const otherMatches: Replay[] = [];
        const terms = searchInput.split(' ');
        results.players.value.forEach((player) => {
          let exact = false;
          // any exact name match should rank replay higher
          const exactMatch = terms.some((term: string) => compare(player.player, term));
          if (!exact && exactMatch) {
            exactMatches.push(player);
            exact = true;
          }

          if (!exact) {
            otherMatches.push(player);
          }
        });

        const orderedResults = [...exactMatches, ...otherMatches];
        results.players.value = orderedResults;
      }

      if (maps.state !== 'success') {
        results.maps.query = searchResults.results.maps.query;
        results.maps.value = searchResults.results.maps.value;
      }

      if (events.state !== 'success') {
        results.events.query = searchResults.results.events.query;
        results.events.value = searchResults.results.events.value;
      }

      const wasAnyRequestCancelled = [players, maps, events].some(result => result.state === 'cancelled');

      setSearchResults(prevState => ({
        ...prevState,
        results: {
          ...prevState.results,
          ...results,
        },
        searching: wasAnyRequestCancelled,
      }));

      const wasAnyRequestSuccessful = [players, maps, events].some(result => result.state === 'success');

      const params = new URLSearchParams(window.location.search);
      if (
        wasAnyRequestSuccessful &&
        searchInput.trim() !== params.get('q')?.split('+').join(' ')
      ) {
        const url = new URL(window.location.href);
        url.searchParams.set('q', searchInput.trim());
        window.history.pushState({}, '', url);
      }

      inputResults = inputResults.filter(r => r.length > 0);
      if (inputResults.length > 0) {
        const inputIntersectionResults = inputResults.reduce((current, next) => {
          return current.filter(value => next.map(r => r.content_hash).includes(value.content_hash))
        }, inputResults[0]);
        replays.push(inputIntersectionResults);
      }

      // if search results are fresher than existing results, update them
      if (searchStartTime > searchStartedAt.current) {
        if (replays.length === 0) {
          setSearchResults(prevState => ({
            ...prevState,
            results: {
              ...prevState.results,
              replays: {
                query: searchInput,
                value: [],
                state: 'success',
              },
            },
            loading: false,
          }));
          searchStartedAt.current = searchStartTime;
          return;
        }

        replays = replays.filter(r => r.length > 0);
        const intersectionResults = replays.reduce((current, next) => {
          return current.filter(value => next.map(r => r.content_hash).includes(value.content_hash))
        }, replays[0]);
        intersectionResults.sort(playedAtSort);

        const exactMatches: Replay[] = [];
        const otherMatches: Replay[] = [];
        const terms = searchInput.split(' ');
        intersectionResults.forEach((replay) => {
          let exact = false;
          replay.players.forEach((player) => {
            // any exact name match should rank replay higher
            const exactMatch = terms.some((term: string) => compare(player.name, term));
            if (!exact && exactMatch) {
              exactMatches.push(replay);
              exact = true;
            }
          });

          if (!exact) {
            otherMatches.push(replay);
          }
        });

        const orderedResults = [...exactMatches, ...otherMatches];
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            replays: {
              query: searchInput,
              value: orderedResults,
              state: 'success',
            },
          },
          loading: false,
        }));
        searchStartedAt.current = searchStartTime;
      }
    };

    if (searchInput && searchInput.length > 2) {
      startSearch();
    } else {
      setSearchResults({
        query: '',
        results: initialResults,
        loading: false,
        searching: false,
      });
    }
  }, [searchInput, setSearchResults]);

  const calculateBuildSize = () => {
    if (window.innerWidth < 340) {
      setBuildSize(4);
    } else if (window.innerWidth < 370) {
      setBuildSize(5);
    } else if (window.innerWidth < 390) {
      setBuildSize(6);
    } else if (window.innerWidth < 430) {
      setBuildSize(7);
    } else if (window.innerWidth < 500) {
      setBuildSize(8);
    } else if (window.innerWidth < 560) {
      setBuildSize(10);
    } else {
      setBuildSize(10);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", calculateBuildSize);
    calculateBuildSize();
  }, []);

  const playedAtSort = (a: Replay, b: Replay) => {
    if (a.played_at < b.played_at) {
      return 1;
    }

    if (a.played_at > b.played_at) {
      return -1;
    }

    return 0;
  };
  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
    />
  );

  const buildResultsText = () => {
    if (!searchResults.query) {
      return 'Search 9000+ games for any replay, player, map or event';
    }

    return `${searchResults.searching ? 'Loading' : 'Showing'} results for: "${searchResults.query}"`;
  };

  return (
    <div className="Search">
      <div className="Search__search">
        <input
          type="search"
          className="Search__search-input"
          aria-label="search"
          autoFocus
          value={searchInput}
          ref={searchRef}
          onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
        />
        <div className="Search__search-header">
          <span className="Search__search-results">
            {buildResultsText()}
          </span>
        </div>
      </div>
      <div className="Search__category-results">
        <InlineResults
          title="Players"
          initial={!searchInput}
          description={searchResults.results.players.query}
          state={searchResults.results.players.state}
          results={searchResults.results.players.value.map(player => ({
            element: (
              <span
                className={`
                  Search__player-result
                  Search__player-result--${player.race}
                `}
              >
                <img
                  src={`/icons/${player.race.toLowerCase()}-logo.svg`}
                  className="Search__race-icon"
                  alt={player.race}
                />
                {player.player}
              </span>
            ),
            value: player.player,
            count: player.occurrences,
          }))}
          loading={searchResults.loading}
        />
        <hr className="Search__category-divider" />
        <InlineResults
          title="Maps"
          initial={!searchInput}
          description={searchResults.results.maps.query}
          state={searchResults.results.maps.state}
          results={searchResults.results.maps.value.map(map => ({
            element: map.map,
            value: map.map,
            count: map.occurrences,
          }))}
          loading={searchResults.loading}
        />
        <hr className="Search__category-divider" />
        <InlineResults
          title="Events"
          initial={!searchInput}
          description={searchResults.results.events.query}
          state={searchResults.results.events.state}
          results={searchResults.results.events.value.map(event => ({
            element: event.event,
            value: event.event,
            count: event.occurrences,
          }))}
          loading={searchResults.loading}
        />
        <hr className="Search__category-divider" />
        {searchResults.results.replays.value.slice(0, 20).map(mapToReplayComponent)}
        {noSearchResultsPresent && searchInput && !searchResults.loading &&
          <span className="Search__default">
            No replays found for: {buildResultsText()?.slice(21)}
          </span>}
      </div>
    </div>
  )
}
