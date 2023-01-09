import {useState} from 'react';
import {LoadingAnimation} from './LoadingAnimation';
import './SearchResultsInline.css';

type InlineResult = {
  element: JSX.Element,
  value: string,
  count: number,
}

interface Props {
  title: string;
  results: InlineResult[];
  count: number;
  loading: boolean;
  max?: number;
  selectedValueCallback?: Function;
}

export function SearchResultsInline({ title, results, count, loading, max = 3, selectedValueCallback }: Props) {
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  return (
    <div className="SearchResultsInline">
      <span className="SearchResultsInline__header">
        <h3 className="SearchResultsInline__title">
          {title}
        </h3>
      </span>
      {loading && <LoadingAnimation />}
      {!loading && results.length === 0 &&
        <span className="SearchResultsInline__empty">
          No results
        </span>}
      {!loading && results.length > 0 &&
        <div className="SearchResultsInline__results">
          {results.slice(0, max).map(({element, value, count}, index) => (
            <div className="SearchResultsInline__result">
              <div
                className={`
                  SearchResultsInline__result-content
                  ${selectedResultIndex === index ? 'SearchResultsInline__result-content--selected' : ''}
                `}
                onClick={() => {
                  setSelectedResultIndex(index);
                  if (selectedValueCallback) {
                    selectedValueCallback(value);
                  }
                }}
              >
                {element}
              </div>
              <span className="SearchResultsInline__result-count">
                {count} matches
              </span>
            </div>
          ))}
        </div>}
    </div> 
  );
}
