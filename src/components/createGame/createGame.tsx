"use client";

import { FC, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import useCreateGame from "@/hooks/useCreateGame";
import useGames from "@/hooks/useGames";

enum Move {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
  Spock = 4,
  Lizard = 5,
}

const CreateGame: FC = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const [player2, setPlayer2] = useState<string>("");
  const [stake, setStake] = useState<number>(0.01);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { isDeploying, deployGame } = useCreateGame();
  const { userGame } = useGames();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deployGame({
      move: selectedMove,
      player1: address!,
      player2: player2,
      stake: stake,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer2(e.target.value);
    setIsValidAddress(isAddress(e.target.value) && e.target.value !== address);
  };

  const moveOptions = useMemo(
    () =>
      Object.keys(Move)
        .filter((key) => isNaN(Number(key))) // Do not display the numeric keys
        .map((key) => (
          <option key={key} value={Move[key as keyof typeof Move]}>
            {key}
          </option>
        )),
    []
  );

  return (
    <div>
      <h1>Create Game</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="move">Move:</label>
          <select
            id="move"
            name="move"
            value={selectedMove}
            onChange={(e) => setSelectedMove(Number(e.target.value) as Move)}
            disabled={userGame}
          >
            {moveOptions}
          </select>
        </div>

        <div>
          <label htmlFor="player2">Player 2:</label>
          <input
            id="player2"
            type="text"
            value={player2}
            onChange={handleAddressChange}
            placeholder="Player 2 address"
            required
            disabled={userGame}
          />
          {player2 && !isValidAddress && <p>Please enter a valid address</p>}
        </div>

        <div>
          <label htmlFor="stake">Stake:</label>
          <input
            id="stake"
            type="number"
            min="0"
            step="0.01"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            placeholder="Enter ETH stake amount"
            required
            disabled={userGame}
          />
        </div>

        <button
          type="submit"
          disabled={
            isDeploying ||
            !isConnected ||
            !isValidAddress ||
            stake <= 0 ||
            !!userGame
          }
        >
          {isDeploying ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateGame;
