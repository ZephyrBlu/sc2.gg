import trees2022 from '../_data/2022_unit_trees.json' assert {type: "json"};
import { yearReportDefinitions } from '../_definitions';
import {ReportParams, Status} from '../_types';
import { generateMatchupTrees } from '../_utils';

export const report2022: ReportParams = {
  year: '2022',
  trees: generateMatchupTrees(trees2022),
  publishedAt: '2023-01-23',
  status: Status.WorkInProgress,
  definitions: yearReportDefinitions,
}
