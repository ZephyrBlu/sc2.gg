import { useState, useRef, useEffect, useLayoutEffect, MutableRefObject } from 'react';
import { ReplayRecord } from './ReplayRecord';
import { useSearch } from './hooks';
import type { Replay } from "./types";
import { LoadingAnimation } from './LoadingAnimation';
import './Search.css';
import { compare } from './utils';
import { SearchResultsInline } from './SearchResultsInline';

interface Results {
  replays: Replay[];
  players: any[];
  maps: any[];
  events: any[];
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
  const { searchGames, searchPlayers, searchMaps, searchEvents } = useSearch();

  const noSearchResultsPresent = (
    searchResults.results.replays.length === 0 &&
    searchResults.results.players.length === 0 &&
    searchResults.results.maps.length === 0 &&
    searchResults.results.events.length === 0
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

      if (searchInput) {
        const terms = searchInput.split(' ');
        const urlEncodedSearchInput = encodeURIComponent(searchInput).replace(/%20/g, '+');

        let inputResults: Replay[][] = [];
        const gamesPromise = Promise.all(terms.map(async (term) => {
          const results = await searchGames(term);
          inputResults.push(results || []);
        }));

        const playersPromise = new Promise<{value: any[], cancelled: boolean}>(async (resolve) => {
          const results = await searchPlayers(urlEncodedSearchInput);
          resolve({value: results, cancelled: !Boolean(results)});
        });

        const mapsPromise = new Promise<{value: any[], cancelled: boolean}>(async (resolve) => {
        const results = await searchMaps(urlEncodedSearchInput);
          resolve({value: results, cancelled: !Boolean(results)});
        });

        const eventsPromise = new Promise<{value: any[], cancelled: boolean}>(async (resolve) => {
          const results = await searchEvents(urlEncodedSearchInput);
          resolve({value: results, cancelled: !Boolean(results)});
        });

        const [_, players, maps, events] = await Promise.all([
          gamesPromise,
          playersPromise,
          mapsPromise,
          eventsPromise,
        ]);

        let results = {};

        if (players.value) {
          results.players = players.value;
        }

        if (maps.value) {
          results.maps = maps.value;
        }

        if (events.value) {
          results.events = events.value;
        }

        let wasRequestCancelled = [players, maps, events].some(result => result.cancelled);

        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            ...results,
          },
          searching: wasRequestCancelled,
        }));

        inputResults = inputResults.filter(r => r.length > 0);
        if (inputResults.length > 0) {
          const inputIntersectionResults = inputResults.reduce((current, next) => {
            return current.filter(value => next.map(r => r.content_hash).includes(value.content_hash))
          }, inputResults[0]);
          replays.push(inputIntersectionResults);
        }
      }

      // if search results are fresher than existing results, update them
      if (searchStartTime > searchStartedAt.current) {
        if (replays.length === 0) {
          setSearchResults(prevState => ({
            ...prevState,
            results: {
              ...prevState.results,
              replays: [],
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
            replays: orderedResults,
          },
          loading: false,
        }));
        searchStartedAt.current = searchStartTime;
      }
    };

    if (searchInput) {
      startSearch();
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
      return;
    }

    return `${searchResults.searching ? 'Loading' : 'Showing'} results for: ${searchResults.query}`;
  };

  return (
    <div className="Search">
      <div className="Search__search">
        <input
          type="search"
          className="Search__search-input"
          autoFocus
          value={searchInput}
          ref={searchRef}
          placeholder="Search 7000+ replays for any player, race, map or tournament"
          onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
        />
        <div className="Search__search-header">
          <span className="Search__search-results">
            {searchInput && buildResultsText()}
          </span>
        </div>
      </div>
      <div className="Search__category-results-wrapper">
        <div className="Search__category-results">
          <div className="Search__player-results">
            <SearchResultsInline
              title="Players"
              results={searchResults.results.players.map(player => ({
                element: (
                  <>
                    {player.player}, {player.race}
                  </>
                ),
                value: player.player,
                count: player.occurrences,
              }))}
              loading={searchResults.loading}
              automaticSelection={Boolean(searchInput)}
            />
          </div>
          <div className="Search__map-results">
            <SearchResultsInline
              title="Maps"
              results={searchResults.results.maps.map(map => ({
                element: map.map,
                value: map.map,
                count: map.occurrences,
              }))}
              loading={searchResults.loading}
              automaticSelection={Boolean(searchInput)}
            />
          </div>
          <div className="Search__event-results">
            <SearchResultsInline
              title="Events"
              results={searchResults.results.events.map(event => ({
                element: event.event,
                value: event.event,
                count: event.occurrences,
              }))}
              loading={searchResults.loading}
              automaticSelection={Boolean(searchInput)}
            />
          </div>
          <div className="Search__replay-list">
            {searchResults.results.replays.slice(0, 25).map(mapToReplayComponent)}
            {noSearchResultsPresent && searchInput && !searchResults.loading &&
              <span className="Search__default">
                No replays found for: {buildResultsText()?.slice(21)}
              </span>}
          </div>
        </div>
      </div>
    </div>
  )
}
