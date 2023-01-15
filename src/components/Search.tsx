import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ReplayRecord } from './ReplayRecord';
import { SearchResult, SearchOptions, useSearch } from './hooks';
import type { Replay } from "./types";
import './Search.css';
import { compare } from './utils';
import { InlineResults, SelectedResult } from './InlineResults';

type SelectionCategories = 'players' | 'maps' | 'events';

type SelectedResults = {
  [key in SelectionCategories]: SelectedResult | null;
}

export type Results = {
  replays: SearchResult<Replay>;
  players: SearchResult<any>;
  maps: SearchResult<any>;
  events: SearchResult<any>;
}

type Props = {
  initialResults: Results;
  resultsDescriptions: {
    replays: string;
    players: string;
    maps: string;
    events: string;
  };
}

const buildInitialResultSelection = () => {
  let initialSelection: SelectedResults = {
    players: null,
    maps: null,
    events: null,
  };

  if (typeof window === 'undefined') {
    return initialSelection;
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get('player')) {
    initialSelection.players = {value: params.get('player')!, index: null};
  }

  if (params.get('maps')) {
    initialSelection.maps = {value: params.get('maps')!, index: null};
  }

  if (params.get('events')) {
    initialSelection.events = {value: params.get('events')!, index: null};
  }

  return initialSelection;
};

export function Search({ initialResults, resultsDescriptions }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>(searchRef.current?.value || '');
  const [buildSize, setBuildSize] = useState<number>(10);
  const searchStartedAt = useRef(0);
  const [selectedCategories, setSelectedCategories] = useState<{[key in SelectionCategories]: boolean}>(() => {
    const serializedSearchCategories = localStorage.getItem('searchCategories');
    if (serializedSearchCategories) {
      return JSON.parse(serializedSearchCategories);
    }

    return {
      players: true,
      maps: false,
      events: false,
    };
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
  const [selectedResults, setSelectedResults] = useState<SelectedResults>(buildInitialResultSelection);
  const {searchGames, searchPlayers, searchMaps, searchEvents} = useSearch();

  useEffect(() => {
    const updateSearchInput = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        setSearchInput(params.get('q')!.split('+').join(' '));
      }

      const initialSelection = buildInitialResultSelection();
      setSelectedResults(initialSelection);
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
      setSearchResults(prevState => ({
        ...prevState,
        loading: noSearchResultsPresent,
        searching: true,
        query: searchInput,
      }));

      let searchStartTime = Date.now();
      const resultsPromises: (Promise<SearchResult<any>> | Promise<{}>)[] = [];

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
      resultsPromises.push(gamesPromise);

      if (!selectedResults.players) {
        const playersPromise = new Promise<SearchResult<any>>(async (resolve) => {
          const searchOptions: SearchOptions = {
            map: selectedResults.maps?.value,
            event: selectedResults.events?.value,
          };
          const results = await searchPlayers(searchInput.trim(), searchOptions);
          resolve(results);
        });
        resultsPromises.push(playersPromise);
      } else {
        resultsPromises.push(new Promise((resolve) => resolve({})));
      }

      if (!selectedResults.maps) {
        const mapsPromise = new Promise<SearchResult<any>>(async (resolve) => {
          const searchOptions: SearchOptions = {
            player: selectedResults.players?.value,
            event: selectedResults.events?.value,
          };
          const results = await searchMaps(searchInput.trim(), searchOptions);
          resolve(results);
        });
        resultsPromises.push(mapsPromise);
      } else {
        resultsPromises.push(new Promise((resolve) => resolve({})));
      }

      if (!selectedResults.events) {
        const eventsPromise = new Promise<SearchResult<any>>(async (resolve) => {
          const searchOptions: SearchOptions = {
            player: selectedResults.players?.value,
            map: selectedResults.maps?.value,
          };
          const result = await searchEvents(searchInput.trim(), searchOptions);
          resolve(result);
        });
        resultsPromises.push(eventsPromise);
      } else {
        resultsPromises.push(new Promise((resolve) => resolve({})));
      }

      const [replays, players, maps, events] = await Promise.all(resultsPromises);

      let results: {[key: string]: SearchResult<any> | {}} = {players, maps, events};

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

      const wasAnyRequestCancelled = [replays, players, maps, events].some(result => result.state === 'cancelled');

      if (searchInput || anyResultsSelected) {
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            ...results,
          },
          searching: wasAnyRequestCancelled,
        }));
      }

      const wasAnyRequestSuccessful = [replays, players, maps, events].some(result => result.state === 'success');
      if (wasAnyRequestSuccessful) {
        const params = new URLSearchParams(window.location.search);
        const url = new URL(window.location.href);

        if (
          searchInput.trim().length > 2 &&
          searchInput.trim() !== params.get('q')?.split('+').join(' ')
        ) {
          url.searchParams.set('q', searchInput.trim().toLowerCase());
        }

        if (selectedResults.players) {
          url.searchParams.set('player', selectedResults.players.value.toLowerCase());
        } else {
          url.searchParams.delete('player');
        }

        if (selectedResults.maps) {
          url.searchParams.set('map', selectedResults.maps.value.toLowerCase());
        } else {
          url.searchParams.delete('map');
        }

        if (selectedResults.events) {
          url.searchParams.set('event', selectedResults.events.value.toLowerCase());
        } else {
          url.searchParams.delete('event');
        }

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
      (searchInput && searchInput.trim().length > 2) ||
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
  }, [searchInput, selectedResults]);

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

  const buildModifiers = (excludeCategory: string) => (
    Object.entries(selectedResults)
      .filter(([category, _]) => !compare(category, excludeCategory))
        .map(([_, selected]) => selected)
      .filter((selected): selected is SelectedResult => !!selected)
        .map(({value}) => capitalize(value))
  );

  return (
    <div
      className="Search"
      onClick={(event) => {
        const dropdownClassList = [
          'Search__search-type-selection-dropdown',
          'Search__search-type-option',
          'Search__search-type-checkbox',
          'Search__search-type-label',
        ];
        if (
          showCategorySelectionDropdown &&
          !dropdownClassList.includes(event.target?.classList[0])
        ) {
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
                <span className="Search__search-type-option">
                  <input
                    type="checkbox"
                    id={`search-${category}`}
                    className="Search__search-type-checkbox"
                    name={`search-${category}`}
                    checked={selected}
                    onClick={(event) => {
                      // const onlyCategorySelected = Object.entries(selectedCategories)
                      //   .filter(([c, _]) => category !== c)
                      //   .every(([_, s]) => !s);
  
                      setSelectedCategories((prevState) => {
                        const updatedSelection = {
                          ...prevState,
                          [category]: !prevState[category],
                        };
                        localStorage.setItem('searchCategories', JSON.stringify(updatedSelection));
                        return updatedSelection;
                      });
                    }}
                  />
                  <label
                    className="Search__search-type-label" 
                    for={`search-${category}`}
                  >
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
            input={searchInput}
            description={resultsDescriptions.players}
            modifiers={buildModifiers('players')}
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
            selected={selectedResults.players?.index}
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
            input={searchInput}
            description={resultsDescriptions.maps}
            modifiers={buildModifiers('maps')}
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
            input={searchInput}
            description={resultsDescriptions.events}
            modifiers={buildModifiers('events')}
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
