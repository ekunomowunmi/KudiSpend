import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/db';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Failed to initialize database', error);
      }
    };

    init().catch(error => {
      console.error('Unexpected database initialization error', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
