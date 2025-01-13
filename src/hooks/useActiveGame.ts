import { useEffect, useState } from 'react';

const useActiveGame = () => {
  const [activeGameAddress, setActiveGameAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedGame = localStorage.getItem('activeGameAddress');
    if (storedGame) {
      setActiveGameAddress(storedGame);
    }
  }, []);

  const setGameAddress = (gameAddress: string) => {
    localStorage.setItem('activeGameAddress', gameAddress);
    setActiveGameAddress(gameAddress);
  };

  const clearGameAddress = () => {
    localStorage.removeItem('activeGameAddress');
    setActiveGameAddress(null);
  };

  return {
    activeGameAddress,
    setGameAddress,
    clearGameAddress,
  };
};

export default useActiveGame;