import {useState} from 'react';
import {
  Node,
  PrefixGroupNode,
  groupPrefixes,
  renderPrefixes,
  renderBuilds,
  winrateSort,
  playrateSort,
  nodeWinrateSort,
  nodePlayrateSort,
} from '../tree_utils';
import type { Race } from './BlockResults';
import './Tree.css';

type SortBy = 'playrate' | 'winrate';
const sortTypes: SortBy[] = ['playrate', 'winrate'];

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

interface Props {
  race: Race;
  opponentRace: Race;
  tree: any;
}

export function Tree({ race, opponentRace, tree }: Props) {
  console.log('tree', race, opponentRace, tree);
  const [sortBy, setSortBy] = useState<SortBy>('playrate');
  const [showSorting, setShowSorting] = useState<boolean>(false);

  // Zerg has less branching in their builds than other races
  // higher max branches makes openings too granular
  let MAX_BRANCHES = 15;
  let MIN_TOTAL = 10;
  let MIN_PROBABILITY = 0.02;

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
      MIN_PROBABILITY = 0.01;
    }
  }

  let queues = tree.root.children.map((child: Node) => (
    renderPrefixes(
      child,
      {total: tree.root.value.total},
      {MIN_TOTAL, MAX_BRANCHES},
    )
  )).flat();
  queues.sort(playrateSort);

  let prefixOpts = {MIN_PROBABILITY};
  const sortedPrefixes = groupPrefixes(queues, {total: tree.root.value.total}, prefixOpts);
  const renderedFragments = renderBuilds(sortedPrefixes);
  renderedFragments.sort(winrateSort);
  console.log('top winrate fragments', race, opponentRace, renderedFragments);
  console.log('matching prefixes', sortedPrefixes);

  const prefixCoverage = sortedPrefixes.reduce((total, current) => total + current.probability, 0)
  const prefixGames = sortedPrefixes.reduce((total, current) => total + current.total, 0);
  console.log('prefix coverage', prefixCoverage, prefixGames);

  if (sortBy === 'playrate') {
    sortedPrefixes.sort(playrateSort);
  } else {
    sortedPrefixes.sort(winrateSort);
  }

  const renderGroupedChildren = (rootNode: PrefixGroupNode, node: Node) => {
    const prefixBuildings = rootNode.prefix.split(',');
    prefixBuildings.push(...node.label.split(','));
    const newRoot = {...rootNode};
    newRoot.prefix = `${prefixBuildings.join(',')}`;

    if (sortBy === 'playrate') {
      node.children.sort(nodePlayrateSort);
    } else {
      node.children.sort(nodeWinrateSort);
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
                  {Math.round((child.value.wins / child.value.total) * 1000) / 10}% winrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {Math.round((child.value.total / tree.root.value.total) * 1000) / 10}% playrate
                </div>
                <div className="Tree__modifier Tree__modifier--secondary">
                  {child.value.total} games
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
    const prefixBuildings: string[] = rootNode.prefix.split(',');

    if (sortBy === 'playrate') {
      rootNode.children.sort(nodePlayrateSort);
    } else {
      rootNode.children.sort(nodeWinrateSort);
    }

    const groupOpenings = rootNode.children.map((node: Node) => {
      const nodeBuildings = node.label.split(',');
      const buildings = [...prefixBuildings, ...nodeBuildings];

      return (
        <div className="Tree Tree--grouped">
          <div className="Tree__header">
            <div className="Tree__modifiers Tree__modifiers--secondary">
              <div className="Tree__modifier Tree__modifier--secondary">
                {Math.round((node.value.wins / node.value.total) * 1000) / 10}% winrate
              </div>
              <div className="Tree__modifier Tree__modifier--secondary">
                {Math.round((node.value.total / tree.root.value.total) * 1000) / 10}% playrate
              </div>
              <div className="Tree__modifier Tree__modifier--secondary">
                {node.value.total} games
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
                  {Math.round((rootNode.total / tree.root.value.total) * 1000) / 10}% playrate
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
          {Math.round((tree.root.value.wins / tree.root.value.total) * 1000) / 10}% winrate
        </span>
        <span className="Tree__modifier">
          {Math.ceil(prefixCoverage * 100)}% game coverage
        </span>
        <span className="Tree__modifier">
          {tree.root.value.total} games
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
