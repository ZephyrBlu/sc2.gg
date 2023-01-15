import type {Replay} from './types';
import './ReplaySummaryStat.css';

type Props = {
  replay: Replay;
  statKey: string;
  statName: string;
}

export function ReplaySummaryStat({ replay, statKey, statName }: Props) {
  let player1Highlight;
  let player2Highlight;

  const generateComparisonValues = (values) => {
    if (!Array.isArray(values[1])) {
      if (typeof values[1] === 'string') {
        return {
          1: Number(values[1]),
          2: Number(values[2]),
        };
      }
      return {
        1: values[1],
        2: values[2],
      };
    }

    const calcAvg = v => (
      v.reduce((a, b) => {
        if (typeof a === 'string') {
          if (a.includes('k')) {
            return Number(a.slice(0, -1)) + Number(b.slice(0, -1));
          }
          return Number(a) + Number(b);
        }
        return a + b;
      }, 0)
    );

    return {
      1: calcAvg(values[1]),
      2: calcAvg(values[2]),
    };
  };

  // const statValues = generateComparisonValues(statInfo);
  // if (statValues[1] > statValues[2]) {
  //   player1Highlight = 'win';
  //   player2Highlight = 'loss';
  // } else {
  //   player1Highlight = 'loss';
  //   player2Highlight = 'win';
  // }

  const renderValues = (values) => {
    if (!Array.isArray(values)) {
      return values;
    }

    let valueString = '';
    values.forEach((val, index) => {
      if (index === 0) {
        valueString += val;
      } else {
        valueString += ` / ${val}`;
      }
    });
    return valueString;
  };

  return (
    <tr
      key={statKey}
      className="ReplaySummaryStat__stat"
    >
      <td className="ReplaySummaryStat__stat-title">{statName}</td>
      <td className="ReplaySummaryStat__stat-value">
        <div
          className={`
            ReplaySummaryStat__value-wrapper
            ReplaySummaryStat__value-wrapper--${player1Highlight}
            ReplaySummaryStat__value-wrapper--${statKey}-${player1Highlight}
          `}
        >
          {renderValues(replay.summary_stats[1][statKey])}
        </div>
      </td>
      <td className="ReplaySummaryStat__stat-value">
        <div
          className={`
            ReplaySummaryStat__value-wrapper
            ReplaySummaryStat__value-wrapper--${player2Highlight}
            ReplaySummaryStat__value-wrapper--${statKey}-${player2Highlight}
          `}
        >
          {renderValues(replay.summary_stats[2][statKey])}
        </div>
      </td>
    </tr>
  );
};
