import { FC, useState } from "react";
import styles from "@/app/page.module.css";
import MoveSelector from "@/components/common/moveSelector";
import useActiveGame from "@/hooks/useActiveGame";
import { Move } from "@/model/move";

const Player1SolveForm: FC = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const { isActionPending, solveTxError, solve } = useActiveGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solve(selectedMove);
  };

  return (
    <div className={styles.actionContainer}>
      <h2>Solve the game</h2>
      <form
        className={`${styles.actionForm} ${isActionPending && styles.loading}`}
        onSubmit={handleSubmit}
      >
        <MoveSelector value={selectedMove} onChange={setSelectedMove} />
        <button type="submit" disabled={isActionPending}>
          {isActionPending ? "Solving..." : "Solve"}
        </button>
      </form>
      {solveTxError && <b>{solveTxError}</b>}
    </div>
  );
};

export default Player1SolveForm;
