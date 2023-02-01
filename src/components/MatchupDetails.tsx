import { useEffect } from "react";
import {TimelineSearchOptions, useSearch, usePlayerSelector} from "./hooks";

export function MatchupDetails() {
  const {player, PlayerSelector} = usePlayerSelector();
  const {searchTimelines} = useSearch();

  useEffect(() => {
    const timelineOptions: TimelineSearchOptions = {
      player: ,
      opponent: ,
    };
  }, []);

  return (
    <div className="MatchupDetails">
      Matchup page
    </div>
  );
}
