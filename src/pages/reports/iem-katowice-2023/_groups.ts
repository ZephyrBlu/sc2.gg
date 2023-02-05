export const GROUP_A = [
  'Clem',
  'Dark',
  'RagnaroK',
  'Neeb',
  'Oliveira',
];

export const GROUP_B = [
  'Renyor',
  'Astrea',
  'Creator',
  'ShoWTimE',
  'GuMiho',
];

export const GROUP_C = [
  'herO',
  'Serral',
  'Solar',
  'DRG',
  'SpeCial',
];

export const GROUP_D = [
  'Maru',
  'Bunny',
  'ByuN',
  'HeRoMaRiE',
  'Lambo',
];

export type Group = 'A' | 'B' | 'C' | 'D';
export interface GroupDetails {
  group: Group,
  players: string[],
}

export const GROUPS: GroupDetails[] = [
  {group: 'A', players: GROUP_A},
  {group: 'B', players: GROUP_B},
  {group: 'C', players: GROUP_C},
  {group: 'D', players: GROUP_D},
];
