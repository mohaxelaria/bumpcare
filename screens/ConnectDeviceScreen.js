import React, { useState } from 'react';
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
import { useDevice } from '../context/DeviceContext';

const CONNECTED_GREEN = '#3FAE58';
const ERROR_RED = '#D14343';

// Mock "nearby devices" until real BLE scanning (react-native-ble-plx + ESP32
// advertising) is wired up. BC-001 (good signal) simulates a successful
// connect; BC-002 (weak signal) simulates a failed connect, so both UI
// states from the spec are reachable for testing.
const MOCK_DEVICES = [
  { id: 'BC-001', name: 'BumpCare BC-001', signal: 'Good', outcome: 'success' },
  { id: 'BC-002', name: 'BumpCare BC-002', signal: 'Weak', outcome: 'fail' },
];

export default function ConnectDeviceScreen({ navigation }) {
  const { pairDevice } = useDevice();
  // Real Bluetooth on/off + permission detection comes later — assumed ON for now.
  const [bluetoothOn] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [devices, setDevices] = useState([]);

  const handleScan = () => {
    setScanning(true);
    setHasScanned(false);
    setDevices([]);

    setTimeout(() => {
      setDevices(MOCK_DEVICES.map((d) => ({ ...d, status: 'idle' })));
      setScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  const updateDevice = (id, changes) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...changes } : d))
    );
  };

  const handleConnect = (device) => {
    updateDevice(device.id, { status: 'connecting' });

    setTimeout(() => {
      if (device.outcome === 'success') {
        updateDevice(device.id, { status: 'connected', battery: 86 });
        pairDevice({
          id: device.id,
          name: device.name,
          battery: 86,
          signal: device.signal,
        });
      } else {
        updateDevice(device.id, { status: 'failed' });
      }
    }, 1500);
  };

  const handleTryAgain = (device) => {
    updateDevice(device.id, { status: 'idle' });
  };

  const handleContinue = (device) => {
    navigation.navigate('DeviceCheck', {
      deviceName: device.name,
      battery: device.battery,
      signal: device.signal,
    });
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
        <Text style={styles.headerTitle}>Connect Device</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!bluetoothOn ? (
          <View style={styles.bluetoothOffBox}>
            <Text style={styles.bluetoothOffTitle}>Bluetooth is turned off.</Text>
            <Text style={styles.bluetoothOffMessage}>
              Bluetooth is required to connect to your BumpCare device.
            </Text>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Turn On Bluetooth</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.instruction}>
              Make sure your BumpCare belt is turned on and nearby.
            </Text>

            <View style={styles.bluetoothStatusRow}>
              <Text style={styles.bluetoothStatusLabel}>Bluetooth:</Text>
              <Text style={styles.bluetoothStatusValue}>ON</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Scan for Devices</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Nearby Devices</Text>

            {!hasScanned && !scanning ? (
              <Text style={styles.emptyStateText}>
                Tap "Scan for Devices" to search for your BumpCare belt.
              </Text>
            ) : null}

            {hasScanned && devices.length === 0 ? (
              <Text style={styles.emptyStateText}>
                No BumpCare devices found nearby.
              </Text>
            ) : null}

            {devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                {device.status === 'connecting' && (
                  <>
                    <Text style={styles.deviceCardTitle}>{device.name}</Text>
                    <View style={styles.connectingRow}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.connectingText}>Connecting...</Text>
                    </View>
                  </>
                )}

                {device.status === 'connected' && (
                  <>
                    <Text style={styles.deviceCardTitle}>{device.name}</Text>
                    <View style={styles.deviceRow}>
                      <Text style={styles.connectedText}>✓ Connected</Text>
                    </View>
                    <View style={styles.deviceRow}>
                      <Text style={styles.deviceRowLabel}>Battery</Text>
                      <Text style={styles.deviceRowValue}>{device.battery}%</Text>
                    </View>
                    <View style={styles.deviceRow}>
                      <Text style={styles.deviceRowLabel}>Signal</Text>
                      <Text style={styles.deviceRowValue}>{device.signal}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      activeOpacity={0.8}
                      onPress={() => handleContinue(device)}
                    >
                      <Text style={styles.secondaryButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </>
                )}

                {device.status === 'failed' && (
                  <>
                    <Text style={styles.failedTitle}>Unable to connect.</Text>
                    <Text style={styles.failedMessage}>
                      Make sure your BumpCare device is powered on and nearby.
                    </Text>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      activeOpacity={0.8}
                      onPress={() => handleTryAgain(device)}
                    >
                      <Text style={styles.secondaryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </>
                )}

                {device.status === 'idle' && (
                  <>
                    <Text style={styles.deviceCardTitle}>{device.name}</Text>
                    <View style={styles.deviceRow}>
                      <Text style={styles.deviceRowLabel}>Signal</Text>
                      <Text style={styles.deviceRowValue}>{device.signal}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      activeOpacity={0.8}
                      onPress={() => handleConnect(device)}
                    >
                      <Text style={styles.secondaryButtonText}>Connect</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
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
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  bluetoothStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bluetoothStatusLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 6,
  },
  bluetoothStatusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: CONNECTED_GREEN,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  deviceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  deviceCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deviceRowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  deviceRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 10,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: CONNECTED_GREEN,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  failedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ERROR_RED,
    marginBottom: 6,
  },
  failedMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 12,
  },
  bluetoothOffBox: {
    alignItems: 'center',
    paddingTop: 60,
  },
  bluetoothOffTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  bluetoothOffMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
});
