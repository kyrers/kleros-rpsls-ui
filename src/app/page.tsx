import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./page.module.css";
import CreateGame from "@/components/createGame/createGame";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.connectButton}>
        <ConnectButton />
      </div>
      <div className={styles.gameActionsPanel}>
        <CreateGame />
      </div>
    </div>
  );
}
