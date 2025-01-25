import { Game } from "@/model/game";
import { MUTATION_KEYS, QUERY_KEYS } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useGameDataActions = () => {
  const queryClient = useQueryClient();

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

      return response.text();
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
    addGame,
    removeGame,
  };
};

export default useGameDataActions;
