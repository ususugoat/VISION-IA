import React from 'react';
import { AppProvider } from './app/providers/AppContext';
import { AppShell } from './app/layout/AppShell';

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
