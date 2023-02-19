import rawTrees from '../pages/reports/iem-katowice-2023/_build_trees.json';
import {generateMatchupTrees} from '../pages/reports/_utils';
import {simulate} from "../zephyrus-search/simluation";

export function Simulate() {
  const trees = generateMatchupTrees(rawTrees);
  const protossTree = trees.Protoss.Terran;
  const terranTree = trees.Terran.Protoss;

  // const results: Record<string, number> = {
  //   player: 0,
  //   opponent: 0,
  // };
  const ITERATIONS = 100000
  const results = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const series: Record<string, number> = {
      player: 0,
      opponent: 0,
    };
    for (let j = 0; j < 5; j++) {
      const simulation = simulate(protossTree, terranTree);
      // console.log('simulation result', simulation);
      series[simulation.winner] += 1;

      const seriesComplete = Object.values(series).some(value => value >= 3);
      if (seriesComplete) {
        break;
      }
    }
    results.push(series);
  }

  console.log('100,000 simulation results', results);
  const wins = results.reduce((total, current) => {
    if (current.player > current.opponent) {
      return total + 1;
    }

    return total;
  }, 0);
  const calculatedWinrate = wins / ITERATIONS;
  console.log('simulation winrate:', calculatedWinrate, wins, ITERATIONS);

  return (
    <div className="Simulate">
      Simulation
    </div>
  );
}
