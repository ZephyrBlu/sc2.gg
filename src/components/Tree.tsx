import {useRef} from 'react';
import './Tree.css';

export function Tree({ race, tree }) {
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

  let renderedBfs = {};
  const MAX_BRANCHES = 5;
  const MIN_TOTAL = 25;
  const renderNodesBfs = (node) => {
    let queue = [{node, prefix: ''}];
    let branches = 0;
    while (queue.length > 0 && branches < MAX_BRANCHES) {
      const {node, prefix} = queue[0];

      let newPrefix = `${prefix},${node.label}`;

      if (branches < MAX_BRANCHES) {
        node.children.forEach(child => {
          if (child.total > MIN_TOTAL) {
            queue.push({node: child, prefix: `${newPrefix},${child.label}`});
            branches += 1;
          }
        });
      }

      queue = queue.slice(1);
    }

    const dfs = (node, prefix, stack = [], offset = 0) => {
      if (node.label === '') {
        return;
      }

      const node_buildings = node.label.split(',');
      stack.push(...node_buildings);

      if (node.children.length === 0) {
        renderedBfs[prefix].push({offset, build: stack});
        return;
      }

       node.children.forEach(child => {
        dfs(child, prefix, [], stack.length + offset);
      });
    };

    console.log('queue', queue);
    queue.forEach(({node, prefix}) => {
      console.log('node, prefix', node, prefix);
      renderedBfs[prefix.slice(1)] = [];
      dfs(node, prefix.slice(1));
    });

    console.log('raw bfs', renderedBfs);
    renderedBfs = Object.entries(renderedBfs).map(([prefix, nodes]) => {
      const initialNode = {offset: 0, build: prefix.split(',')};
      return [initialNode, ...nodes];
    });
  };

  // tree.root.children.forEach(child => renderNodesDfs(child));
  tree.root.children.forEach(child => renderNodesBfs(child));

  console.log('bfs rendered', renderedBfs[0]);

  return (
    <div className="Tree">
      {renderedBfs[0].map(({ offset, build }) => (
        <div className="Tree__branch" style={{marginLeft: 50 * offset}}>
          {/* {offset !== 0 &&
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="Tree__arrow"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>} */}
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
  );
}