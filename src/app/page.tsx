"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./page.module.css";
import useGames from "@/hooks/useGames";
import CreateGameForm from "@/components/createGameForm/createGameForm";
import PlayGame from "@/components/playGame/playGame";

export default function Home() {
  const { userGame } = useGames();

  return (
    <div className={styles.page}>
      <div className={styles.connectButton}>
        <ConnectButton />
      </div>
      {userGame ? <PlayGame /> : <CreateGameForm />}
    </div>
  );
}
