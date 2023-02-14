// import trees2022 from '../_data/2022_build_trees.json' assert {type: "json"};
import trees2022 from '../_data/2022_build_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2022: ReportParams = {
  year: '2022',
  trees: generateMatchupTrees(trees2022),
  publishedAt: '2023-01-23',
  updatedAt: '2023-02-14',
  status: Status.Finalized,
  definitions: yearReportDefinitions,
  updates: [
    'Fixed a data issue with builds where morphed buildings (E.g. Orbital, Lair) were recorded based on their completion time instead of start time',
    'Fixed a data issue with Terran builds where flying buildings that landed would be recorded in the build',
    'Tweaked build selection parameters on a per-race and per-matchup basis to extend opening depth and granularity while preserving coverage',
    'Fixed a bug in the build tree construction which caused minor data issues where values were slightly off (E.g. 50.5% mirror winrate)',
  ],
}
