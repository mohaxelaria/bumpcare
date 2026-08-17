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
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useDevice } from '../context/DeviceContext';
import BottomNav from '../components/BottomNav';

const CONNECTED_GREEN = '#3FAE58';
const WARNING_AMBER = '#C98A2C';

const SENSOR_LABELS = {
  imu: 'IMU',
  contact: 'Contact Sensor',
  batteryMonitor: 'Battery Monitor',
};

function formatLastConnected(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return isToday ? `Today, ${time}` : `${d.toLocaleDateString()}, ${time}`;
}

export default function DeviceManagementScreen({ navigation }) {
  const { pairedDevice, sensors, disconnectDevice, reconnectDevice, forgetDevice } =
    useDevice();
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = () => {
    setReconnecting(true);
    // Simulated: Check Bluetooth → Find device → BLE connect → discover
    // services → read status → Connected. Real BLE reconnect-by-stored-ID
    // comes later.
    setTimeout(() => {
      reconnectDevice();
      setReconnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    disconnectDevice();
  };

  const handleForget = () => {
    Alert.alert(
      `Forget ${pairedDevice?.name}?`,
      'You will need to scan and connect to this device again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: () => {
            forgetDevice();
            navigation.navigate('ConnectDevice');
          },
        },
      ]
    );
  };

  if (!pairedDevice) {
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
          <Text style={styles.headerTitle}>My Device</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No device paired yet.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ConnectDevice')}
          >
            <Text style={styles.primaryButtonText}>Connect Device</Text>
          </TouchableOpacity>
        </View>
        <BottomNav navigation={navigation} active="Device" />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My Device</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.deviceName}>{pairedDevice.name}</Text>
        <View style={styles.connectedRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: pairedDevice.connected ? CONNECTED_GREEN : colors.textMuted },
            ]}
          />
          <Text
            style={[
              styles.connectionText,
              { color: pairedDevice.connected ? CONNECTED_GREEN : colors.textMuted },
            ]}
          >
            {pairedDevice.connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {pairedDevice.connected ? (
          <>
            <Text style={styles.sectionTitle}>Battery</Text>
            <Text style={styles.bigValue}>{pairedDevice.battery}%</Text>

            <Text style={styles.sectionTitle}>BLE Signal</Text>
            <Text style={styles.bigValue}>{pairedDevice.signal}</Text>

            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Model</Text>
              <Text style={styles.plainValue}>BumpCare Belt</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Device ID</Text>
              <Text style={styles.plainValue}>{pairedDevice.id}</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Firmware</Text>
              <Text style={styles.plainValue}>{pairedDevice.firmware}</Text>
            </View>

            <Text style={styles.sectionTitle}>Sensors</Text>
            <View style={styles.card}>
              {Object.entries(sensors).map(([key, status]) => (
                <View key={key} style={styles.cardRow}>
                  <Text style={styles.cardLabel}>{SENSOR_LABELS[key]}</Text>
                  <Text
                    style={[
                      styles.cardValue,
                      status === 'ready' ? styles.statusReady : styles.statusWarning,
                    ]}
                  >
                    {status === 'ready' ? '✓ Ready' : '⚠ Not responding'}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={handleDisconnect}
            >
              <Text style={styles.secondaryButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.lastConnectedText}>
              Last connected: {formatLastConnected(pairedDevice.lastConnectedAt)}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleReconnect}
              disabled={reconnecting}
            >
              {reconnecting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Reconnect</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.forgetButton}
          activeOpacity={0.7}
          onPress={handleForget}
        >
          <Text style={styles.forgetButtonText}>Forget Device</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} active="Device" />
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
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 6,
  },
  bigValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
  },
  plainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  plainLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  plainValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textDark,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusReady: {
    color: CONNECTED_GREEN,
  },
  statusWarning: {
    color: WARNING_AMBER,
  },
  lastConnectedText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  forgetButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  forgetButtonText: {
    color: '#D14343',
    fontSize: 14,
    fontWeight: '600',
  },
});
