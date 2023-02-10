import type {Race} from '../../components/types';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function findOpponentRace(identifier: string, race: string) {
  const opponentRace = identifier
    .split('__')[0]
    .split('-')[1]
    .split(',')
    .find(identifierRace => identifierRace !== capitalize(race));
  return opponentRace || capitalize(race);
}

const RACES = ['Protoss', 'Terran', 'Zerg'];
const generateRaceTree = (race: string, trees: any) => {
  let raceTrees: Partial<Record<Race, any>> = {};
  Object.entries(trees).forEach(([identifier, tree]) => {
    if (capitalize(race) === identifier.split('-')[0]) {
      const opponentRace = findOpponentRace(identifier, race) as Race;
      raceTrees[opponentRace!] = tree;
    }
  });

  return {[race]: raceTrees};
}

export const generateMatchupTrees = (trees: any) => {
  const matchupTrees = RACES.map(race => generateRaceTree(race, trees));
  const mappedTrees = matchupTrees.reduce((allTrees, currentTree) => ({
    ...allTrees,
    ...currentTree,
  }), {});

  return mappedTrees;
}
