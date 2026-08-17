import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ConnectDeviceScreen from '../screens/ConnectDeviceScreen';
import DeviceCheckScreen from '../screens/DeviceCheckScreen';
import LiveMonitoringScreen from '../screens/LiveMonitoringScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailsScreen from '../screens/SessionDetailsScreen';
import SessionGraphScreen from '../screens/SessionGraphScreen';
import DeviceManagementScreen from '../screens/DeviceManagementScreen';
import UltrasoundScanScreen from '../screens/UltrasoundScanScreen';
import UltrasoundAnalysisScreen from '../screens/UltrasoundAnalysisScreen';
import RiskScreeningScreen from '../screens/RiskScreeningScreen';
import EducationScreen from '../screens/EducationScreen';
import EducationArticleScreen from '../screens/EducationArticleScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="ConnectDevice" component={ConnectDeviceScreen} />
        <Stack.Screen name="DeviceCheck" component={DeviceCheckScreen} />
        <Stack.Screen name="DeviceDetails" component={DeviceManagementScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} />
        <Stack.Screen name="SessionGraph" component={SessionGraphScreen} />
        <Stack.Screen name="Education" component={EducationScreen} />
        <Stack.Screen name="EducationArticle" component={EducationArticleScreen} />
        <Stack.Screen
          name="Settings"
          component={PlaceholderScreen}
          initialParams={{ title: 'Settings' }}
        />
        <Stack.Screen name="UltrasoundScan" component={UltrasoundScanScreen} />
        <Stack.Screen name="UltrasoundAnalysis" component={UltrasoundAnalysisScreen} />
        <Stack.Screen name="RiskScreening" component={RiskScreeningScreen} />

        {/* Superseded by the screening flow above, kept per your note that
            existing screens don't need to be deleted. */}
        <Stack.Screen name="MonitoringSession" component={LiveMonitoringScreen} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
