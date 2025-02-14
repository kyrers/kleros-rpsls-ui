import { FC, useState } from "react";
import styles from "@/app/page.module.css";
import MoveSelector from "@/components/common/moveSelector";
import { Move } from "@/model/move";
import useGameContract from "@/hooks/useGameContract";

const Player2MoveForm: FC = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const { isActionPending, play } = useGameContract();

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
    </div>
  );
};

export default Player2MoveForm;
