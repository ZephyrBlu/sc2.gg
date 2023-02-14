// import trees2022 from '../_data/2022_build_trees.json' assert {type: "json"};
import treesAllTime from '../_data/all_time_build_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const reportAllTime: ReportParams = {
  year: 'all-time',
  trees: generateMatchupTrees(treesAllTime),
  publishedAt: '2023-01-23',
  updatedAt: '2023-01-27',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
