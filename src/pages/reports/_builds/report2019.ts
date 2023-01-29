import trees2019 from '../_data/2019_build_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2019: ReportParams = {
  year: '2019',
  trees: generateMatchupTrees(trees2019),
  publishedAt: '2023-01-27',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
