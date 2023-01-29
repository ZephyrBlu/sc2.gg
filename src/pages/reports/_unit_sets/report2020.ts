import trees2020 from '../_data/2020_unit_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2020: ReportParams = {
  year: '2020',
  trees: generateMatchupTrees(trees2020),
  publishedAt: '2023-01-27',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
