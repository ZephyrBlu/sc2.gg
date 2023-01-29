import trees2018 from '../_data/2018_unit_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2018: ReportParams = {
  year: '2018',
  trees: generateMatchupTrees(trees2018),
  publishedAt: '2023-01-27',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
