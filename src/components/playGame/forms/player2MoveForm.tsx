import { FC, useState } from "react";
import styles from "@/app/page.module.css";
import MoveSelector from "@/components/common/moveSelector";
import useActiveGame from "@/hooks/useActiveGame";
import { Move } from "@/model/move";

const Player2MoveForm: FC = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const { playTxError, isActionPending, play } = useActiveGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    play(selectedMove);
  };

  return (
    <div className={styles.actionContainer}>
      <h2>Play your move</h2>
      <form
        className={`${styles.actionForm} ${isActionPending && styles.loading}`}
        onSubmit={handleSubmit}
      >
        <MoveSelector value={selectedMove} onChange={setSelectedMove} />
        <button type="submit" disabled={isActionPending}>
          {isActionPending ? "Playing..." : "Play"}
        </button>
      </form>
      {playTxError && <b>{playTxError}</b>}
    </div>
  );
};

export default Player2MoveForm;
