import { FC } from "react";
import styles from "@/app/page.module.css";
import useActiveGame from "@/hooks/useActiveGame";

const TimeoutForm: FC = () => {
  const { isPlayer1, isActionPending, timeoutTxError, timeout } =
    useActiveGame();

  const handleTimeoutClick = (e: React.FormEvent) => {
    e.preventDefault();
    timeout(isPlayer1);
  };

  return (
    <div
      className={`${styles.actionForm} ${isActionPending && styles.loading}`}
    >
      <h2>Finish the game</h2>
      <button onClick={handleTimeoutClick} disabled={isActionPending}>
        {isActionPending ? "Finishing..." : "Finish"}
      </button>
      {timeoutTxError && <b>{timeoutTxError}</b>}
    </div>
  );
};

export default TimeoutForm;
