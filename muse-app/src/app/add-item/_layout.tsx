import { Stack } from 'expo-router';

export const unstable_settings = { anchor: 'step-1' };

export default function AddItemLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
