import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineData {
  timestamp: number;
  data: any;
  key: string;
}

export class OfflineStorageService {
  private static readonly CACHE_PREFIX = 'offline_cache_';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  static async set(key: string, data: any): Promise<void> {
    try {
      const offlineData: OfflineData = {
        timestamp: Date.now(),
        data,
        key,
      };
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(offlineData)
      );
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!stored) return null;

      const offlineData: OfflineData = JSON.parse(stored);
      
      // Check if data is expired
      if (Date.now() - offlineData.timestamp > this.CACHE_EXPIRY) {
        await this.remove(key);
        return null;
      }

      return offlineData.data as T;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing offline data:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .map(key => key.replace(this.CACHE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting offline keys:', error);
      return [];
    }
  }

  static async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const stored = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
        if (stored) {
          totalSize += stored.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating offline storage size:', error);
      return 0;
    }
  }
}
