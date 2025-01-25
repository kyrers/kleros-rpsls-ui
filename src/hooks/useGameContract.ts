import { useAccount, useReadContract } from "wagmi";
import RPSContract from "@/contracts/RPS.json";
import { keccak256, parseEther } from "viem";
import { useEffect, useState } from "react";
import {
  signMessage,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { wagmiConfig } from "@/wagmiConfig";
import { generateMessage } from "@/utils/message";
import useGameDataActions from "./useGameDataActions";
import { useUserGame } from "@/contexts/userGameProvider";

interface TimeoutData {
  hasPlayer1TimedOut: boolean;
  hasPlayer2TimedOut: boolean;
  timeoutDate: Date;
}

const { abi: RPS_ABI } = RPSContract;
const TIMEOUT = 300_000;

const useGameContract = () => {
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [timeoutData, setTimeoutData] = useState<TimeoutData>({
    hasPlayer1TimedOut: false,
    hasPlayer2TimedOut: false,
    timeoutDate: new Date(),
  });
  const { userGame } = useUserGame();
  const { removeGame } = useGameDataActions();
  const { address } = useAccount();

  const {
    data: c2,
    refetch: refetchC2,
    isFetching: isFetchingC2,
  } = useReadContract({
    abi: RPS_ABI,
    address: userGame?.address,
    functionName: "c2",
    query: {
      enabled: !!userGame,
      refetchInterval: 30000,
    },
  });

  const {
    data: lastAction,
    refetch: refetchLastAction,
    isFetching: isFetchingLastAction,
  } = useReadContract({
    abi: RPS_ABI,
    address: userGame?.address,
    functionName: "lastAction",
    query: {
      enabled: !!userGame,
      refetchInterval: 30000,
    },
  });

  const play = async (move: number) => {
    if (!userGame) return;
    setIsActionPending(true);

    try {
      const txParams = {
        abi: RPS_ABI,
        address: userGame.address,
        functionName: "play",
        args: [move],
        value: parseEther(userGame.stake.toString()),
      };

      try {
        await simulateContract(wagmiConfig, txParams);
      } catch {
        alert("Transaction will fail!");
        return;
      }

      const txHash = await writeContract(wagmiConfig, txParams);
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      await refetchC2();
      await refetchLastAction();
    } catch (error) {
      console.error("## Error playing:", error);
    } finally {
      setIsActionPending(false);
    }
  };

  const solve = async (move: number) => {
    if (!userGame) return;
    setIsActionPending(true);

    try {
      //Generate the same salt used when creating the game.
      const signature = await signMessage(wagmiConfig, {
        message: generateMessage(
          move,
          userGame.player1,
          userGame.player2,
          userGame.stake,
          userGame.random_value
        ),
      });

      const salt = keccak256(signature);

      const txParams = {
        abi: RPS_ABI,
        address: userGame.address,
        functionName: "solve",
        args: [move, salt],
      };

      try {
        await simulateContract(wagmiConfig, txParams);
      } catch {
        alert("Transaction will fail!");
        return;
      }

      const txHash = await writeContract(wagmiConfig, txParams);
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      await removeGame.mutateAsync(userGame.address);
    } catch (error) {
      alert(error);
      console.error("## Error solving:", error);
    } finally {
      setIsActionPending(false);
    }
  };

  const timeout = async (isPlayer1: boolean) => {
    if (!userGame) return;
    setIsActionPending(true);

    try {
      const txParams = {
        abi: RPS_ABI,
        address: userGame.address,
        functionName: isPlayer1 ? "j2Timeout" : "j1Timeout",
      };

      try {
        await simulateContract(wagmiConfig, txParams);
      } catch {
        alert("Transaction will fail!");
        return;
      }

      const txHash = await writeContract(wagmiConfig, txParams);
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      await removeGame.mutateAsync(userGame.address);
    } catch (error) {
      alert(error);
      console.error("## Error calling timeout:", error);
    } finally {
      setIsActionPending(false);
    }
  };

  //Means we are interacting with the contract correctly and the game is ready to be played
  const isGameReady = c2 !== undefined;
  const isPlayer2Turn = isGameReady && c2 === 0;
  const isPlayer1 = address === userGame?.player1;
  const isTurn = isGameReady && (isPlayer1 ? !isPlayer2Turn : isPlayer2Turn);
  const opponent = isPlayer1 ? userGame?.player2 : userGame?.player1;

  useEffect(() => {
    //Only recalculate when both are finished refetching
    if (!isFetchingC2 && !isFetchingLastAction) {
      const now = Date.now();
      const timeoutTime = Number(lastAction) * 1000 + TIMEOUT;
      setTimeoutData({
        hasPlayer1TimedOut: !isPlayer2Turn && now > timeoutTime,
        hasPlayer2TimedOut: isPlayer2Turn && now > timeoutTime,
        timeoutDate: new Date(timeoutTime),
      });
    }
  }, [isFetchingC2, isFetchingLastAction, isPlayer2Turn, lastAction]);

  return {
    isGameReady,
    isPlayer1,
    isTurn,
    opponent,
    stake: userGame?.stake,
    isActionPending,
    hasPlayer1TimedOut: timeoutData.hasPlayer1TimedOut,
    hasPlayer2TimedOut: timeoutData.hasPlayer2TimedOut,
    timeoutDate: timeoutData.timeoutDate,
    play,
    solve,
    timeout,
  };
};

export default useGameContract;
