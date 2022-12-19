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

    if (node.children.length === 0) {
      if (stack.length + offset >= 5) {
        renderedDfs.push({offset, build: stack});
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
  const MIN_TOTAL = 25;
  const renderNodesBfs = (node, mode = 'tree') => {
    let queue = [{node, prefix: ''}];
    let branches = 0;
    while (queue.length > 0 && branches < MAX_BRANCHES) {
      const {node, prefix} = queue[0];

      if (branches < MAX_BRANCHES) {
        node.children.forEach(child => {
          if (child.total > MIN_TOTAL) {
            queue.push({node: child, prefix: `${prefix},${node.label}`});
            branches += 1;
          }
        });
      }

      queue = queue.slice(1);
    }

    const dfs = (node, prefix, stack = [], offset = 0, mode = 'tree') => {
      if (node.label === '') {
        return;
      }

      const node_buildings = node.label.split(',');
      stack.push(...node_buildings);

      if (mode === 'tree') {
        renderedBfs[renderedBfs.length -1].push({offset: prefix.split(',').length + offset, build: node_buildings});
      }

      if (mode === 'flat' && node.children.length === 0) {
        renderedBfs[renderedBfs.length - 1].push({offset: prefix.split(',').length, build: stack});
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
    queue.forEach(({node, prefix}) => {
      const build = prefix.slice(1).split(',');
      renderedBfs.push([{offset: 0, build}]);
      dfs(node, prefix.slice(1), [], 0, mode);
    });
  };

  // tree.root.children.forEach(child => renderNodesDfs(child));
  tree.root.children.forEach(child => renderNodesBfs(child, 'tree'));

  console.log('bfs rendered', renderedBfs);
  console.log('queue', queues.current);

  const flat = renderedBfs.map((tree) => (
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
    console.log('node', node);

    return (
      node.children.map((child) => (
        <div className="Tree__branch" style={{marginLeft: 50 * offset}}>
          <details>
              <summary className="Tree__branch-summary">
                {child.label.split(',').map((building) => (
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
              </summary>
              {renderChildren(child, 1)}
            </details>
        </div>
      ))
    );
  };

  return queues.current.map(queue => {
    const prefix = queue.prefix.slice(1).split(',')

    return (
      <div className="Tree">
        <div className="Tree__prefix">
          {prefix.map(building => (
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
        {renderChildren(queue.node, prefix.length)}
      </div>
    );
  });
}