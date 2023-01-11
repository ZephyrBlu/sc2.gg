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
  query: string;
  results: InlineResult[];
  loading: boolean;
  max?: number;
  selectedValueCallback?: Function;
  automaticSelection?: boolean;
  disabled?: boolean;
}

export function SearchResultsInline({
  title,
  query,
  results,
  loading,
  max = 3,
  selectedValueCallback,
  automaticSelection = true,
  disabled = false,
}: Props) {
  const [selectedResultIndex, setSelectedResultIndex] = useState(
    automaticSelection ? 0 : null
  );

  return (
    <div className="SearchResultsInline">
      <span className="SearchResultsInline__header">
        <h3 className="SearchResultsInline__title">
          {title}
        </h3>
        <span className="SearchResultsInline__query">
          {query}
        </span>
        {!loading && results.length === 0 &&
          <span className="SearchResultsInline__no-results">
            No results
          </span>}
      </span>
      {loading && <LoadingAnimation />}
      {!loading && results.length > 0 &&
        <div className="SearchResultsInline__results">
          {results.slice(0, max).map(({element, value, count}, index) => (
            <div className="SearchResultsInline__result">
              <button
                className={`
                  SearchResultsInline__result-content
                  ${selectedResultIndex === index ? 'SearchResultsInline__result-content--selected' : ''}
                `}
                onClick={() => {
                  setSelectedResultIndex(prevState => (
                    prevState === index
                      ? null
                      : index
                  ));

                  if (selectedValueCallback) {
                    selectedValueCallback(value);
                  }
                }}
                disabled={disabled}
              >
                {element}
              </button>
              <span className="SearchResultsInline__result-count">
                {count} matches
              </span>
            </div>
          ))}
        </div>}
    </div> 
  );
}
