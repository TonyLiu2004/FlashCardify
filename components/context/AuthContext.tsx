'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabaseClient from '@/utils/supabaseClient';

interface UserData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  billing_address: any;
  payment_method: any;
  total_cards: number | null;
  cards_rated: number | null;
  daily_streak: number | null;
  max_streak: number | null;
  last_login: string | null;
}

interface AuthContextType {
  user: UserData | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async (sessionUser: User | null) => {
      if (!sessionUser) {
        console.log("No session user found.");
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error.message);
        } else {
          setUser({
            ...sessionUser,
            ...profile,
          } as UserData);
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();

      if (session) {
        await getUserProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const logout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };

  const exposed: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={exposed}>{children}</AuthContext.Provider>;
};

export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};
