import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const buildUser = async (session) => {
    if (!session?.user) {
      setUser(null);
      setCredits(0);
      setLoading(false);
      return;
    }

    const authUser = session.user;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authUser.id)
      .single();

    // Fetch credits
    const { data: creditRow } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', authUser.id)
      .single();

    // Fetch subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', authUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setUser({
      id: authUser.id,
      name: profile?.full_name || 'New User',
      email: authUser.email,
      avatar: profile?.avatar_url || null,
      plan: subscription?.plan
        ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
        : null,
    });
    setCredits(creditRow?.balance ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      buildUser(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        buildUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (email, password, plan, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || 'New User' },
      },
    });
    if (error) throw error;

    // Create subscription record if plan selected and user confirmed
    if (data.user && plan) {
      await supabase.from('subscriptions').insert({
        user_id: data.user.id,
        plan: plan.toLowerCase(),
        status: 'active',
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, credits, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
