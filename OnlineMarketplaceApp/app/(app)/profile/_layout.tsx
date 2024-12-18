import { Stack } from 'expo-router';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.backgroundColor,
        },
        headerTintColor: theme.textColor,
        headerTitleStyle: {
          color: theme.textColor,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="billing"
        options={{
          title: 'Abonnement',
          presentation: 'push',
        }}
      />
    </Stack>
  );
} 