export const simulate = (playerTree: any, opponentTree: any) => {
  const playerPath: any = [];
  const opponentPath: any = [];

  let currentPlayerNode = playerTree.root;
  let currentOpponentNode = opponentTree.root;

  while (true) {
    playerPath.push(currentPlayerNode);
    opponentPath.push(currentOpponentNode);

    const nextPlayerNode = selectNextNode(currentPlayerNode);
    const nextOpponentNode = selectNextNode(currentOpponentNode);
  
    const anyTerminated = [nextPlayerNode, nextOpponentNode].some(res => res.terminated);
    if (anyTerminated) {
      return {
        player: playerPath,
        opponent: opponentPath,
        winner: selectWinner(currentPlayerNode, currentOpponentNode),
      };
    }

    currentPlayerNode = nextPlayerNode.node;
    currentOpponentNode = nextOpponentNode.node;
  }
};

const selectNextNode = (node: any) => {
  const roll = generateRoll();
  const total = node.value.total;

  let sum = 0;
  for (const child of node.children) {
    if (child.value.total < 10) {
      continue;
    }

    const childPercentage = child.value.total / total;
    sum += childPercentage;

    if (sum > roll) {
      return {
        node: child,
        terminated: false,
      };
    }
  }

  return {
    node: null,
    terminated: true,
  };
};

const selectWinner = (playerNode: any, opponentNode: any) => {
  const playerNodeWinrate = playerNode.value.wins / playerNode.value.total;
  const opponentNodeWinrate = opponentNode.value.wins / opponentNode.value.total;

  const normalizationFactor = 1 / (playerNodeWinrate + opponentNodeWinrate);

  const normalizedPlayerWinrate = playerNodeWinrate * normalizationFactor;
  const normalizedOpponentWinrate = opponentNodeWinrate * normalizationFactor;

  const winrates = [
    {
      value: normalizedPlayerWinrate,
      name: 'player',
    },
    {
      value: normalizedOpponentWinrate,
      name: 'opponent',
    },
  ];
  const roll = generateRoll();
  let sum = 0;
  for (const winrate of winrates) {
    sum += winrate.value
    if (sum > roll) {
      return winrate.name;
    }
  }

  return winrates[winrates.length - 1].name;
};

const generateRoll = () => {
  return Math.random();
};
