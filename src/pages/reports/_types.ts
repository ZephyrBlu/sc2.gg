export enum Status {
  WorkInProgress = 'Work In Progress',
  Released = 'Released',
  Finalized = 'Finalized',
}

export interface DetailsItem {
  title: string,
  description: string,
};

export interface ReportDetailsProps {
  publishedAt: string;
  updatedAt?: string;
  status: Status;
  updates?: string[];
  definitions?: DetailsItem[];
  issues?: DetailsItem[];
}

export interface ReportParams extends ReportDetailsProps {
  year: string;
  trees: any;
}
