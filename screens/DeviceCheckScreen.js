import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';

const CONNECTED_GREEN = '#3FAE58';
const WARNING_AMBER = '#C98A2C';
const LOW_BATTERY_THRESHOLD = 20;

// Mocks the ESP32 → Android status read until real BLE characteristic
// reads are wired up. First check simulates a "belt not seated right yet"
// scenario (poor contact / adjust belt) so that UI path is testable; a
// recheck simulates the user having adjusted the belt, and passes.
function runDeviceCheck(attempt, battery) {
  const batteryReady = battery >= LOW_BATTERY_THRESHOLD;
  const firstAttemptIssue = attempt === 0;

  return {
    bluetooth: { ready: true, label: 'Ready' },
    battery: {
      ready: batteryReady,
      label: batteryReady ? `${battery}%` : `Low (${battery}%)`,
    },
    imu: { ready: true, label: 'Ready' },
    contact: {
      ready: !firstAttemptIssue,
      label: firstAttemptIssue ? 'Poor Contact' : 'Good',
    },
    beltPosition: {
      ready: !firstAttemptIssue,
      label: firstAttemptIssue ? 'Adjust Belt' : 'Stable',
    },
    // A poorly seated belt affects the ultrasound probe's contact too —
    // detection itself is a separate (always-on) hardware concern.
    probeDetected: { ready: true, label: 'Detected' },
    probeContact: {
      ready: !firstAttemptIssue,
      label: firstAttemptIssue ? 'Poor Contact' : 'Good',
    },
  };
}

export default function DeviceCheckScreen({ navigation, route }) {
  const {
    deviceName = 'BumpCare Belt',
    battery = 86,
    signal = 'Good',
  } = route?.params || {};

  const [checking, setChecking] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [checks, setChecks] = useState(null);

  useEffect(() => {
    setChecking(true);
    const timer = setTimeout(() => {
      setChecks(runDeviceCheck(attempt, battery));
      setChecking(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [attempt, battery]);

  const handleRecheck = () => {
    setAttempt((a) => a + 1);
  };

  const allReady = checks
    ? Object.values(checks).every((c) => c.ready)
    : false;

  const handleBeginScreening = () => {
    if (!allReady) return;
    navigation.navigate('UltrasoundScan', { deviceName, battery, signal });
  };

  const rows = checks
    ? [
        { name: 'Bluetooth', ...checks.bluetooth },
        { name: 'Battery', ...checks.battery },
        { name: 'IMU Sensor', ...checks.imu },
        { name: 'Contact Sensor', ...checks.contact },
        { name: 'Belt Position', ...checks.beltPosition },
      ]
    : [];

  const ultrasoundRows = checks
    ? [
        { name: 'Probe', ...checks.probeDetected },
        { name: 'Probe Contact', ...checks.probeContact },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device Check</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.deviceName}>{deviceName}</Text>
        <View style={styles.connectedRow}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectedText}>Connected</Text>
        </View>

        <Text style={styles.sectionTitle}>Device Status</Text>

        {checking ? (
          <View style={styles.checkingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.checkingText}>Checking device...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statusCard}>
              {rows.map((row) => (
                <View key={row.name} style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{row.name}</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      row.ready ? styles.statusValueReady : styles.statusValueWarning,
                    ]}
                  >
                    {row.ready ? '✓' : '⚠'} {row.label}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ultrasound</Text>
            <View style={styles.statusCard}>
              {ultrasoundRows.map((row) => (
                <View key={row.name} style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{row.name}</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      row.ready ? styles.statusValueReady : styles.statusValueWarning,
                    ]}
                  >
                    {row.ready ? '✓' : '⚠'} {row.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!checking && (
          <>
            <Text style={styles.sectionTitle}>Overall Status</Text>
            <View style={styles.overallRow}>
              <Text
                style={[
                  styles.overallText,
                  allReady ? styles.overallReady : styles.overallWarning,
                ]}
              >
                {allReady ? '✓ Ready for Screening' : '⚠ Not Ready'}
              </Text>
            </View>

            {!allReady && (
              <>
                <Text style={styles.helperText}>
                  Adjust the belt until all required sensors are ready.
                </Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={handleRecheck}
                >
                  <Text style={styles.secondaryButtonText}>Recheck Device</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, !allReady && styles.primaryButtonDisabled]}
              activeOpacity={allReady ? 0.85 : 1}
              onPress={handleBeginScreening}
              disabled={!allReady}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !allReady && styles.primaryButtonTextDisabled,
                ]}
              >
                Begin Screening
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { width: 32 },
  backArrow: { fontSize: 22, color: colors.textDark },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSpacer: { width: 32 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 6,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CONNECTED_GREEN,
    marginRight: 8,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: CONNECTED_GREEN,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },
  checkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  checkingText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 10,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textDark,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusValueReady: {
    color: CONNECTED_GREEN,
  },
  statusValueWarning: {
    color: WARNING_AMBER,
  },
  overallRow: {
    marginBottom: 8,
  },
  overallText: {
    fontSize: 17,
    fontWeight: '700',
  },
  overallReady: {
    color: CONNECTED_GREEN,
  },
  overallWarning: {
    color: WARNING_AMBER,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.border,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonTextDisabled: {
    color: colors.textMuted,
  },
});
