import {useEffect} from "react";
import {ZephyrusSelectorType, useZephyrusSelector, useZephyrusMultipleSelector, ZephyrusSelectorItem} from "./zephyrus-search";
import {TimelineSearchOptions, useSearch} from "./hooks";
import type {Race} from "./types";

interface Props {
  playerRace: Race;
  opponentRace: Race;
  matchupData: Record<string, any[]>;
  players: Partial<Record<Race, string>>;
}

export function MatchupDetails({playerRace, opponentRace, matchupData}: Props) {
  console.log('matchup details', playerRace, opponentRace, matchupData);

  return (
    <div className="MatchupDetails">
      Matchup page
    </div>
  );
}
