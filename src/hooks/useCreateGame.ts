import { useState } from "react";
import { deployContract } from "wagmi/actions";
import { wagmiConfig } from "@/wagmiConfig";
import RPSContract from "@/contracts/RPS.json";
import { concat, keccak256, parseEther, toBytes } from "viem";
import useActiveGame from "./useActiveGame";

interface NewGameArguments {
  move: number;
  player2: string;
  stake: string;
}

export default function useCreateGame() {
  const [isDeploying, setIsDeploying] = useState(false);
  const { setGameAddress } = useActiveGame();

  const deployGame = async (args: NewGameArguments) => {
    const move = toBytes(args.move);
    const salt = toBytes(12345);
    const commitmentHash = keccak256(concat([move, salt]));

    setIsDeploying(true);
    try {
      const { abi, bytecode } = RPSContract;

      const contractAddress = await deployContract(wagmiConfig, {
        abi,
        args: [commitmentHash, args.player2],
        bytecode: bytecode as `0x${string}`,
        value: parseEther(args.stake),
      });

      setGameAddress(contractAddress);
    } catch (error) {
      console.error("## Error deploying contract:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    isDeploying,
    deployGame,
  };
}
