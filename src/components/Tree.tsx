import './Tree.css';

export function Tree({ race, tree }){  
  const rendered = [];
  const renderNodes = (node, stack = [], offset = 0) => {
    if (node.label === '') {
      return;
    }

    const node_buildings = node.label.split(',');
    stack.push(...node_buildings);

    if (node.children.length === 0) {
      rendered.push({offset, build: stack});
      return;
    }
    renderNodes(node.children[0], [...stack], offset);
    node.children.slice(1).forEach(child => renderNodes(child, [], stack.length + offset));
    
    // node.children.forEach(child => renderNodes(child, [], stack.length + offset));
  }

  tree.root.children.forEach(child => renderNodes(child));

  return (
    <div className="Tree">
      {rendered.map(({ offset, build }) => (
        <div className="Tree__branch" style={{marginLeft: (50 * offset) - 20}}>
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