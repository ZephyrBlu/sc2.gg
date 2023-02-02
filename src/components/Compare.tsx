import {useEffect} from "react";
import {ZephyrusSelectorType, useZephyrusSelector, useZephyrusMultipleSelector, ZephyrusSelectorItem} from "./zephyrus-search";
import {TimelineSearchOptions, useSearch} from "./hooks";
import type {Race} from "./types";

interface Props {
  playerList: ZephyrusSelectorItem<string>[];
  raceList: ZephyrusSelectorItem<Race>[]
}

export function Compare({playerList, raceList}: Props) {
  const {
    value: selectedPlayer,
    otherValue: selectedOpponent,
    MultipleSelectorComponent: MultiplePlayerSelector,
  } = useZephyrusMultipleSelector({
    dataList: playerList,
    type: ZephyrusSelectorType.TextWithIcon,
  });
  const {
    value: selectedRace,
    SelectorComponent: RaceSelector,
  } = useZephyrusSelector({
    dataList: raceList,
    type: ZephyrusSelectorType.TextWithIcon,
  });
  const {searchTimelines} = useSearch();

  useEffect(() => {
    const search = async () => {
      const timelineOptions: TimelineSearchOptions = {
        player: selectedPlayer?.name,
        opponent: selectedOpponent?.name,
        opponentRace: selectedRace?.name,
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
