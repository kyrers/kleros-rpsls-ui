import { FC } from "react";
import styles from "@/app/page.module.css";
import useActiveGame from "@/hooks/useActiveGame";

const TimeoutForm: FC = () => {
  const { isActionPending, isPlayer1, timeout } = useActiveGame();

  const handleTimeoutClick = (e: React.FormEvent) => {
    e.preventDefault();
    timeout(isPlayer1);
  };

  return (
    <div className={styles.actionContainer}>
      <h2>Finish the game</h2>
      <button onClick={handleTimeoutClick} disabled={isActionPending}>
        {isActionPending ? "Finishing..." : "Finish"}
      </button>
    </div>
  );
};

export default TimeoutForm;
