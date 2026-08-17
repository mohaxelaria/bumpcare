import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { DeviceProvider } from './context/DeviceContext';
import { ProfileProvider } from './context/ProfileContext';

export default function App() {
  return (
    <ProfileProvider>
      <DeviceProvider>
        <AppNavigator />
      </DeviceProvider>
    </ProfileProvider>
  );
}
