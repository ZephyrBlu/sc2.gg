import {useState, useLayoutEffect} from 'react';
import {ReplayRecord} from './ReplayRecord';
import {LoadingAnimation} from './LoadingAnimation';
import type {Replay} from './types';
import type { SearchState } from './hooks';

type BlockResult = {
  element: JSX.Element,
  value: string,
  count?: number,
}

type Props = {
  title: string;
  description: string;
  input: string;
  loading: boolean;
  state: SearchState;
  // results: BlockResult[];
  results: any[];
  modifiers: string[];
  max?: number;
}

export function BlockResults({
  title,
  description,
  input,
  loading,
  state,
  results,
  modifiers,
  max = 20,
}: Props) {
  const [buildSize, setBuildSize] = useState<number>(10);

  const mapToReplayComponent = (replay: Replay) => (
    <ReplayRecord
      key={`${replay.game_length}-${replay.played_at}-${replay.map}`}
      replay={replay}
      buildSize={buildSize}
    />
  );

  const calculateBuildSize = () => {
    if (window.innerWidth < 340) {
      setBuildSize(4);
    } else if (window.innerWidth < 370) {
      setBuildSize(5);
    } else if (window.innerWidth < 390) {
      setBuildSize(6);
    } else if (window.innerWidth < 430) {
      setBuildSize(7);
    } else if (window.innerWidth < 500) {
      setBuildSize(8);
    } else if (window.innerWidth < 560) {
      setBuildSize(10);
    } else {
      setBuildSize(10);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", calculateBuildSize);
    calculateBuildSize();
  }, []);

  return (
    <div className="BlockResults">
      <span className="InlineResults__header">
        <h3 className="InlineResults__title">
          {title}
        </h3>
        <span className="InlineResults__modifiers">
          {!input && modifiers.length === 0 && description &&
            <span className="InlineResults__modifier InlineResults__modifier--description">
              {description}
            </span>}
          {modifiers && modifiers.length > 0 &&
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
      {!loading && results.slice(0, max).map(mapToReplayComponent)}
    </div>
  );
}
