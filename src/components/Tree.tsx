import './Tree.css';

export function Tree({ race, oppRace, tree }){
  console.log('tree', race, oppRace, tree);
  
  const rendered = [];
  const renderNodes = (node, stack = [], offset = 0) => {
    if (node.label === '') {
      return;
    }

    const node_buildings = node.label.split(',');
    stack.push(...node_buildings);
    // rendered.push({offset, build: stack});
    // console.log('pushing fragment', node_buildings);

    if (node.children.length === 0) {
      rendered.push({offset, build: stack});
      return;
    }
    renderNodes(node.children[0], [...stack], offset);
    node.children.slice(1).forEach(child => renderNodes(child, [], stack.length + offset));
    
    // node.children.forEach(child => renderNodes(child, [], stack.length + offset));
  }

  tree.root.children.forEach(child => renderNodes(child));
  console.log('rendered trees', rendered);

  return (
    <div className="Tree">
      {rendered.map(({ offset, build }) => (
        <div className="Tree__branch" style={{marginLeft: 30 * offset}}>
          {build.map((building) => (
            <img
              alt={building}
              title={building}
              className="Tree__building-icon"
              src={`/images/buildings/${race}/${building}.png`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}