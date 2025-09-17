import React, { useEffect, useState } from 'react';
import { StripeProvider as StripeProviderRN } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [publishableKey, setPublishableKey] = useState<string>('');

  useEffect(() => {
    // In production, you would fetch this from your backend
    // For now, we'll use the environment variable
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';
    setPublishableKey(key);
  }, []);

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <StripeProviderRN
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.masterful.app" // Required for Apple Pay
      urlScheme="masterful" // Required for redirects
    >
      {children as React.ReactElement}
    </StripeProviderRN>
  );
};

export default StripeProvider;
