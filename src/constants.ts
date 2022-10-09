export const mirrorMatchups: {[matchup: string]: string[]} = {
  'PvP': ['Protoss'],
  'TvT': ['Terran'],
  'ZvZ': ['Zerg'],
};

export const matchupRaceMapping: {[matchup: string]: string[]} = {
  'PvZ': ['Protoss', 'Zerg'],
  'ZvT': ['Zerg', 'Terran'],
  'TvP': ['Terran', 'Protoss'],
  ...mirrorMatchups,
};
