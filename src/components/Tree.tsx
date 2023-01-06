import {useRef} from 'react';
import './Tree.css';

export function Tree({ race, oppRace, tree }) {
  const queues = useRef([]);
  console.log('race/tree', race, oppRace, tree);

  const renderedDfs = [];
  const renderNodesDfs = (
    node,
    stack = [],
    offset = 0,
  ) => {
    if (node.label === '') {
      return;
    }

    const node_buildings = node.label.split(',');
    stack.push(...node_buildings);
    const probability = node.total / tree.root.total;

    if (node.children.length === 0) {
      if (stack.length + offset >= 5) {
        renderedDfs.push({
          offset,
          build: stack,
          probability,
        });
      }
      return;
    }

    // node.children.forEach(child => {
    //   renderNodes(child, [], stack.length + offset, prefix);
    // });

    // renderNodes(node.children[0], [...stack], offset, prefix);
    node.children.slice(0).forEach(child => renderNodesDfs(child, [...stack], offset));
  };

  const renderedBfs: any[] = [];

  const MAX_BRANCHES = 10;
  const MIN_TOTAL = 10;
  const renderNodesBfs = (rootNode, mode = 'tree') => {
    let queue = [{node: rootNode, prefix: '', probability: rootNode.total / tree.root.total}];
    let branches = 0;
    while (queue.length > 0 && branches <= MAX_BRANCHES) {
      const {node, prefix} = queue[0];

      node.children.forEach(child => {
        if (child.total > MIN_TOTAL) {
          queue.push({
            node: child,
            prefix: `${prefix},${node.label}`,
            probability: child.total / tree.root.total,
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
      const probability = node.total / tree.root.total;

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

    queues.current = [...queue];
    let queueTotalProbability = 0;
    queue.forEach(({node, prefix, probability}) => {
      queueTotalProbability += probability;
      const build = prefix.slice(1).split(',');
      if (mode === 'flat') {
        build.push(...node.label.split(','));
      }
      renderedBfs.push([{offset: 0, build, probability}]);
      dfs(node, prefix.slice(1), [], 0, mode);
    });
    // setBranchCoverage(queueTotalProbability);
  };

  // tree.root.children.forEach(child => renderNodesDfs(child));
  const renderType = 'tree';
  tree.root.children.forEach(child => renderNodesBfs(child, renderType));

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
            {Math.ceil((child.total / node.total) * 100)}%, {child.total}
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

  console.log('queues', queues.current);

  queues.current.sort((a, b) => b.probability - a.probability);
  const nested = queues.current.map(rootNode => {
    const prefix = rootNode.prefix.slice(1).split(',');
    prefix.push(...rootNode.node.label.split(','));

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
          {Math.ceil(rootNode.probability * 100)}%, {rootNode.node.total}
        </div>
        {/* {renderChildren(rootNode.node, prefix.length)} */}
      </div>
    );
  });

  return renderType === 'flat' ? expanded : nested;
}