import { Game } from "@/model/game";
import { QUERY_KEYS } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useAccount } from "wagmi";

interface UserGameContextProps {
  userGame: Game | undefined;
  isLoading: boolean;
}

const UserGameContext = createContext<UserGameContextProps | undefined>(
  undefined
);

export const UserGameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { address } = useAccount();

  const { data: userGame, isLoading } = useQuery<Game>({
    queryKey: [QUERY_KEYS.getWalletGame, address],
    queryFn: async () => {
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/games?player=${address}`
      ).then((res) => res.json());
    },
    enabled: !!address,
    refetchInterval: 30000
  });

  return (
    <UserGameContext.Provider value={{ userGame, isLoading }}>
      {children}
    </UserGameContext.Provider>
  );
};

export const useUserGame = (): UserGameContextProps => {
  const context = useContext(UserGameContext);
  if (!context) {
    throw new Error("useUserGame must be used within a UserGameProvider.");
  }
  return context;
};
