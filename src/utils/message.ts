export const generateMessage = (
  move: number,
  player1: string,
  player2: string,
  stake: number,
  randomValue: string
) =>
  `Committing to move ${move} in a game between ${player1} and ${player2} for ${stake} ETH. Random value for safety: ${randomValue}`;
