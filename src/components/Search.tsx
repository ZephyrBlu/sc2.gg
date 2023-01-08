import {useState, useRef, useEffect, useLayoutEffect, MutableRefObject} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {useSearch} from './hooks';
import type {Replay} from "./types";
import {LoadingAnimation} from './LoadingAnimation';
import './Search.css';
import {compare} from './utils';

export function Search() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>(searchRef.current?.value || '');
  const [quickSelectOptions, setQuickSelectOptions] = useState<{[option: string]: string | null}>({
    matchup: null,
    player: null,
  });
  const [buildSize, setBuildSize] = useState<number>(10);
  const searchStartedAt = useRef(0);
  const [searchResults, setSearchResults] = useState<{
    loading: boolean,
    query: {[key: string]: string | null} | null,
    replays: Replay[],
  }>({
    loading: false,
    query: null,
    replays: [],
  });
  const {searchGames, searchPlayers, searchMaps, searchEvents} = useSearch();

  useEffect(() => {
    const startSearch = async () => {
      setSearchResults({
        replays: [],
        loading: true,
        query: {
          player: quickSelectOptions.player,
          matchup: quickSelectOptions.matchup,
          input: searchInput,
        },
      });

      let replays: Replay[][] = [];
      let searchStartTime = Date.now();

      if (searchInput) {
        const terms = searchInput.split(' ');
        const urlEncodedSearchInput = encodeURIComponent(searchInput).replace(/%20/g, '+');

        let inputResults: Replay[][] = [];
        const games = Promise.all(terms.map(async (term) => {
          const results = await searchGames(term);
          inputResults.push(results);
        }));

        let playerSuggestions = [];
        const players = new Promise<void>(async (resolve) => {
          const results = await searchPlayers(urlEncodedSearchInput);
          playerSuggestions.push(results);
          resolve();
        });

        let mapSuggestions = [];
        const maps = new Promise<void>(async (resolve) => {
          const results = await searchMaps(urlEncodedSearchInput);
          mapSuggestions.push(results);
          resolve();
        });

        let eventSuggestions = [];
        const events = new Promise<void>(async (resolve) => {
          const results = await searchEvents(urlEncodedSearchInput);
          eventSuggestions.push(results);
          resolve();
        });

        await Promise.all([
          games,
          players,
          maps,
          events,
        ]);

        console.log('game results', inputResults);
        console.log('player suggest', playerSuggestions);
        console.log('map suggest', mapSuggestions);
        console.log('event suggest', eventSuggestions);

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
          setSearchResults({
            replays: [],
            loading: false,
            query: {
              player: quickSelectOptions.player,
              matchup: quickSelectOptions.matchup,
              input: searchInput,
            },
          });
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
        setSearchResults({
          replays: orderedResults,
          loading: false,
          query: {
            player: quickSelectOptions.player,
            matchup: quickSelectOptions.matchup,
            input: searchInput,
          },
        });
        searchStartedAt.current = searchStartTime;
      }
    };

    startSearch();
  }, [searchInput, quickSelectOptions, setSearchResults]);

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

    const resultsQuery = [];

    if (searchResults.query.player) {
      resultsQuery.push(searchResults.query.player);
    }

    if (searchResults.query.matchup) {
      resultsQuery.push(searchResults.query.matchup);
    }

    if (searchResults.query.input) {
      resultsQuery.push(`"${searchResults.query.input}"`);
    }

    return `${searchResults.loading ? 'Loading' : 'Showing'} results for: ${resultsQuery.join(', ')}`;
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
        {/* <div className="Search__quick-search">
          <div className="Search__matchup-quick-select">
            {Object.keys(matchupRaceMapping).map((option) => (
              <button
                key={option}
                className={`
                  Search__quick-option
                  ${option === quickSelectOptions.matchup ?
                    'Search__quick-option--selected' : ''}
                `}
                onClick={() => {
                  let newOption: string | null = option;
                  if (option === quickSelectOptions.matchup) {
                    newOption = null;
                  }
                  setQuickSelectOptions(prevState => ({
                    ...prevState,
                    matchup: newOption,
                  }));
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="Search__player-quick-select">
            {['Serral', 'ByuN', 'ShoWTimE', 'Maru'].map((option) => (
              <button
                key={option}
                className={`
                  Search__quick-option
                  ${option === quickSelectOptions.player ?
                    'Search__quick-option--selected' : ''}
                `}
                onClick={() => {
                  let newOption: string | null = option;
                  if (option === quickSelectOptions.player) {
                    newOption = null;
                  }
                  setQuickSelectOptions(prevState => ({
                    ...prevState,
                    player: newOption,
                  }));
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div> */}
        <div className="Search__search-header">
          <span className="Search__search-results">
            {(searchInput || quickSelectOptions.matchup || quickSelectOptions.player) && buildResultsText()}
          </span>
        </div>
      </div>
      <div className="Search__replay-list">
        {searchResults.replays.length > 0 &&
          searchResults.replays.slice(0, 25).map(mapToReplayComponent)}
        {searchResults.loading &&
            <LoadingAnimation />}
        {(
          searchResults.replays.length === 0
          && !(searchInput || quickSelectOptions.matchup || quickSelectOptions.player)
        ) &&
          <span className="Search__default">
            Select a matchup/player, or start typing
          </span>}
        {(
          searchResults.replays.length === 0
          && (searchInput || quickSelectOptions.matchup || quickSelectOptions.player)
          && !searchResults.loading
         ) &&
            <span className="Search__default">
              No replays found for: {buildResultsText()?.slice(21)}
            </span>}
      </div>
    </div>
  )
}
