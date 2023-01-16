export type Player = {
  id: number,
  name: string,
  race: string,
}

export type Replay = {
  id: number,
  content_hash: string,
  players: Player[],
  builds: string[][],
  build_mappings: number[],
  winner_id: number,
  game_length: number,
  map: string,
  played_at: number,
  summary_stats?: any,
  event: string,
}

export type Build = any;
export type MatchupBuildCluster = any;
export type MatchupBuildTree = any;
export type RaceBuildCluster = any;
export type RaceBuildTree = any;
