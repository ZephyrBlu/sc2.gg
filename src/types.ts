export type Player = {
  id: number,
  name: string,
  race: string,
}

export type Replay = {
  players: Player[],
  winner: number,
  game_length: number,
  map: string,
  played_at: number,
  summary_stats: any,
  metadata: any,
}