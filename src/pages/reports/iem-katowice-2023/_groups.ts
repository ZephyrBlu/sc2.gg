import type {Race} from "../../../components/BlockResults";

export interface TournamentPlayer {
  name: string;
  race: Race;
}

export const GROUP_A: TournamentPlayer[] = [
  {name: 'Clem', race: 'Terran'},
  {name: 'Dark', race: 'Zerg'},
  {name: 'RagnaroK', race: 'Zerg'},
  {name: 'Neeb', race: 'Protoss'},
  {name: 'Oliveira', race: 'Terran'},
];

export const GROUP_B: TournamentPlayer[] = [
  {name: 'Renyor', race: 'Zerg'},
  {name: 'Astrea', race: 'Protoss'},
  {name: 'Creator', race: 'Protoss'},
  {name: 'ShoWTimE', race: 'Protoss'},
  {name: 'GuMiho', race: 'Terran'},
];

export const GROUP_C: TournamentPlayer[] = [
  {name: 'herO', race: 'Protoss'},
  {name: 'Serral', race: 'Zerg'},
  {name: 'Solar', race: 'Zerg'},
  {name: 'DRG', race: 'Zerg'},
  {name: 'SpeCial', race: 'Terran'},
];

export const GROUP_D: TournamentPlayer[] = [
  {name: 'Maru', race: 'Terran'},
  {name: 'Bunny', race: 'Terran'},
  {name: 'ByuN', race: 'Terran'},
  {name: 'HeRoMaRiE', race: 'Terran'},
  {name: 'Lambo', race: 'Zerg'},
];

export type Group = 'A' | 'B' | 'C' | 'D';
export interface GroupDetails {
  group: Group,
  players: TournamentPlayer[],
}

export const GROUPS: GroupDetails[] = [
  {group: 'A', players: GROUP_A},
  {group: 'B', players: GROUP_B},
  {group: 'C', players: GROUP_C},
  {group: 'D', players: GROUP_D},
];
