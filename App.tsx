import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { openDatabase } from './src/db/database';
import RootNavigator from './src/navigation/RootNavigator';

export default function App(): React.JSX.Element {
  useEffect(() => {
    openDatabase().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
