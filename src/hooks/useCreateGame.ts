import { wagmiConfig } from "@/wagmiConfig";
import { keccak256, parseEther } from "viem";
import {
  deployContract,
  readContract,
  signMessage,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { generateMessage } from "@/utils/message";
import RPSContract from "@/contracts/RPS.json";
import HasherContract from "@/contracts/Hasher.json";
import { useState } from "react";
import useGameActions from "./useGameDataActions";

interface NewGameArguments {
  move: number;
  player1: string;
  player2: string;
  stake: number;
}

const { abi: RPS_ABI, bytecode: RPS_BYTECODE } = RPSContract;
const { abi: HASHER_ABI } = HasherContract;

export default function useCreateGame() {
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const { addGame } = useGameActions();

  const deployGame = async (args: NewGameArguments) => {
    setIsDeploying(true);

    try {
      const randomValue = crypto.getRandomValues(new Uint8Array(32));
      const formattedRandomValue = Array.from(randomValue)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const signature = await signMessage(wagmiConfig, {
        message: generateMessage(
          args.move,
          args.player1,
          args.player2,
          args.stake,
          formattedRandomValue
        ),
      });

      const salt = keccak256(signature);

      const commitmentHash = await readContract(wagmiConfig, {
        abi: HASHER_ABI,
        address: process.env
          .NEXT_PUBLIC_HASHER_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "hash",
        args: [args.move, salt],
      });

      const txHash = await deployContract(wagmiConfig, {
        abi: RPS_ABI,
        args: [commitmentHash, args.player2],
        bytecode: RPS_BYTECODE as `0x${string}`,
        value: parseEther(args.stake.toString()),
      });

      const txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
      });

      await addGame.mutateAsync({
        address: txReceipt.contractAddress as `0x${string}`,
        player1: args.player1 as `0x${string}`,
        player2: args.player2 as `0x${string}`,
        stake: args.stake,
        random_value: formattedRandomValue,
      });
    } catch (error) {
      alert(error);
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
