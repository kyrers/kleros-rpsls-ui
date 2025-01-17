import { wagmiConfig } from "@/wagmiConfig";
import { keccak256, parseEther } from "viem";
import {
  deployContract,
  readContract,
  signMessage,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { generateMessage } from "@/utils/message";
import useGames from "./useGames";
import RPSContract from "@/contracts/RPS.json";
import HasherContract from "@/contracts/Hasher.json";
import { useEffect, useState } from "react";

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
  const { userGame, addGame } = useGames();

  useEffect(() => {
    if (!!userGame) {
      //To prevent the UI being out of sync while the local storage is being updated, only set to false when the game has been added to local storage.
      setIsDeploying(false);
    }
  }, [userGame]);

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

      addGame({
        address: txReceipt.contractAddress as `0x${string}`,
        player1: args.player1 as `0x${string}`,
        player2: args.player2 as `0x${string}`,
        stake: args.stake,
        randomValue: formattedRandomValue,
      });
    } catch (error) {
      console.error("## Error deploying contract:", error);
      setIsDeploying(false);
    }
  };

  return {
    isDeploying,
    deployGame,
  };
}
