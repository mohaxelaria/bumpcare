import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.content}>
        <Image
          source={require('../assets/pregnant.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>Smart Wearable Pregnancy Monitoring</Text>

        <Text style={styles.description}>
          Connect your BumpCare device, monitor sensor data, and keep your
          monitoring sessions organized.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateProfile')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryLink}
          activeOpacity={0.6}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.secondaryLinkText}>I already have an account</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 28,
  },
  illustration: {
    width: 190,
    height: 190,
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 76,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLink: {
    paddingVertical: 4,
  },
  secondaryLinkText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
