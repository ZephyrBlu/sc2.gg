export const prune = (node: Node) => {
  node.children = node.children.filter(child => child.total.total >= 25);
  node.children.forEach(child => prune(child));
};

export const mergePrefixNodes = (node: any) => {
  if (node.nodes.length === 1) {
    const nextNode = node.nodes[0];
    node.prefix += `,${nextNode.label}`;
    node.nodes = nextNode.children;
    mergePrefixNodes(node);
  }
};

export const mergeChildren = (node: Node) => {
  if (node.children.length === 1) {
    const nextNode = node.children[0];
    node.label += `,${nextNode.label}`;
    node.children = nextNode.children;
    mergeChildren(node);
  } else {
    node.children.forEach(child => mergeChildren(child));
  }
};

export const dfs = (node: Node, build: any[], results: any[], capture: 'fragment' | 'full') => {
  const nodeBuildings = node.label.split(',');
  const newBuild = [...build, ...nodeBuildings];

  results.push({
    build: newBuild,
    total: node.total.total,
    wins: node.total.wins,
    winrate: node.total.wins / node.total.total,
  });

  node.children.forEach((child: Node) => dfs(child, newBuild, results, capture));
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
}

export interface Node {
  label: string;
  total: Count;
  value: Count;
  children: Node[];
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

  let queue = [{
    node: rootNode,
    prefix: '',
    probability: rootNode.total.total / context.total,
    winrate: rootNode.total.wins / rootNode.total.total,
    total: rootNode.total.total,
    wins: rootNode.total.wins,
  }];
  let branches = 0;
  while (queue.length > 0 && branches <= MAX_BRANCHES) {
    const {node, prefix} = queue[0];

    if (
      node.children.length === 0 ||
      node.children.every(child => child.total.total < MIN_TOTAL)
    ) {
      queue.push({
        node,
        prefix,
        probability: node.total.total / context.total,
        winrate: node.total.wins / node.total.total,
        total: node.total.total,
        wins: node.total.wins,
      });
      branches += 1;
    }

    node.children.forEach(child => {
      if (child.total.total > MIN_TOTAL || child.children.length === 0) {
        queue.push({
          node: child,
          prefix: `${prefix},${node.label}`,
          probability: child.total.total / context.total,
          winrate: child.total.wins / child.total.total,
          total: child.total.total,
          wins: child.total.wins,
        });
        branches += 1;
      }
    });

    queue = queue.slice(1);
  }

  return queue;
};
