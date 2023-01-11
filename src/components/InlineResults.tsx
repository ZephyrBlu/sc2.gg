import {useState} from 'react';
import {LoadingAnimation} from './LoadingAnimation';
import './InlineResults.css';

type InlineResult = {
  element: JSX.Element,
  value: string,
  count: number,
}

interface Props {
  title: string;
  query?: string;
  results: InlineResult[];
  loading: boolean;
  max?: number;
  selectedValueCallback?: Function;
  automaticSelection?: boolean;
  disabled?: boolean;
}

export function InlineResults({
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
    <div className="InlineResults">
      <span className="InlineResults__header">
        <h3 className="InlineResults__title">
          {title}
        </h3>
        {query &&
          <span className="InlineResults__query">
            {query}
          </span>}
        {!loading && results.length === 0 &&
          <span className="InlineResults__no-results">
            No results
          </span>}
      </span>
      {loading && <LoadingAnimation />}
      {!loading && results.length > 0 &&
        <div className="InlineResults__results">
          {results.slice(0, max).map(({element, value, count}, index) => (
            <div className="InlineResults__result">
              <button
                className={`
                  InlineResults__result-content
                  ${selectedResultIndex === index ? 'InlineResults__result-content--selected' : ''}
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
              <span className="InlineResults__result-count">
                {count} matches
              </span>
            </div>
          ))}
        </div>}
    </div> 
  );
}
