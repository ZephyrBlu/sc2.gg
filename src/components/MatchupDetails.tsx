import {useEffect} from "react";
import {ZephyrusSelectorType, useZephyrusSelector, useZephyrusMultipleSelector, ZephyrusSelectorItem} from "./zephyrus-search";
import {TimelineSearchOptions, useSearch} from "./hooks";
import type {Race} from "./types";

interface Props {
  playerList: ZephyrusSelectorItem<string>[];
  raceList: ZephyrusSelectorItem<Race>[]
}

export function MatchupDetails({playerList, raceList}: Props) {
  const {
    value: player,
    otherValue: opponent,
    MultipleSelectorComponent: MultiplePlayerSelector,
  } = useZephyrusMultipleSelector({
    dataList: playerList, type: ZephyrusSelectorType.TextWithIcon
  });
  const {
    value: race,
    SelectorComponent: RaceSelector,
  } = useZephyrusSelector({
    dataList: raceList, type: ZephyrusSelectorType.TextWithIcon
  });
  const {searchTimelines} = useSearch();

  useEffect(() => {
    const search = async () => {
      const timelineOptions: TimelineSearchOptions = {
        player: player?.name,
        opponent: opponent?.name,
        opponentRace: race?.name,
      };

      const results = await searchTimelines(timelineOptions);
      console.log('timeline search results', results);
    };

    search();
  }, []);

  return (
    <div className="MatchupDetails">
      Matchup page
      <MultiplePlayerSelector />
      <RaceSelector />
    </div>
  );
}
