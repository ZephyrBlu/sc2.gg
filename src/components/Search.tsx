import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { SearchResult, SearchOptions, useSearch } from './hooks';
import type { Replay } from "./types";
import './Search.css';
import { compare } from './utils';
import { InlineResults, SelectedResult } from './InlineResults';
import { BlockResults, Race } from './BlockResults';
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://897e41e5e6f24829b75be219387dff94@o299086.ingest.sentry.io/4504037385240576",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

type SelectionCategories = 'players' | 'maps' | 'events' | 'matchup';

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

const RACES: Race[] = [
  'Protoss',
  'Terran',
  'Zerg',
];

const buildInitialResultSelection = () => {
  let initialSelection: SelectedResults = {
    players: null,
    maps: null,
    events: null,
    matchup: null,
  };

  if (typeof window === 'undefined') {
    return initialSelection;
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get('player')) {
    initialSelection.players = {value: params.get('player')!, index: null};
  }

  if (params.get('map')) {
    initialSelection.maps = {value: params.get('map')!, index: null};
  }

  if (params.get('event')) {
    initialSelection.events = {value: params.get('event')!, index: null};
  }

  if (
    params.get('matchup') &&
    RACES.some(race => params.get('matchup')!.toLowerCase().includes(race.toLowerCase()))
  ) {
    initialSelection.matchup = {value: params.get('matchup')!, index: null};
  }

  return initialSelection;
};

const buildInitialBuildSelection = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const params = new URLSearchParams(window.location.search);

  let initialBuild: string[] = [];
  if (params.get('build')) {
    initialBuild = params.get('build')!.split(',');
  }

  return initialBuild;
};

const buildInitialBuildRaceSelection = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  let initialBuild = null;
  if (
    params.get('build_race') &&
    RACES.some(race => race.toLowerCase() === params.get('build_race')!.toLowerCase())
  ) {
    initialBuild = params.get('build_race')! as Race;
  }

  return initialBuild;
};

export function Search({ initialResults, resultsDescriptions }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>(searchRef.current?.value || '');
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
    query: string | null,
    results: Results,
  }>({
    loading: false,
    query: null,
    results: initialResults,
  });
  const [selectedResults, setSelectedResults] = useState<SelectedResults>(buildInitialResultSelection);
  const [selectedBuild, setSelectedBuild] = useState<string[]>(buildInitialBuildSelection);
  const [selectedBuildRace, setSelectedBuildRace] = useState<Race | null>(buildInitialBuildRaceSelection);
  const {searchGames, searchPlayers, searchMaps, searchEvents} = useSearch();

  useLayoutEffect(() => {
    const updateSearchInput = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        setSearchInput(params.get('q')!.split('+').join(' '));
      }

      const initialSelection = buildInitialResultSelection();
      setSelectedResults(initialSelection);

      const initialBuildSelection = buildInitialBuildSelection();
      setSelectedBuild(initialBuildSelection)

      const initialBuildRaceSelection = buildInitialBuildRaceSelection();
      setSelectedBuildRace(initialBuildRaceSelection);
    };

    updateSearchInput();

    window.addEventListener('popstate', updateSearchInput);
    return () => window.removeEventListener('popstate', updateSearchInput);
  }, []);

  const anyResultsSelected = (
    selectedResults.players ||
    selectedResults.maps ||
    selectedResults.events ||
    selectedResults.matchup ||
    selectedBuild.length > 0
  );

  useEffect(() => {
    const startSearch = async () => {
      setSearchResults(prevState => ({
        ...prevState,
        loading: true,
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
          matchup: selectedResults.matchup?.value,
          build: selectedBuild.join(','),
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
          // any exact name match should rank replay higher
          const exactMatch = terms.some((term: string) => compare(player.player, term));
          if (exactMatch) {
            exactMatches.push(player);
            return;
          }

          otherMatches.push(player);
        });

        const orderedResults = [...exactMatches, ...otherMatches];
        results.players.value = orderedResults;
      }

      if (maps.state !== 'success') {
        results.maps.query = searchResults.results.maps.query;
        results.maps.value = searchResults.results.maps.value;
      }
      
      // else {
      //   const exactMatches: Replay[] = [];
      //   const otherMatches: Replay[] = [];
      //   const terms = searchInput.trim().split(' ');
      //   results.maps.value.forEach((map) => {
      //     if (searchInput.trim().toLowerCase() === map.map.toLowerCase()) {
      //       exactMatches.push(map);
      //       return;
      //     }

      //     // any exact name match should rank replay higher
      //     const exactMatch = terms.some((term: string) => map.map.toLowerCase().includes(term.toLowerCase()));
      //     if (exactMatch) {
      //       exactMatches.push(map);
      //       return;
      //     }

      //     otherMatches.push(map);
      //   });

      //   const orderedResults = [...exactMatches, ...otherMatches];
      //   results.maps.value = orderedResults;
      // }

      if (events.state !== 'success') {
        results.events.query = searchResults.results.events.query;
        results.events.value = searchResults.results.events.value;
      }

      if (searchInput || anyResultsSelected) {
        setSearchResults(prevState => ({
          ...prevState,
          results: {
            ...prevState.results,
            ...results,
          },
        }));
      }

      const wasAnyRequestSuccessful = [replays, players, maps, events].some(result => result.state === 'success');
      if (wasAnyRequestSuccessful) {
        const url = new URL(window.location.href);

        if (searchInput.trim().length > 2) {
          url.searchParams.set('q', searchInput.trim().toLowerCase());
        } else {
          url.searchParams.delete('q');
        }

        if (selectedResults.players) {
          url.searchParams.set('player', selectedResults.players.value);
        } else {
          url.searchParams.delete('player');
        }

        if (selectedResults.maps) {
          url.searchParams.set('map', selectedResults.maps.value);
        } else {
          url.searchParams.delete('map');
        }

        if (selectedResults.events) {
          url.searchParams.set('event', selectedResults.events.value);
        } else {
          url.searchParams.delete('event');
        }

        if (selectedResults.matchup) {
          url.searchParams.set('matchup', selectedResults.matchup.value);
        } else {
          url.searchParams.delete('matchup');
        }

        if (selectedBuild.length > 0) {
          url.searchParams.set('build', selectedBuild.join(','));
        } else {
          url.searchParams.delete('build');
        }

        if (selectedBuildRace) {
          url.searchParams.set('build_race', selectedBuildRace);
        } else {
          url.searchParams.delete('build_race');
        }

        if (url.toString() !== window.location.toString()) {
          window.history.pushState({}, '', url);

          const searchOptions: any = {};
          for (const [key, value] of url.searchParams.entries()) {
            searchOptions[key] = value;
          }
          // @ts-ignore
          plausible('Search', {props: searchOptions});
        }
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
      });
    }
  }, [searchInput, selectedResults, selectedBuildRace, selectedBuild]);

  const buildResultsText = () => {
    if (!searchResults.query) {
      return 'Search 25,000+ pro games for any player, map or event';
    }

    return `${searchResults.loading ? 'Loading' : 'Showing'} results for: "${searchResults.query}"`;
  };

  const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

  const allCategoriesSelected = Object.values(selectedCategories).every(selected => selected);
  const noCategoriesSelected = Object.values(selectedCategories).every(selected => !selected);

  const buildModifiers = (excludeCategory: string = '') => (
    Object.entries(selectedResults)
      .filter(([category, _]) => category !== 'matchup')
      .filter(([category, _]) => !compare(category, excludeCategory))
        .map(([_, selected]) => selected)
      .filter((selected): selected is SelectedResult => !!selected)
        .map(({value}) => value)
  );

  const selectableBuildings: {[key in Race]: string[]} = {
    Protoss: [
      'Gateway',
      'CyberneticsCore',
      'Nexus',
      'TwilightCouncil',
      'RoboticsFacility',
      'Stargate',
      'Forge',
      'PhotonCannon',
      'TemplarArchives',
      'DarkShrine',
      'FleetBeacon',
      'ShieldBattery',
    ],
    Terran: [
      'CommandCenter',
      'OrbitalCommand',
      'Barracks',
      'Factory',
      'Starport',
      'EngineeringBay',
      'Armory',
      'FusionCore',
      'GhostAcademy',
    ],
    Zerg: [
      'Hatchery',
      'SpawningPool',
      'BanelingNest',
      'RoachWarren',
      'EvolutionChamber',
      'Lair',
      'NydusNetwork',
      'HydraliskDen',
      'InfestationPit',
      'LurkerDenMP',
      'Hive',
      'Spire',
      'GreaterSpire',
      'UltraliskCavern',
    ],
  }

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
        <details className="Search__search-options">
          <summary className="Search__search-options-toggle">
            Search by build
            <span className="Search__new">
              NEW
            </span>
          </summary>
          <div className="Search__build-search">
            <div className="Search__selected-buildings">
              {selectedBuild.length === 0 &&
                <>
                  <div className="Search__building-icon Search__building-icon--selected" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="Search__arrow-right">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </>}
              {selectedBuild.map(building => (
                <>
                  <img
                    alt={building}
                    title={building}
                    className="Search__building-icon Search__building-icon--selected"
                    src={`/images/buildings/${selectedBuildRace}/${building}.png`}
                    onClick={() => {
                      if (selectedBuild.length === 1) {
                        setSelectedBuildRace(null);
                      }
                      setSelectedBuild(prevState => prevState.slice(0, -1));
                    }}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="Search__arrow-right">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </>
              ))}
            </div>
            <div className={`Search__building-options ${selectedBuildRace ? '' : 'Search__building-options--race'}`}>
              {!selectedBuildRace &&
                RACES.map(race => (
                  <img
                    alt={race}
                    title={race}
                    className="Search__race-icon Search__race-icon--add"
                    src={`/icons/${race.toLowerCase()}-logo.svg`}
                    onClick={() => setSelectedBuildRace(race as Race)}
                  />  
                ))}
              {selectedBuildRace && selectableBuildings[selectedBuildRace].slice(0, 8).map(building => (
                <img
                  alt={building}
                  title={building}
                  className="Search__building-icon Search__building-icon--add"
                  src={`/images/buildings/${selectedBuildRace}/${building}.png`}
                  onClick={() => setSelectedBuild((prevState) => {
                    const newState = [...prevState];
                    newState.push(building);
                    return newState;
                  })}
                />
              ))}
            </div>
          </div>
        </details>
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
        <BlockResults
          title="Replays"
          input={searchInput}
          description={resultsDescriptions.replays}
          loading={searchResults.loading}
          results={searchResults.results.replays.value}
          modifiers={buildModifiers('replays')}
          state={searchResults.results.replays.state}
          selectedMatchup={selectedResults.matchup?.value || null}
          setSelectedMatchup={(matchup: string | null) => (
            setSelectedResults(prevState => ({
              ...prevState,
              matchup: matchup ? {value: matchup, index: null} : null,
            })
          ))}
        />
      </div>
    </div>
  )
}
