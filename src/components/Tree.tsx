import {useState} from 'react';
import {Node, tryReparentPrefix, tryReparentNode, prune, dfs, renderPrefixes} from '../tree_utils';
import './Tree.css';

type SortBy = 'playrate' | 'winrate';
const sortTypes: SortBy[] = ['playrate', 'winrate'];

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

export function Tree({ race, opponentRace, tree }) {
  // console.log('tree', race, opponentRace, tree);
  const [sortBy, setSortBy] = useState<SortBy>('playrate');
  const [showSorting, setShowSorting] = useState<boolean>(false);

  // Zerg has less branching in their builds than other races
  // higher max branches makes openings too granular
  let MAX_BRANCHES = 15;
  let MIN_TOTAL = 10;

  if (race === 'Protoss') {
    MIN_TOTAL = 25;

    if (opponentRace !== 'Protoss') {
      MAX_BRANCHES = 25;
    }
  }

  if (race === 'Zerg') {
    MAX_BRANCHES = 10;
  }

  if (race === 'Terran') {
    MAX_BRANCHES = 30;
    MIN_TOTAL = 25;

    if (opponentRace === 'Terran') {
      MAX_BRANCHES = 15;
    }
  }

  let queues = tree.root.children.map((child: Node) => (
    renderPrefixes(
      child,
      [],
      {total: tree.root.total.total},
      {MIN_TOTAL, MAX_BRANCHES},
    )
  )).flat();
  console.log('queues', queues);

  queues.sort((a, b) => b.probability - a.probability);

  const prefixGroups: Record<string, any> = {};
  queues.forEach((queue) => {
    const prefix = queue.prefix;

    if (!prefixGroups[prefix]) {
      prefixGroups[prefix] = {
        nodes: [],
        winrate: 0,
        probability: 0,
        total: 0,
        wins: 0,
      };
    }

    prefixGroups[prefix].total += queue.total;
    prefixGroups[prefix].wins += queue.wins;
    prefixGroups[prefix].winrate = prefixGroups[prefix].wins / prefixGroups[prefix].total;
    prefixGroups[prefix].probability = prefixGroups[prefix].total / tree.root.total.total;
    prefixGroups[prefix].nodes.push(queue.node);
  });

  const MIN_PROBABILITY = 0.02;

  const sortedPrefixes = Object.entries(prefixGroups).map(([prefix, nodes]) => ({
    prefix,
    ...nodes,
  })).filter(prefix => prefix.probability >= MIN_PROBABILITY);

  sortedPrefixes.forEach((prefix) => {
    prefix.nodes = prefix.nodes.filter((node: Node) => node.total.total / tree.root.total.total >= MIN_PROBABILITY);
    prefix.nodes.forEach((node: Node) => prune(node));

    tryReparentPrefix(prefix);
    prefix.nodes.forEach((node: Node) => tryReparentNode(node));
  });

  const renderedFragments: any[] = [];

  sortedPrefixes.forEach((prefix) => {
    const prefixBuild = prefix.prefix.slice(1).split(',');
    renderedFragments.push({
      build: prefixBuild,
      total: prefix.total,
      wins: prefix.wins,
      winrate: prefix.winrate,
    });
    prefix.nodes.forEach((node: Node) => dfs(node, prefixBuild, renderedFragments, 'fragment'));
  });
  renderedFragments.sort((a, b) => b.winrate - a.winrate);
  console.log('top winrate fragments', race, opponentRace, renderedFragments);

  if (sortBy === 'playrate') {
    sortedPrefixes.sort((a, b) => b.probability - a.probability);
  } else {
    sortedPrefixes.sort((a, b) => b.winrate - a.winrate);
  }
  const prefixCoverage = sortedPrefixes.reduce((total, current) => total + current.probability, 0)
  console.log('prefix coverage', prefixCoverage);
  console.log('matching prefixes', sortedPrefixes);

  const renderGroupedChildren = (rootNode: any, node: any) => {
    const prefixBuildings = rootNode.prefix.slice(1).split(',');
    prefixBuildings.push(...node.label.split(','));
    const newRoot = {...rootNode};
    newRoot.prefix = `,${prefixBuildings.join(',')}`;

    if (sortBy === 'playrate') {
      node.children.sort((a, b) => b.total.total - a.total.total);
    } else {
      node.children.sort((a, b) => (b.total.wins / b.total.total) - (a.total.wins / a.total.total));
    }

    const groupOpenings = node.children.map((child: Node) => {
      const nodeBuildings = child.label.split(',');
      const buildings = [...prefixBuildings, ...nodeBuildings];

      return (
        <>
          <div className="Tree Tree--grouped">
            <div className="Tree__header">
              <div className="Tree__modifiers Tree__modifiers--secondary">
                <div className="Tree__modifier Tree__modifier--secondary">
                  {Math.round((child.total.wins / child.total.total) * 1000) / 10}% winrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {Math.round((child.total.total / tree.root.total.total) * 1000) / 10}% playrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {child.total.total} games
                </div>
              </div>
            </div>
            <div className="Tree__prefix">
              {buildings.map((building, index) => (
                <div className="Tree__building">
                  <img
                    alt={building}
                    title={building}
                    className="Tree__building-icon"
                    src={`/images/buildings/${race}/${building}.png`}
                  />
                  {buildings.length - 1 !== index &&
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
            </div>
            {child.children.length > 0 &&
              <details className="Tree__grouped-children">
                <summary className="Tree__group-toggle">
                  Show {child.children.length} Follow-ups
                </summary>
                {renderGroupedChildren(newRoot, child)}
              </details>}
          </div>
          <hr className="Builds__cluster-divider Builds__cluster-divider--tree" />
        </>
      );
    });

    return groupOpenings;
  };

  const grouped = sortedPrefixes.map((rootNode) => {
    const prefixBuildings = rootNode.prefix.slice(1).split(',');

    if (sortBy === 'playrate') {
      rootNode.nodes.sort((a, b) => b.total.total - a.total.total);
    } else {
      rootNode.nodes.sort((a, b) => (b.total.wins / b.total.total) - (a.total.wins / a.total.total));
    }

    const groupOpenings = rootNode.nodes.map((node: Node) => {
      const nodeBuildings = node.label.split(',');
      const buildings = [...prefixBuildings, ...nodeBuildings];

      return (
        <div className="Tree Tree--grouped">
          <div className="Tree__header">
            <div className="Tree__modifiers Tree__modifiers--secondary">
              <div className="Tree__modifier Tree__modifier--secondary">
                {Math.round((node.total.wins / node.total.total) * 1000) / 10}% winrate
              </div>
              <div className="Tree__modifier Tree__modifier--secondary">
                {Math.round((node.total.total / tree.root.total.total) * 1000) / 10}% playrate
              </div>
              <div className="Tree__modifier Tree__modifier--secondary">
                {node.total.total} games
              </div>
            </div>
          </div>
          <div className="Tree__prefix">
            {buildings.map((building, index) => (
              <div className="Tree__building">
                <img
                  alt={building}
                  title={building}
                  className="Tree__building-icon"
                  src={`/images/buildings/${race}/${building}.png`}
                />
                {buildings.length - 1 !== index &&
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
          </div>
          {node.children.length > 0 &&
            <details className="Tree__grouped-children">
              <summary className="Tree__group-toggle">
                Show {node.children.length} Follow-ups
              </summary>
              {renderGroupedChildren(rootNode, node)}
            </details>}
        </div>
      );
    });

    return (
      <>
        <div className="Tree__group">
          <div className="Tree__group-header">
            <div className="Tree__header">
              <div className="Tree__modifiers Tree__modifiers--secondary">
                <div className="Tree__modifier Tree__modifier--secondary">
                  {Math.round((rootNode.wins / rootNode.total) * 1000) / 10}% winrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {Math.round((rootNode.total / tree.root.total.total) * 1000) / 10}% playrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {rootNode.total} games
                </div>
              </div>
            </div>
            <div className="Tree__prefix">
              {prefixBuildings.map((building, index) => (
                <div className="Tree__building">
                  <img
                    alt={building}
                    title={building}
                    className="Tree__building-icon"
                    src={`/images/buildings/${race}/${building}.png`}
                  />
                  {prefixBuildings.length - 1 !== index &&
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
            </div>
          </div>
          {groupOpenings.length > 0 &&
            <details className="Tree__openings">
              <summary className="Tree__group-toggle">
                Show {groupOpenings.length} Follow-ups
              </summary>
              {groupOpenings}
            </details>}
        </div>
        <hr className="Builds__cluster-divider Builds__cluster-divider--tree" />
      </>
    );
  });

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
      <div className="Tree__modifiers">
        <span className="Tree__modifier">
          {Math.round((tree.root.total.wins / tree.root.total.total) * 1000) / 10}% winrate
        </span>
        <span className="Tree__modifier">
          {Math.ceil(prefixCoverage * 100)}% game coverage
        </span>
        <span className="Tree__modifier">
          {tree.root.total.total} games
        </span>
      </div>
      <details open={showSorting}>
        <summary
          className="Tree__sorting Search__selected-search-type"
          onClick={() => setShowSorting(prevState => !prevState)}
        >
          Sorting by {capitalize(sortBy)}
        </summary>
        <div className="Search__search-type-selection-dropdown Search__search-type-selection-dropdown--tree">
          {sortTypes.map(sortType => (
            <span className="Search__search-type-option">
              <input
                type="radio"
                id={`tree-${race.toLowerCase()}-${opponentRace.toLowerCase()}-${sortType}`}
                className="Search__search-type-checkbox"
                name="tree-sorting"
                checked={sortBy === sortType}
                onClick={() => {
                  setSortBy(sortType);
                  setShowSorting(false);
                }}
              />
              <label
                className="Search__search-type-label"
                for={`tree-${race}-${sortType}`}
              >
                {capitalize(sortType)}
              </label>
            </span>
          ))}
        </div>
      </details>
      {grouped}
    </div>
  );
}
