import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, onAuthStateChange } from '../services/supabase';

const GUEST_KEY = '@aza_guest_mode';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    let done = false;

    const finish = () => {
      if (!done) { done = true; setLoading(false); }
    };

    // Safety timeout — if Supabase is offline, don't block the user
    const timeout = setTimeout(finish, 4000);

    // Check guest mode first
    AsyncStorage.getItem(GUEST_KEY).then(val => {
      if (val === 'true') { setGuestMode(true); finish(); }
    });

    // Try to load Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      finish();
    }).catch(finish);

    const subscription = onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const enterGuestMode = async () => {
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setGuestMode(true);
  };

  const exitGuestMode = async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    setGuestMode(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, guestMode, enterGuestMode, exitGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
