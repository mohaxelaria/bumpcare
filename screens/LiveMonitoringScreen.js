import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';

const CONNECTED_GREEN = '#3FAE58';
const WARNING_AMBER = '#C98A2C';
const ERROR_RED = '#D14343';
const BAR_COUNT = 20;

// One-time scripted demo events (no real BLE yet):
// ~8-12s in, belt position goes "Unstable" for a few seconds.
// At 20s, simulate a BLE disconnect the user has to Reconnect from.
const UNSTABLE_START = 8;
const UNSTABLE_END = 12;
const DISCONNECT_AT = 20;

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function randomBars() {
  return Array.from({ length: BAR_COUNT }, () => 15 + Math.random() * 45);
}

export default function LiveMonitoringScreen({ navigation, route }) {
  const {
    deviceName = 'BumpCare Belt',
    battery = 84,
  } = route?.params || {};

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [connected, setConnected] = useState(true);
  const [bars, setBars] = useState(randomBars());
  const [capturedCount, setCapturedCount] = useState(0);
  const [justCaptured, setJustCaptured] = useState(false);
  const [hadInstability, setHadInstability] = useState(false);
  const hasDisconnectedOnce = useRef(false);

  const beltUnstable =
    connected && elapsedSeconds >= UNSTABLE_START && elapsedSeconds < UNSTABLE_END;
  const imuStatus = beltUnstable ? 'High' : 'Low';

  useEffect(() => {
    if (beltUnstable) setHadInstability(true);
  }, [beltUnstable]);

  // Session timer — only advances while "connected".
  useEffect(() => {
    if (!connected) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connected]);

  // Trigger the one-time scripted disconnect.
  useEffect(() => {
    if (
      connected &&
      !hasDisconnectedOnce.current &&
      elapsedSeconds >= DISCONNECT_AT
    ) {
      hasDisconnectedOnce.current = true;
      setConnected(false);
    }
  }, [elapsedSeconds, connected]);

  // Fake live pressure/contact waveform.
  useEffect(() => {
    if (!connected) return undefined;
    const interval = setInterval(() => {
      setBars(randomBars());
    }, 700);
    return () => clearInterval(interval);
  }, [connected]);

  const handleCapture = () => {
    setCapturedCount((c) => c + 1);
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 1500);
  };

  const handleFinish = () => {
    navigation.navigate('SessionSummary', {
      deviceName,
      battery,
      durationSeconds: elapsedSeconds,
      capturedCount,
      hadInstability,
      hadDisconnect: hasDisconnectedOnce.current,
    });
  };

  const handleReconnect = () => {
    setConnected(true);
  };

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
        <Text style={styles.headerTitle}>Live Monitoring</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!connected ? (
        <View style={styles.disconnectedBox}>
          <Text style={styles.disconnectedTitle}>Connection Lost</Text>
          <Text style={styles.disconnectedMessage}>
            BumpCare device was disconnected.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleReconnect}
          >
            <Text style={styles.primaryButtonText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.deviceName}>{deviceName}</Text>
          <View style={styles.deviceStatusRow}>
            <View style={styles.connectedRow}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
            <Text style={styles.batteryText}>Battery {battery}%</Text>
          </View>

          <Text style={styles.sectionTitle}>Session Time</Text>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>

          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Belt Contact</Text>
            <Text style={[styles.statusCardValue, styles.statusReady]}>✓ Good</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Belt Position</Text>
            {beltUnstable ? (
              <>
                <Text style={[styles.statusCardValue, styles.statusWarning]}>
                  ⚠ Unstable
                </Text>
                <Text style={styles.statusCardHint}>
                  Please remain still and adjust the belt.
                </Text>
              </>
            ) : (
              <Text style={[styles.statusCardValue, styles.statusReady]}>
                ✓ Stable
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Pressure / Contact Signal</Text>
          <View style={styles.graphBox}>
            {bars.map((height, i) => (
              <View
                key={i}
                style={[styles.graphBar, { height: `${height}%` }]}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>IMU / Movement</Text>
          <Text
            style={[
              styles.imuValue,
              beltUnstable ? styles.statusWarning : styles.statusReady,
            ]}
          >
            {imuStatus}
          </Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleCapture}
          >
            <Text style={styles.secondaryButtonText}>
              {justCaptured ? '✓ Captured' : 'Capture Data'}
            </Text>
          </TouchableOpacity>
          {capturedCount > 0 && (
            <Text style={styles.capturedCountText}>
              {capturedCount} data point{capturedCount === 1 ? '' : 's'} captured
            </Text>
          )}

          <TouchableOpacity
            style={styles.finishButton}
            activeOpacity={0.85}
            onPress={handleFinish}
          >
            <Text style={styles.finishButtonText}>Finish Monitoring</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  batteryText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  timerText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 22,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  statusCardTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  statusCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusCardHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  statusReady: {
    color: CONNECTED_GREEN,
  },
  statusWarning: {
    color: WARNING_AMBER,
  },
  graphBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 22,
  },
  graphBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  imuValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  capturedCountText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectedBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  disconnectedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ERROR_RED,
    marginBottom: 10,
    textAlign: 'center',
  },
  disconnectedMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
