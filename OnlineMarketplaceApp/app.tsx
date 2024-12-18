import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StripeProvider } from '@stripe/stripe-react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add any custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <StripeProvider
      publishableKey="pk_test_51OQvQkHVuJ5sTXtFGVfGWFfyO6bZBw4QnqwmHAQ8vNfAqWH9f9yAWEDv7IyZF5E4C7mx9xLOQXQx5ckrVWEzlWpK00AXrP8Tl7"
    >
      <Stack onLayout={onLayoutRootView} />
    </StripeProvider>
  );
} 