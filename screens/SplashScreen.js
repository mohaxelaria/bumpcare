import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Wearable Pregnancy Monitoring System</Text>
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 220,
    height: 92,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
});
