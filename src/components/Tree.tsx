import './Tree.css';

export function Tree({ race, opponentRace, tree }) {
  let queues: any[] = [];
  const renderedBfs: any[] = [];

  const MAX_BRANCHES = 15;
  const MIN_TOTAL = 10;
  const renderNodesBfs = (rootNode, mode = 'tree') => {
    let queue = [{node: rootNode, prefix: '', probability: rootNode.total.total / tree.root.total.total}];
    let branches = 0;
    while (queue.length > 0 && branches <= MAX_BRANCHES) {
      const {node, prefix} = queue[0];

      if (node.children.length === 0) {
        queue.push({
          node,
          prefix,
          probability: node.total.total / tree.root.total.total,
        });
        branches += 1;
      }

      node.children.forEach(child => {
        if (child.total.total > MIN_TOTAL || child.children.length === 0) {
          queue.push({
            node: child,
            prefix: `${prefix},${node.label}`,
            probability: child.total.total / tree.root.total.total,
          });
          branches += 1;
        }
      });

      queue = queue.slice(1);
    }

    const dfs = (node, prefix, stack = [], offset = 0, mode = 'tree') => {
      if (node.label === '') {
        return;
      }

      const node_buildings = node.label.split(',');
      stack.push(...node_buildings);
      const probability = node.total.total / tree.root.total.total;

      if (mode === 'tree') {
        renderedBfs[renderedBfs.length - 1].push({
          offset: prefix.split(',').length + offset,
          build: node_buildings,
          probability,
        });
      }

      if (mode === 'flat' && node.children.length === 0) {
        renderedBfs[renderedBfs.length - 1].push({
          offset: prefix.split(',').length + 1,
          build: stack.slice(1),
          probability,
        });
        return;
      }

      node.children.forEach((child) => {
        let newStack;
        let newOffset;

        if (mode === 'tree') {
          newStack = [];
          newOffset = stack.length + offset;
        }

        if (mode === 'flat') {
          newStack = [...stack];
          newOffset = 0;
        }

        dfs(child, prefix, newStack, newOffset, mode);
      });
    };

    if (queue.length === 0) {
      return [];
    }

    queues = [...queues, ...queue];
    queue.forEach(({node, prefix, probability}) => {
      const build = prefix.slice(1).split(',');
      if (mode === 'flat') {
        build.push(...node.label.split(','));
      }
      renderedBfs.push([{offset: 0, build, probability}]);
      dfs(node, prefix.slice(1), [], 0, mode);
    });
  };

  const renderChildren = (node, offset = 0) => {
    return (
      node.children.map((child) => (
        <div className="Tree__branch" style={{marginLeft: 50 * (offset + 0.5)}}>
          <div className="Tree__branch-parent">
            {child.label.split(',').map((building, index) => (
              <div className="Tree__building">
                <img
                  alt={building}
                  title={building}
                  className="Tree__building-icon"
                  src={`/images/buildings/${race}/${building}.png`}
                />
                {child.label.split(',').length - 1 !== index &&
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="Tree__arrow"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>}
              </div>
            ))}
            {Math.round((child.total.total / node.total.total) * 1000) / 10}%, {child.total.total}
          </div>
          {child.children.length > 0 &&
            <details className="Tree__branch-children">
              <summary className="Tree__branch-summary" />
              {renderChildren(child)}
            </details>}
        </div>
      ))
    );
  };

  const renderType = 'tree';
  tree.root.children.forEach(child => renderNodesBfs(child, renderType));

  queues.sort((a, b) => b.probability - a.probability);
  const top = queues.slice(0, 10);

  let coverage = 0;
  const nested = top.map(rootNode => {
    const prefix = rootNode.prefix ? rootNode.prefix.slice(1).split(',') : [];
    prefix.push(...rootNode.node.label.split(','));

    coverage += rootNode.probability;

    return (
      <div className="Tree">
        <div className="Tree__prefix">
          {prefix.map((building, index) => (
            <div className="Tree__building">
              <img
                alt={building}
                title={building}
                className="Tree__building-icon"
                src={`/images/buildings/${race}/${building}.png`}
              />
              {prefix.length - 1 !== index &&
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="Tree__arrow"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>}
            </div>
          ))}
          {Math.round(rootNode.probability * 1000) / 10}%, {Math.round((rootNode.node.total.wins / rootNode.node.total.total) * 1000) / 10}%
        </div>
        {/* {renderChildren(rootNode.node, prefix.length)} */}
      </div>
    );
  });

  const expanded = renderedBfs.map((tree) => (
    <div className="Tree">
      {tree.map(({ offset, build }) => (
        <div className="Tree__branch" style={{marginLeft: 50 * offset}}>
          {build.map((building) => (
            <div className="Tree__building">
              <img
                alt={building}
                title={building}
                className="Tree__building-icon"
                src={`/images/buildings/${race}/${building}.png`}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="Tree__arrow"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          ))}
        </div>
      ))}
    </div>
  ));

  const rendered = renderType === 'flat' ? expanded : nested;

  return (
    <div className="Builds__opponent-race-builds">
      <div className="Builds__race-header">
        <h2 className="Builds__race">
          vs {opponentRace}
        </h2>
        <img
          src={`/icons/${opponentRace.toLowerCase()}-logo.svg`}
          className={`
            Builds__race-icon-opponent
            ${opponentRace.toLowerCase() === 'protoss' ? 'Builds__race-icon-opponent--protoss' : ''}
          `}
          alt={opponentRace}
        />
      </div>
      <details>
        <summary>
          Show build tree
        </summary>
        {rendered}
      </details>
    </div>
  );
}
