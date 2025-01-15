import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

interface Game {
  address: `0x${string}`;
  player1: string;
  player2: string;
  stake: number;
  randomValue: string;
}

const GAMES_QUERY_KEY = ["games"];

//Use react query to easily keep state and localStorage in sync and avoid possible state sync problems in components
const useGames = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: allGames = [] } = useQuery<Game[]>({
    queryKey: GAMES_QUERY_KEY,
    queryFn: () => {
      const stored = localStorage.getItem("allGames");
      return stored ? JSON.parse(stored) : [];
    },
  });

  const userGame: Game | undefined = allGames.find(
    (game: Game) => game.player1 === address || game.player2 === address
  );

  const addGame = (game: Game) => {
    const newGames = [...allGames, game];
    localStorage.setItem("allGames", JSON.stringify(newGames));
    queryClient.setQueryData(GAMES_QUERY_KEY, newGames);
  };

  const removeGame = (game: Game) => {
    const newGames = allGames.filter((g: Game) => g.address !== game.address);
    localStorage.setItem("allGames", JSON.stringify(newGames));
    queryClient.setQueryData(GAMES_QUERY_KEY, newGames);
  };

  return {
    allGames,
    userGame,
    addGame,
    removeGame,
  };
};

export default useGames;
