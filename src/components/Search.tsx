import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ReplayRecord } from './ReplayRecord';
import { SearchResult, SearchOptions, useSearch } from './hooks';
import type { Replay } from "./types";
import './Search.css';
import { compare } from './utils';
import { InlineResults, SelectedResult } from './InlineResults';

interface Results {
  replays: SearchResult<Replay>;
  players: SearchResult<any>;
  maps: SearchResult<any>;
  events: SearchResult<any>;
}

interface Props {
  initialResults: Results;
}

export function Search({ initialResults }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>(searchRef.current?.value || '');
  const [buildSize, setBuildSize] = useState<number>(10);
  const searchStartedAt = useRef(0);
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: boolean}>({
    players: true,
    maps: false,
    events: false,
  });
  const [showCategorySelectionDropdown, setShowCategorySelectionDropdown] = useState(false);
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
  const [selectedResults, setSelectedResults] = useState<{[key: string]: SelectedResult | null}>({
    players: null,
    maps: null,
    events: null,
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

  const anyResultsSelected = (
    selectedResults.players ||
    selectedResults.maps ||
    selectedResults.events
  );

  useEffect(() => {
    const startSearch = async () => {
      setSelectedResults({
        players: null,
        maps: null,
        events: null,
      });
      setSearchResults(prevState => ({
        ...prevState,
        loading: noSearchResultsPresent,
        searching: true,
        query: searchInput,
      }));

      let searchStartTime = Date.now();

      const urlEncodedSearchInput = encodeURIComponent(searchInput.trim()).replaceAll(/%20/g, '+');

      const gamesPromise = new Promise<SearchResult<Replay>>(async (resolve) => {
        const searchOptions: SearchOptions = {
          fuzzy: !anyResultsSelected,
          player: selectedResults.players?.value,
          map: selectedResults.maps?.value,
          event: selectedResults.events?.value,
        };

        const results = await searchGames(searchInput.trim(), searchOptions);
        resolve(results);
      });

      const playersPromise = new Promise<SearchResult<any>>(async (resolve) => {
        const results = await searchPlayers(urlEncodedSearchInput);
        resolve(results);
      });

      const mapsPromise = new Promise<SearchResult<any>>(async (resolve) => {
        const results = await searchMaps(urlEncodedSearchInput);
        resolve(results);
      });

      const eventsPromise = new Promise<SearchResult<any>>(async (resolve) => {
        const result = await searchEvents(urlEncodedSearchInput);
        resolve(result);
      });

      const [replays, players, maps, events] = await Promise.all([
        gamesPromise,
        playersPromise,
        mapsPromise,
        eventsPromise,
      ]);

      let results: {[key: string]: SearchResult<any>} = {players, maps, events};

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

      if (searchInput) {
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            ...results,
          },
          searching: wasAnyRequestCancelled,
        }));
      }

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

      // if search results are fresher than existing results, update them
      if (searchStartTime > searchStartedAt.current) {
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            replays: {
              query: searchInput,
              value: replays.value,
              state: 'success',
            },
          },
          loading: false,
        }));
        searchStartedAt.current = searchStartTime;
      }
    };

    if (
      (searchInput && searchInput.length > 2) ||
      anyResultsSelected
    ) {
      startSearch();
    } else {
      setSearchResults({
        query: '',
        results: initialResults,
        loading: false,
        searching: false,
      });
    }
  }, [searchInput]);

  useEffect(() => {
    const startGameSearch = async () => {
      let searchStartTime = Date.now();

      const replays = await new Promise<SearchResult<Replay>>(async (resolve) => {
        const searchOptions: SearchOptions = {
          fuzzy: false,
          player: selectedResults.players?.value,
          map: selectedResults.maps?.value,
          event: selectedResults.events?.value,
        };

        const results = await searchGames(searchInput.trim(), searchOptions);
        resolve(results);
      });

      // if search results are fresher than existing results, update them
      if (searchStartTime > searchStartedAt.current) {
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            replays: {
              query: searchInput,
              value: replays.value,
              state: 'success',
            },
          },
          loading: false,
        }));
        searchStartedAt.current = searchStartTime;
      }
    }

    if (anyResultsSelected) {
      startGameSearch();
    }
  }, [selectedResults]);

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

  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
    />
  );

  const buildResultsText = () => {
    if (!searchResults.query) {
      return 'Search 9000+ games for any player, map or event';
    }

    return `${searchResults.searching ? 'Loading' : 'Showing'} results for: "${searchResults.query}"`;
  };

  const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

  const allCategoriesSelected = Object.values(selectedCategories).every(selected => selected);
  const noCategoriesSelected = Object.values(selectedCategories).every(selected => !selected);

  return (
    <div
      className="Search"
      onClick={() => {
        if (showCategorySelectionDropdown) {
          setShowCategorySelectionDropdown(false);
        }}
      }
    >
      <div className="Search__search">
        <div className="Search__search-box">
          <details className="Search__search-type" open={showCategorySelectionDropdown}>
            <summary
              className="Search__selected-search-type"
              onClick={() => setShowCategorySelectionDropdown(prevState => !prevState)}
            >
              {allCategoriesSelected && 'All'}
              {noCategoriesSelected && 'Games'}
              {!allCategoriesSelected && !noCategoriesSelected &&
                Object.entries(selectedCategories)
                  .filter(([_, selected]) => selected)
                  .map(([category, _]) => capitalize(category))
                  .join(', ')}
            </summary>
            <div className="Search__search-type-selection-dropdown">
              {Object.entries(selectedCategories).map(([category, selected]) => (
                <span
                  className="Search__search-type-option"
                  onClick={(event) => {
                    // const onlyCategorySelected = Object.entries(selectedCategories)
                    //   .filter(([c, _]) => category !== c)
                    //   .every(([_, s]) => !s);

                    setSelectedCategories(prevState => ({
                      ...prevState,
                      [category]: !prevState[category],
                    }));
                  }}
                >
                  <input
                    type="checkbox"
                    id={`search-${category}`}
                    className="Search__search-type-checkbox"
                    name={`search-${category}`}
                    checked={selected}
                  />
                  <label className="Search__search-type-label" for={`search-${category}`}>
                    {capitalize(category)}
                  </label>
                </span>  
              ))}
            </div>
          </details>
          <input
            type="search"
            className="Search__search-input"
            aria-label="search"
            autoFocus
            value={searchInput}
            ref={searchRef}
            onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          />
        </div>
        <div className="Search__search-header">
          <span className="Search__search-results">
            {buildResultsText()}
          </span>
        </div>
      </div>
      <div className="Search__category-results">
        {selectedCategories.players &&
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
            selected={selectedResults.player?.index}
            onSelection={(result) => setSelectedResults(prevState => ({
              ...prevState,
              players: result,
            }))}
            onDeselection={() => setSelectedResults(prevState => ({
              ...prevState,
              players: null,
            }))}
          />}
        {selectedCategories.maps &&
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
            selected={selectedResults.maps?.index}
            onSelection={(result) => setSelectedResults(prevState => ({
              ...prevState,
              maps: result,
            }))}
            onDeselection={() => setSelectedResults(prevState => ({
              ...prevState,
              maps: null,
            }))}
          />}
        {selectedCategories.events && 
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
            selected={selectedResults.events?.index}
            onSelection={(result) => setSelectedResults(prevState => ({
              ...prevState,
              events: result,
            }))}
            onDeselection={() => setSelectedResults(prevState => ({
              ...prevState,
              events: null,
            }))}
          />}
        {searchResults.results.replays.value.slice(0, 20).map(mapToReplayComponent)}
        {noSearchResultsPresent && searchInput && !searchResults.loading &&
          <span className="Search__default">
            No replays found for: {buildResultsText()?.slice(21)}
          </span>}
      </div>
    </div>
  )
}
