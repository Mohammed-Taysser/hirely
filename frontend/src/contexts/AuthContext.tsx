import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | 'super-admin';
export type UserTier = 'free' | 'pro' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: UserTier;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing - in production, this would be server-side
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Super Admin',
      role: 'super-admin',
      tier: 'premium',
    },
  },
  'user@example.com': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
      tier: 'free',
    },
  },
  'premium@example.com': {
    password: 'premium123',
    user: {
      id: '3',
      email: 'premium@example.com',
      name: 'Premium User',
      role: 'user',
      tier: 'premium',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('auth_user', JSON.stringify(demoUser.user));
      return { success: true };
    }

    // For demo, allow any login with specific role based on email pattern
    if (password.length >= 6) {
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role: 'user',
        tier: 'free',
      };
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (DEMO_USERS[email.toLowerCase()]) {
      return { success: false, error: 'Email already registered' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'user',
      tier: 'free',
    };

    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const isSuperAdmin = () => user?.role === 'super-admin';
  const isAdmin = () => user?.role === 'admin' || user?.role === 'super-admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        isSuperAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
