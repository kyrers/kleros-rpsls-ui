import { MUTATION_KEYS, QUERY_KEYS } from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

interface Game {
  address: `0x${string}`;
  player1: `0x${string}`;
  player2: `0x${string}`;
  stake: number;
  randomValue: string;
}

const useGames = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const { data: userGame } = useQuery<Game>({
    queryKey: [QUERY_KEYS.getWalletGame, address],
    queryFn: async () => {
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/games?player=${address}`
      ).then((res) => res.json());
    },
    enabled: !!address,
  });

  const addGame = useMutation({
    mutationKey: [MUTATION_KEYS.createGame],
    mutationFn: async (game: Game) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(game),
        }
      );

      //Handle backend custom error
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData?.error ?? "Unexpected error";
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.getWalletGame],
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  const removeGame = useMutation({
    mutationKey: [MUTATION_KEYS.removeGame],
    mutationFn: async (gameAddress: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/games/${gameAddress}`,
        {
          method: "DELETE",
        }
      );

      //Handle backend custom error
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData?.error ?? "Unexpected error";
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.getWalletGame],
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  return {
    userGame,
    addGame,
    removeGame,
  };
};

export default useGames;
