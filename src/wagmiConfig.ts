import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Kleros RPSLS UI",
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "",
  chains: [hardhat, sepolia],
  ssr: true,
});
