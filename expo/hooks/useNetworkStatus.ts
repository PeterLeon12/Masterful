import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
  isEthernet: boolean;
  isUnknown: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifi: true,
    isCellular: false,
    isEthernet: false,
    isUnknown: false,
  });

  // Simplified - just return online status for now
  useEffect(() => {
    // Assume online for development
    setNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      isWifi: true,
      isCellular: false,
      isEthernet: false,
      isUnknown: false,
    });
  }, []);

  const isOnline = networkStatus.isConnected && networkStatus.isInternetReachable;

  const getConnectionTypeLabel = () => {
    if (networkStatus.isWifi) return 'WiFi';
    if (networkStatus.isCellular) return 'Cellular';
    if (networkStatus.isEthernet) return 'Ethernet';
    if (networkStatus.isUnknown) return 'Unknown';
    return 'None';
  };

  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    if (networkStatus.isWifi) return 'excellent';
    if (networkStatus.isCellular) return 'good';
    if (networkStatus.isEthernet) return 'excellent';
    return 'unknown';
  };

  return {
    ...networkStatus,
    isOnline,
    getConnectionTypeLabel,
    getConnectionQuality,
  };
};
