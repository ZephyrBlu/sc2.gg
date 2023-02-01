import { useEffect } from "react";
import {Player, useMultiplePlayerSelector} from "./zephyrus-search";
import {TimelineSearchOptions, useSearch} from "./hooks";

interface Props {
  playerList: Player[]
}

export function MatchupDetails({playerList}: Props) {
  const {player, opponent, MultiplePlayerSelector} = useMultiplePlayerSelector({playerList});
  const {searchTimelines} = useSearch();

  useEffect(() => {
    const search = async () => {
      const timelineOptions: TimelineSearchOptions = {
        player: player?.name,
        opponent: opponent?.name,
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
    </div>
  );
}
