"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import styles from "./page.module.css";
import CreateGameForm from "@/components/createGameForm/createGameForm";
import PlayGame from "@/components/playGame/playGame";
import { useUserGame } from "@/contexts/userGameProvider";

export default function Home() {
  const { isConnected } = useAccount();
  const { userGame, isLoading } = useUserGame();

  return (
    <div className={styles.page}>
      <div className={styles.connectButton}>
        <ConnectButton />
      </div>
      {!isConnected ? (
        <h2>Connect wallet</h2>
      ) : isLoading ? (
        <h2>Looking for an active game...</h2>
      ) : userGame ? (
        <PlayGame />
      ) : (
        <CreateGameForm />
      )}
    </div>
  );
}
