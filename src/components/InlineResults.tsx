import {useEffect, useState} from 'react';
import {LoadingAnimation} from './LoadingAnimation';
import './InlineResults.css';

type InlineResult = {
  element: JSX.Element,
  value: string,
  count?: number,
}

export type SelectedResult = {
  value: string;
  index: number | null;
}

export type DeselectedResult = {
  value: string | null;
  index: number | null;
}

type Props = {
  title: string;
  input: string;
  description: string;
  modifiers: string[];
  state: 'success' | 'cancelled' | 'error';
  results: InlineResult[];
  loading: boolean;
  max?: number;
  selected?: number | null;
  onSelection?: (result: SelectedResult) => void;
  onDeselection?: (result: DeselectedResult) => void;
  disabled?: boolean;
}

export function InlineResults({
  title,
  input,
  description,
  modifiers,
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

  useEffect(() => {
    if (onDeselection) {
      const index = selectedResultIndex;
      const value = index ? results[selectedResultIndex]?.value : null;

      onDeselection({value, index});
    }

    setSelectedResultIndex(null);
  }, [input]);

  return (
    <div className="InlineResults">
      <span className="InlineResults__header">
        <h3 className="InlineResults__title">
          {title}
        </h3>
        <span className="InlineResults__modifiers">
          {!input && selectedResultIndex === null && modifiers.length === 0 && description &&
            <span className="InlineResults__modifier InlineResults__modifier--description">
              {description}
            </span>}
          {selectedResultIndex !== null && results[selectedResultIndex] &&
            <span className="InlineResults__modifier InlineResults__modifier--result-selected">
              {results[selectedResultIndex].value}
            </span>}
          {selectedResultIndex === null  && modifiers && modifiers.length > 0 &&
            modifiers.map((modifier) => (
              <span className="InlineResults__modifier">
                {modifier}
              </span>
            ))}
        </span>
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
