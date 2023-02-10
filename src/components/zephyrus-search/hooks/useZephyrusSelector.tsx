import {useEffect, useState} from 'react';
import {ZephyrusSelector} from '../components/ZephyrusSelector';
import {
  ZephyrusSelectorType,
  ZephyrusSelectorItem,
  SearchableItem,
  TextWithIconItem,
  SelectorHookProps,
  SEARCHABLE_TYPES,
} from '../types';

export function useZephyrusSelector<T extends string>({dataList, type, identifier}: SelectorHookProps<T>) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchableItem<T>[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchableItem<T> | null>(null);

  const searchPlayerList = (prefix: string) => (
    dataList.filter((item): item is SearchableItem<T> => (
      (item as SearchableItem<T>).name.startsWith(prefix))
    )
  );

  useEffect(() => {
    if (!searchInput || !SEARCHABLE_TYPES.includes(type)) {
      return;
    }

    const results = searchPlayerList(searchInput);
    setSearchResults(results);
  }, [searchInput]);

  const onResultSelection = (result: SearchableItem<T>) => {
    setSelectedResult(result);
    setSearchInput('');
    setSearchResults(null);
  }; 

  const ZephyrusItem = ({item}: {item: ZephyrusSelectorItem<T>}) => {
    if (SEARCHABLE_TYPES.includes(type)) {
      return (
        <span className="ZephyrusSelector__item">
          {type === ZephyrusSelectorType.TextWithIcon &&
            <img
              src={(item as TextWithIconItem<T>).iconPath}
              className="ZephyrusSelector__item-icon"
              alt={`icon for ${(item as TextWithIconItem<T>).name}`}
            />}
          {(item as SearchableItem<T>).name}
        </span>
      );
    }
  
    return null;
  };

  const selectorComponent = () => (
    <ZephyrusSelector identifier={identifier}>
      <div className="ZephyrusSelector__player">
        {selectedResult
          ? <ZephyrusItem item={selectedResult} />
          : (
            <input
              type="search"
              className="ZephyrusSelector__search-input"
              aria-label="search"
              value={searchInput}
              onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
            />
          )}
      </div>
      {!selectedResult && searchResults &&
        <div className="ZephyrusSelector__search-results">
          {searchResults.length === 0 && 'No results'}
          {searchResults.map(result => (
            <span
              role="button"
              className="ZephyrusSelector__search-result"
              onClick={() => onResultSelection(result)}
            >
              <ZephyrusItem item={result} />
            </span>
          ))}
        </div>}
    </ZephyrusSelector>
  );

  return {
    value: selectedResult,
    SelectorComponent: selectorComponent,
  };
}

