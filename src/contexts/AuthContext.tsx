
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // First, set a basic user object from auth data as a fallback
      const basicUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'User',
        role: 'user' // Default role
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Try to create a profile if it doesn't exist
        if (error.code === 'PGRST116') { // Record not found error
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authUser.id,
                  email: authUser.email || '',
                  name: authUser.user_metadata?.name || 'User',
                  role: 'user' // Default role
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              // Use the basic user object as fallback
              setUser(basicUser);
              setIsLoading(false);
              return;
            }

            if (newProfile) {
              setUser({
                id: newProfile.id,
                email: newProfile.email,
                name: newProfile.name,
                role: newProfile.role
              });
              setIsLoading(false);
              return;
            }
          }
        }
        // Even if there was an error, we should still set user to the basic user object
        setUser(basicUser);
        setIsLoading(false);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role
        });
      } else {
        // If no profile was found but no error occurred, use the basic user object
        setUser(basicUser);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Even if there was an error, we should still set user to a basic user object
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'User',
        role: 'user' // Default role
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        try {
          await fetchUserProfile(data.user);
          return true;
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // Ensure we set isLoading to false even if profile fetch fails
          setIsLoading(false);
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    // Ensure isLoading is always set to false at the end
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        // Create profile explicitly instead of relying on trigger
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: name,
              role: 'user' // Default role for new users
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway as the trigger might handle it
        }
        
        // Set the user state immediately after registration
        setUser({
          id: data.user.id,
          email: email,
          name: name,
          role: 'user'
        });
        
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
