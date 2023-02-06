import {useEffect, useState, useRef} from "react";
import {LineChart} from 'chartist';
import 'chartist/dist/index.css';
import type {TournamentPlayer} from "../pages/reports/iem-katowice-2023/_groups";
import {Player} from "./Player";

interface Props {
  players: TournamentPlayer[];
  weightedWinrate: Record<string, any>;
}

export function IEMKatowiceGroup({players, weightedWinrate}: Props) {
  const [_, setInitialRender] = useState<boolean>(false);
  const chartRef = useRef(null);

  useEffect(() => {
    setInitialRender(true);
  }, []);

  if (typeof document !== 'undefined' && chartRef.current !== null) {
    console.log('hello world', JSON.parse(weightedWinrate.win), JSON.parse(weightedWinrate.loss));
    const data = {
      labels: JSON.parse(weightedWinrate.time),
      series: [JSON.parse(weightedWinrate.win), JSON.parse(weightedWinrate.loss)]
    };
    new LineChart(chartRef.current, data);
  }

  return (
    <div class="IEMKatowiceGroup">
      <div className="IEMKatowiceGroup__players">
        {players.map(({name, race}) => (
          <Player
            name={name}
            race={race}
            size="medium"
          />
        ))}
      </div>
      <div className="IEMKatowiceGroup__weighted-winrate" ref={chartRef} />
    </div>
  );
}
