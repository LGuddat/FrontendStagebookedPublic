import {
  ClerkProvider,
  ClerkLoaded,
} from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "../cache";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';

export default function RootLayout() {
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

  if (!clerkPublishableKey) {
    throw new Error("Tilføj EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY i din .env fil");
  }

  if (!stripePublishableKey) {
    throw new Error("Tilføj EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY i din .env fil");
  }

  // Handle deep linking for Stripe
  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;
    
    // Handle the URL here - this will be used for Stripe redirects
    console.log('Deep link URL:', url);
  }, []);

  useEffect(() => {
    // Check for initial URL
    Linking.getInitialURL().then(url => {
      handleDeepLink(url);
    });

    // Listen for deep link events
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      linkingSubscription.remove();
    };
  }, [handleDeepLink]);

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.com.stagebooked"
      urlScheme="stagebooked"
    >
      <GestureHandlerRootView style={styles.container}>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={clerkPublishableKey}
        >
          <ClerkLoaded>
            <Slot />
          </ClerkLoaded>
        </ClerkProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
