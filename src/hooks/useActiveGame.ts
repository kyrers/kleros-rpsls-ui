import { useAccount, useReadContract } from "wagmi";
import RPSContract from "@/contracts/RPS.json";
import useGames from "./useGames";
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

const { abi: RPS_ABI } = RPSContract;
const TIMEOUT = 300_000;

const useActiveGame = () => {
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [playTxError, setPlayTxError] = useState<string>("");
  const [solveTxError, setSolveTxError] = useState<string>("");
  const [timeoutTxError, setTimeoutTxError] = useState<string>("");
  const { userGame, removeGame } = useGames();
  const { address } = useAccount();

  const { data: c2, refetch: refetchC2 } = useReadContract({
    abi: RPS_ABI,
    address: userGame?.address,
    functionName: "c2",
    query: {
      enabled: !!userGame,
    },
  });

  const { data: lastAction, refetch: refetchLastAction } = useReadContract({
    abi: RPS_ABI,
    address: userGame?.address,
    functionName: "lastAction",
    query: {
      enabled: !!userGame,
    },
  });

  useEffect(() => {
    if (!userGame) {
      //To prevent the UI being out of sync while the local storage is being updated, only set to false when the game has been removed from local storage.
      //Useful for the solve and timeout functions.
      setIsActionPending(false);
    }
  }, [userGame]);

  const play = async (move: number) => {
    if (!userGame) return;
    setIsActionPending(true);
    setPlayTxError("");

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
        setPlayTxError("Transaction will fail!");
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
    setSolveTxError("");

    try {
      //Generate the same salt used when creating the game.
      const signature = await signMessage(wagmiConfig, {
        message: generateMessage(
          move,
          userGame.player1,
          userGame.player2,
          userGame.stake,
          userGame.randomValue
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
        setSolveTxError("Transaction will fail!");
        setIsActionPending(false);
        return;
      }

      const txHash = await writeContract(wagmiConfig, txParams);
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      removeGame(userGame);
    } catch (error) {
      console.error("## Error solving:", error);
    }
  };

  const timeout = async (isPlayer1: boolean) => {
    if (!userGame) return;
    setIsActionPending(true);
    setTimeoutTxError("");

    try {
      const txParams = {
        abi: RPS_ABI,
        address: userGame.address,
        functionName: isPlayer1 ? "j2Timeout" : "j1Timeout",
      };

      try {
        await simulateContract(wagmiConfig, txParams);
      } catch {
        setTimeoutTxError("Transaction will fail!");
        setIsActionPending(false);
        return;
      }

      const txHash = await writeContract(wagmiConfig, txParams);
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      removeGame(userGame);
    } catch (error) {
      console.error("## Error calling timeout:", error);
    }
  };

  const now = Date.now();
  const timeoutTime = Number(lastAction) * 1000 + TIMEOUT;
  //Means we are interacting with the contract correctly and the game is ready to be played
  const isGameReady = c2 !== undefined;
  const isPlayer2Turn = isGameReady && c2 === 0;
  const isPlayer1 = address === userGame?.player1;
  const isTurn = isGameReady && (isPlayer1 ? !isPlayer2Turn : isPlayer2Turn);
  const opponent = isPlayer1 ? userGame?.player2 : userGame?.player1;

  return {
    isGameReady,
    isPlayer1,
    isTurn,
    opponent,
    stake: userGame?.stake,
    isActionPending,
    hasPlayer1TimedOut: !isPlayer2Turn && now > timeoutTime,
    hasPlayer2TimedOut: isPlayer2Turn && now > timeoutTime,
    timeoutDate: new Date(timeoutTime),
    playTxError,
    solveTxError,
    timeoutTxError,
    play,
    solve,
    timeout,
  };
};

export default useActiveGame;
