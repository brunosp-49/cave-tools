// hooks/useInternetConnection.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useInternetConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    // Check immediately on mount
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};
