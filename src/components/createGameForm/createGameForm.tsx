import { FC, useState } from "react";
import styles from "@/app/page.module.css";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import useCreateGame from "@/hooks/useCreateGame";
import { Move } from "@/model/move";
import MoveSelector from "../common/moveSelector";

const CreateGameForm: FC = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const [player2, setPlayer2] = useState<string>("");
  const [stake, setStake] = useState<number>(0.01);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);

  const { address } = useAccount();
  const { isDeploying, deployGame } = useCreateGame();

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

  return (
    <div className={styles.actionContainer}>
      <h2>Create Game</h2>
      <form
        className={`${styles.actionForm} ${isDeploying && styles.loading}`}
        onSubmit={handleSubmit}
      >
        <MoveSelector value={selectedMove} onChange={setSelectedMove} />

        <div>
          <label htmlFor="player2">Player 2:</label>
          <input
            id="player2"
            type="text"
            value={player2}
            onChange={handleAddressChange}
            placeholder="Player 2 address"
            required
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
          />
        </div>

        <button
          type="submit"
          disabled={isDeploying || !isValidAddress || stake <= 0}
        >
          {isDeploying ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateGameForm;
