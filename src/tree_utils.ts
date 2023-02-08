export const prune = (node: Node, minTotal: number) => {
  node.children = node.children.filter(child => child.value.total >= minTotal);
  node.children.forEach(child => prune(child, minTotal));
};

export interface PrefixGroupNode extends PrefixNode {
  children: Node[];
}

export const mergePrefixNodes = (group: PrefixGroupNode, context: TreeContext) => {
  if (group.children.length === 1) {
    const nextNode = group.children[0];
    if (group.prefix) {
      group.prefix += `,${nextNode.label}`;
    } else {
      group.prefix += nextNode.label;
    }
    group.total = nextNode.value.total;
    group.wins = nextNode.value.wins;
    group.probability = nextNode.value.total / context.total;
    group.winrate = nextNode.value.wins / nextNode.value.total;
    group.children = nextNode.children;
    mergePrefixNodes(group, context);
  }
};

export const mergeChildren = (node: Node) => {
  if (node.children.length === 1) {
    const nextNode = node.children[0];
    node.label += `,${nextNode.label}`;
    node.value = nextNode.value;
    node.children = nextNode.children;
    mergeChildren(node);
  } else {
    node.children.forEach(child => mergeChildren(child));
  }
};

type BuildCapture = 'fragment' | 'full';

interface RenderedBuild {
  build: string[];
  total: number;
  wins: number;
  winrate: number;
}

export const dfs = (node: Node, build: string[], results: RenderedBuild[], captureType: BuildCapture) => {
  const nodeBuildings = node.label.split(',');
  const newBuild = [...build, ...nodeBuildings];

  results.push({
    build: newBuild,
    total: node.value.total,
    wins: node.value.wins,
    winrate: node.value.wins / node.value.total,
  });

  node.children.forEach((child: Node) => dfs(child, newBuild, results, captureType));
  return results;
};

interface InputBfsOptions {
  MIN_TOTAL?: number;
  MAX_BRANCHES?: number;
}

interface BfsOptions {
  MIN_TOTAL: number;
  MAX_BRANCHES: number;
}

const defaultOpts = {
  MIN_TOTAL: 10,
  MAX_BRANCHES: 10,
};

export interface Count {
  total: number;
  wins: number;
  losses: number;
}

export interface Node {
  label: string;
  value: Count;
  children: Node[];
}

export interface PrefixNode {
  prefix: string;
  probability: number;
  winrate: number;
  total: number;
  wins: number;
}

interface PrefixQueueNode extends PrefixNode {
  node: Node;
}

export interface TreeContext {
  total: number;
}

export const renderPrefixes = (
  rootNode: Node,
  context: TreeContext,
  opts: InputBfsOptions = {},
) => {
  const renderOpts: BfsOptions = {...defaultOpts, ...opts};

  // should move this out of function
  // tree has much less branching for pool-first builds
  // lower max branches captures the openings much better
  if (rootNode.label === 'SpawningPool') {
    renderOpts.MAX_BRANCHES = 5;
  }

  const {MIN_TOTAL, MAX_BRANCHES} = renderOpts;

  let queue: PrefixQueueNode[] = [{
    node: rootNode,
    prefix: '',
    probability: rootNode.value.total / context.total,
    winrate: rootNode.value.wins / rootNode.value.total,
    total: rootNode.value.total,
    wins: rootNode.value.wins,
  }];
  let branches = 0;

  while (queue.length > 0 && branches <= MAX_BRANCHES) {
    const {node, prefix} = queue[0];

    if (
      node.children.length === 0 ||
      node.children.every(child => child.value.total < MIN_TOTAL)
    ) {
      queue.push({
        node,
        prefix,
        probability: node.value.total / context.total,
        winrate: node.value.wins / node.value.total,
        total: node.value.total,
        wins: node.value.wins,
      });
      branches += 1;
    }

    node.children.forEach(child => {
      if (child.value.total > MIN_TOTAL || child.children.length === 0) {
        queue.push({
          node: child,
          prefix: prefix ? `${prefix},${node.label}` : node.label,
          probability: child.value.total / context.total,
          winrate: child.value.wins / child.value.total,
          total: child.value.total,
          wins: child.value.wins,
        });
        branches += 1;
      }
    });

    queue = queue.slice(1);
  }

  return queue;
};

interface InputPrefixOptions {
  MIN_PROBABILITY?: number;
  MIN_TOTAL?: number;
}

interface PrefixOptions {
  MIN_PROBABILITY: number;
  MIN_TOTAL: number;
}

const defaultPrefixOpts = {MIN_PROBABILITY: 0.02, MIN_TOTAL: 25};

export const groupPrefixes = (prefixes: PrefixQueueNode[], context: TreeContext, opts: InputPrefixOptions = {}) => {
  const prefixOpts: PrefixOptions = {...defaultPrefixOpts, ...opts};
  const {MIN_PROBABILITY, MIN_TOTAL} = prefixOpts;
  
  const prefixGroups: Record<string, any> = {};
  prefixes.forEach((node) => {
    if (node.probability < MIN_PROBABILITY) {
      return;
    }

    const prefix = node.prefix;
    if (!prefixGroups[prefix]) {
      prefixGroups[prefix] = {
        children: [],
        winrate: 0,
        probability: 0,
        total: 0,
        wins: 0,
      };
    }

    prefixGroups[prefix].total += node.total;
    prefixGroups[prefix].wins += node.wins;
    prefixGroups[prefix].winrate = prefixGroups[prefix].wins / prefixGroups[prefix].total;
    prefixGroups[prefix].probability = prefixGroups[prefix].total / context.total;
    prefixGroups[prefix].children.push(node.node);
  });

  console.log('prefix groups', prefixGroups);

  const sortedPrefixes = Object.entries(prefixGroups).map(([prefix, nodes]) => ({
    prefix,
    ...nodes,
  })).filter(prefix => prefix.probability >= MIN_PROBABILITY);

  console.log('sorted prefixes', sortedPrefixes);

  sortedPrefixes.forEach((prefix) => {
    prefix.children = prefix.children.filter((node: Node) => node.value.total / context.total >= MIN_PROBABILITY);
    prefix.children.forEach((node: Node) => prune(node, MIN_TOTAL));

    mergePrefixNodes(prefix, context);
    prefix.children.forEach((node: Node) => mergeChildren(node));
  });

  return sortedPrefixes;
};

export const renderBuilds = (
  prefixes: PrefixGroupNode[],
  builds: RenderedBuild[] = [],
  captureType: BuildCapture = 'fragment',
) => {
  prefixes.forEach((prefix) => {
    const prefixBuild = prefix.prefix.split(',');
    builds.push({
      build: prefixBuild,
      total: prefix.total,
      wins: prefix.wins,
      winrate: prefix.winrate,
    });
    prefix.children.forEach((node: Node) => dfs(node, prefixBuild, builds, captureType));
  });
  return builds;
};

type WinrateSortable = RenderedBuild | PrefixGroupNode | PrefixQueueNode;
type PlayrateSortable = PrefixGroupNode | PrefixQueueNode;

export const winrateSort = (a: WinrateSortable, b: WinrateSortable) => b.winrate - a.winrate;
export const playrateSort = (a: PlayrateSortable, b: PlayrateSortable) => b.probability - a.probability;
export const nodeWinrateSort = (a: Node, b: Node) => (b.value.wins / b.value.total) - (a.value.wins / a.value.total);
export const nodePlayrateSort = (a: Node, b: Node) => b.value.total - a.value.total;
