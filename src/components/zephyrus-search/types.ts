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

export enum SelectorType {
  Text = 'Text',
  TextWithIcon = 'TextWithIcon',
  Date = 'Date',
  Number = 'Number',
}
