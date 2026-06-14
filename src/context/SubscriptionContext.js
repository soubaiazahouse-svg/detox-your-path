import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubscriptionContext = createContext(null);
const SUB_KEY = '@aza_subscription';

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SUB_KEY).then((val) => {
      setIsSubscribed(val === 'true');
      setLoading(false);
    });
  }, []);

  const activateSubscription = async () => {
    setIsSubscribed(true);
    await AsyncStorage.setItem(SUB_KEY, 'true');
  };

  const cancelSubscription = async () => {
    setIsSubscribed(false);
    await AsyncStorage.removeItem(SUB_KEY);
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, loading, activateSubscription, cancelSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
