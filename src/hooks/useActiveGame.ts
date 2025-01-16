import { useAccount, useReadContract, useWriteContract } from "wagmi";
import RPSContract from "@/contracts/RPS.json";
import useGames from "./useGames";
import { parseEther } from "viem";
import { useState } from "react";

const { abi: RPS_ABI } = RPSContract;
const TIMEOUT = 300_000;

const useActiveGame = () => {
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  const { userGame } = useGames();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

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

  const play = async (move: number) => {
    if (!userGame) return;
    setIsActionPending(true);
    try {
      await writeContractAsync({
        abi: RPS_ABI,
        address: userGame.address,
        functionName: "play",
        args: [move],
        value: parseEther(userGame.stake.toString()),
      });

      refetchC2();
      refetchLastAction();
    } finally {
      setIsActionPending(false);
    }
  };

  const now = Date.now();
  const timeoutTime = Number(lastAction) * 1000 + TIMEOUT;
  const isPlayer2Turn = c2 === 0;
  const isPlayer1 = address === userGame?.player1;
  const isTurn = isPlayer1 ? !isPlayer2Turn : isPlayer2Turn;
  const opponent = isPlayer1 ? userGame?.player2 : userGame?.player1;

  return {
    isPlayer1,
    isTurn,
    opponent,
    stake: userGame?.stake,
    isActionPending,
    hasPlayer1TimedOut: !isPlayer2Turn && now > timeoutTime,
    hasPlayer2TimedOut: isPlayer2Turn && now > timeoutTime,
    timeoutDate: new Date(timeoutTime),
    play,
  };
};

export default useActiveGame;
