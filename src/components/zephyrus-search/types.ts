export interface Player {
  name: string;
  iconPath?: string;
}

export interface SelectorHookProps {
  playerList: Player[];
}

export interface SelectorComponentProps {
  children: (JSX.Element | null)[];
}
