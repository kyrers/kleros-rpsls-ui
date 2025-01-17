import { FC, useMemo } from "react";
import styles from "./playGame.module.css";
import useActiveGame from "@/hooks/useActiveGame";
import Player2MoveForm from "./forms/player2MoveForm";
import Player1SolveForm from "./forms/player1SolveForm";
import TimeoutForm from "./forms/timeoutForm";

const PlayGame: FC = () => {
  const {
    isGameReady,
    isPlayer1,
    isTurn,
    opponent,
    stake,
    hasPlayer1TimedOut,
    hasPlayer2TimedOut,
    timeoutDate,
  } = useActiveGame();

  const gameInfoMessage = useMemo(() => {
    if (!isGameReady) {
      return "Finishing setting the game up...";
    }

    if (
      (isPlayer1 && hasPlayer1TimedOut) ||
      (!isPlayer1 && hasPlayer2TimedOut)
    ) {
      return "You have timed out! Your opponent can now call the timeout function to finish the game.";
    }

    if (
      (isPlayer1 && hasPlayer2TimedOut) ||
      (!isPlayer1 && hasPlayer1TimedOut)
    ) {
      return "Your opponent has timed out! Please call the timeout function to finish the game.";
    }

    return `Playing against ${opponent} for ${stake} ETH. It is ${
      isTurn ? "your" : "their"
    } turn. The timeout is ${timeoutDate.toUTCString()}.`;
  }, [
    isPlayer1,
    hasPlayer1TimedOut,
    hasPlayer2TimedOut,
    isGameReady,
    opponent,
    stake,
    isTurn,
    timeoutDate,
  ]);

  return (
    <div className={styles.gameActionsPanel}>
      <h2>{gameInfoMessage}</h2>
      <hr />
      {!isPlayer1 && isTurn && !hasPlayer2TimedOut && <Player2MoveForm />}
      {isPlayer1 && isTurn && !hasPlayer1TimedOut && <Player1SolveForm />}
      {((!isPlayer1 && hasPlayer1TimedOut) ||
        (isPlayer1 && hasPlayer2TimedOut)) && <TimeoutForm />}
    </div>
  );
};

export default PlayGame;
