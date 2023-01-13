import {useState} from 'react';
import {LoadingAnimation} from './LoadingAnimation';
import './InlineResults.css';

type InlineResult = {
  element: JSX.Element,
  value: string,
  count?: number,
}

export interface SelectedResult {
  value: string;
  index: number;
}

interface Props {
  title: string;
  initial: boolean;
  description: string;
  state: 'success' | 'cancelled' | 'error';
  results: InlineResult[];
  loading: boolean;
  max?: number;
  selected?: number | null;
  onSelection?: (result: SelectedResult) => void;
  onDeselection?: (result: SelectedResult) => void;
  disabled?: boolean;
}

export function InlineResults({
  title,
  initial,
  description,
  state,
  results,
  loading,
  max = 5,
  selected = null,
  onSelection,
  onDeselection,
  disabled = false,
}: Props) {
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(selected);

  return (
    <div className="InlineResults">
      <span className="InlineResults__header">
        <h3 className="InlineResults__title">
          {title}
        </h3>
        {(initial || (selectedResultIndex !== null && results[selectedResultIndex])) &&
          <span className="InlineResults__query">
            {initial && selectedResultIndex === null && description}
            {selectedResultIndex !== null && results[selectedResultIndex].value}
          </span>}
        {!loading && results.length === 0 && state === 'success' &&
          <span className="InlineResults__no-results">
            No results
          </span>}
        {!loading && state === 'error' &&
          <span className="InlineResults__failed">
            Search failed
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
                  if (selectedResultIndex === index && onDeselection) {
                    onDeselection({value, index});
                  } else if (onSelection) {
                    onSelection({value, index});
                  }

                  setSelectedResultIndex(prevState => (
                    prevState === index
                      ? null
                      : index
                  ));

                }}
                disabled={disabled}
              >
                {element}
              </button>
              {count &&
                <span className="InlineResults__result-count">
                  {count} matches
                </span>}
            </div>
          ))}
        </div>}
    </div> 
  );
}
