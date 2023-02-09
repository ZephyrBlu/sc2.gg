// import trees2022 from '../_data/2022_build_trees.json' assert {type: "json"};
import trees2022 from '../_data/optimized_unpruned_2022_build_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2022: ReportParams = {
  year: '2022',
  trees: generateMatchupTrees(trees2022),
  publishedAt: '2023-01-23',
  updatedAt: '2023-01-27',
  status: Status.Released,
  definitions: yearReportDefinitions,
  updates: [
    'Fixed a data issue with builds where morphed buildings (E.g. Orbital, Lair) were recorded based on their completion time instead of start time',
    'Fixed a data issue with Terran builds where flying buildings that landed would be recorded in the build',
    'Tweaked build selection parameters on a per-race and per-matchup basis to extend opening depth and granularity while preserving coverage',
  ],
  issues: [{
    title: 'Incorrect Values',
    description: 'Some values are slightly incorrect (E.g. ZvZ winrate is not 50%, matchup totals are off-by-one on different sides). Values are directionally correct and the this is unlikely to significantly affect results. Working on a fix for this issue.',
  }],
}
