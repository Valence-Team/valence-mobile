import { Stack } from 'expo-router';

import { cores } from '@/theme';

export default function LayoutAutenticacao() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.superficie } }}
    />
  );
}
