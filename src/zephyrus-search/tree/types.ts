export interface Node {
  label: string;
  value: Count;
  children: Node[];
}

export interface Count {
  total: number;
  wins: number;
  losses: number;
}

export interface PrefixNode {
  prefix: string;
  probability: number;
  winrate: number;
  total: number;
  wins: number;
}

export interface PrefixQueueNode extends PrefixNode {
  node: Node;
}

export interface PrefixGroupNode extends PrefixNode {
  children: Node[];
}

export type BuildCapture = 'fragment' | 'full';

export interface RenderedBuild {
  build: string[];
  total: number;
  wins: number;
  winrate: number;
}

export interface InputBfsOptions {
  MIN_TOTAL?: number;
  MAX_BRANCHES?: number;
}

export interface BfsOptions {
  MIN_TOTAL: number;
  MAX_BRANCHES: number;
}

export interface InputPrefixOptions {
  MIN_PROBABILITY?: number;
  MIN_TOTAL?: number;
}

export interface PrefixOptions {
  MIN_PROBABILITY: number;
  MIN_TOTAL: number;
}

export interface TreeContext {
  total: number;
}

export type WinrateSortable = RenderedBuild | PrefixGroupNode | PrefixQueueNode;
export type PlayrateSortable = PrefixGroupNode | PrefixQueueNode;
