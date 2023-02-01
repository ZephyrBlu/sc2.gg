export interface Player {
  name: string;
  iconPath?: string;
}

export interface SelectorHookProps {
  playerList: Player[];
  identifier?: string;
}

export interface SelectorComponentProps {
  identifier?: string;
  children: (JSX.Element | boolean | null)[];
}
