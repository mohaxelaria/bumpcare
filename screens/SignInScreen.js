import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';

// Placeholder for now — real Sign In (login) comes in a later step.
export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
});
