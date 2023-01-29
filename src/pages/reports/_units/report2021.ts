import trees2021 from '../_data/2021_unit_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2021: ReportParams = {
  year: '2021',
  trees: generateMatchupTrees(trees2021),
  publishedAt: '2023-01-27',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
