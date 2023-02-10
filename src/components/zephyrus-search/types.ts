export interface SelectorHookProps<T> {
  dataList: ZephyrusSelectorItem<T>[];
  type: ZephyrusSelectorType;
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

export enum ZephyrusSelectorType {
  Text = 'Text',
  TextWithIcon = 'TextWithIcon',
  Date = 'Date',
  Number = 'Number',
}

export interface TextItem<T> {
  name: T;
}

export interface TextWithIconItem<T> {
  name: T;
  iconPath: string;
}

export interface DateItem {
  date: string;
}

export interface NumberItem {
  value: number;
}

export type ZephyrusSelectorItem<T> = TextItem<T> | TextWithIconItem<T> | DateItem | NumberItem;
export type SearchableItem<T> = TextItem<T> | TextWithIconItem<T>;

export const SEARCHABLE_TYPES = [
  ZephyrusSelectorType.Text,
  ZephyrusSelectorType.TextWithIcon,
];
