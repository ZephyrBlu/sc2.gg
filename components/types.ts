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
  winner: number,
  game_length: number,
  map: string,
  played_at: number,
  summary_stats?: any,
  metadata: string,
}
