import {useState} from 'react';
import './SearchResultsInline.css';

type InlineResult = {
  element: JSX.Element,
  count: number,
}

interface Props {
  results: InlineResult[];
  max?: number;
}

export function SearchResultsInline({ results, max = 3 }: Props) {
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  return (
    <div className="SearchResultsInline">
      {results.slice(0, max).map(({element, count}, index) => (
        <div className="SearchResultsInline__result">
          <div
            className={`
              SearchResultsInline__content
              ${selectedResultIndex === index ? 'SearchResultsInline__content--selected' : ''}
            `}
            onClick={() => setSelectedResultIndex(index)}
          >
            {element}
          </div>
          <span className="SearchResultsInline__result-count">
            {count} results
          </span>
        </div>
      ))}
    </div> 
  );
}
