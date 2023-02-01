import {useEffect, useState} from 'react';
import {ZephyruSelector} from '../components/ZephyrusSelector';
import {
  SelectorType,
  SelectorItem,
  SearchableItem,
  TextWithIconItem,
  SelectorHookProps,
  SEARCHABLE_TYPES,
} from '../types';

export function useZephyrusSelector({dataList, type, identifier}: SelectorHookProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchableItem[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchableItem | null>(null);

  const searchPlayerList = (prefix: string) => (
    dataList.filter((item): item is SearchableItem => (
      (item as SearchableItem).name.startsWith(prefix))
    )
  );

  useEffect(() => {
    if (!searchInput || !SEARCHABLE_TYPES.includes(type)) {
      return;
    }

    const results = searchPlayerList(searchInput);
    setSearchResults(results);
  }, [searchInput]);

  const onResultSelection = (result: SearchableItem) => {
    setSelectedResult(result);
    setSearchInput('');
    setSearchResults(null);
  }; 

  const ZephyrusItem = ({item}: {item: SelectorItem}) => {
    if (SEARCHABLE_TYPES.includes(type)) {
      return (
        <span className="ZephyrusSelector__item">
          {type === SelectorType.TextWithIcon &&
            <img
              src={(item as TextWithIconItem).iconPath}
              className="ZephyrusSelector__item-icon"
              alt={`icon for ${(item as TextWithIconItem).name}`}
            />}
          {(item as SearchableItem).name}
        </span>
      );
    }
  
    return null;
  };

  const selectorComponent = () => (
    <ZephyruSelector identifier={identifier}>
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
    </ZephyruSelector>
  );

  return {
    value: selectedResult,
    SelectorComponent: selectorComponent,
  };
}

