import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <ConnectButton />
    </div>
  );
}
