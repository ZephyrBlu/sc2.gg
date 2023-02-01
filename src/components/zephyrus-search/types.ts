export interface Player {
  name: string;
  iconPath?: string;
}

export interface SelectorHookProps {
  dataList: SelectorItem[];
  type: SelectorType;
  identifier?: string | null;
  identifiers?: {
    value: string;
    otherValue: string;
  };
}

export interface SelectorComponentProps {
  identifier?: string | null;
  children: (JSX.Element | boolean | null)[];
}

export enum SelectorType {
  Text = 'Text',
  TextWithIcon = 'TextWithIcon',
  Date = 'Date',
  Number = 'Number',
}

export interface TextItem {
  name: string;
}

export interface TextWithIconItem {
  name: string;
  iconPath: string;
}

export interface DateItem {
  date: string;
}

export interface NumberItem {
  value: number;
}

export type SelectorItem = TextItem | TextWithIconItem | DateItem | NumberItem;
export type SearchableItem = TextItem | TextWithIconItem;

export const SEARCHABLE_TYPES = [
  SelectorType.Text,
  SelectorType.TextWithIcon,
];
