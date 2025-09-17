import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { apiClient, User, LoginRequest, RegisterRequest } from '@/services/api';

export type UserRole = 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      console.log('Loading stored user:', { hasUser: !!storedUser, hasToken: !!storedToken });
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('User loaded from storage:', userData.email);
      } else {
        console.log('No stored user or token found');
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', token);
      setUser(userData);
      console.log('User saved to storage:', userData.email);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.login({ email, password });
      
      if (!response.success || !response.data) {
        console.error('Login failed:', response.error);
        throw new Error(response.error || 'Login failed');
      }

      const { user, token } = response.data;
      console.log('Login successful for:', user.email);
      await saveUser(user, token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', email, 'with role:', role);
      const response = await apiClient.register({ email, password, name, role });
      
      if (!response.success || !response.data) {
        console.error('Registration failed:', response.error);
        throw new Error(response.error || 'Registration failed');
      }

      const { user, token } = response.data;
      console.log('Registration successful for:', user.email);
      await saveUser(user, token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      if (!user) return;
      // For now, we'll just update the local user role
      // In a real app, you might want to implement role switching on the backend
      const updatedUser = { ...user, role: newRole };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Role switch error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user to update');
      const response = await apiClient.updateProfile(updates);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Profile update failed');
      }

      const updatedUser = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    switchRole,
    updateProfile,
  } as AuthState;
});