import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useDevice } from '../context/DeviceContext';

// Shared bottom tab bar for Home / History / Device.
// Note: device connection state isn't global yet (it's still local to
// HomeScreen), so the Device tab just opens Connect Device for now — this
// gets wired to real shared state when we build Device Management.
export default function BottomNav({ navigation, active, onDevicePress }) {
  const { pairedDevice } = useDevice();
  const handleDevicePress =
    onDevicePress ||
    (() => navigation.navigate(pairedDevice ? 'DeviceDetails' : 'ConnectDevice'));

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.icon, active === 'Home' && styles.iconActive]}>🏠</Text>
        <Text style={[styles.label, active === 'Home' && styles.labelActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={[styles.icon, active === 'History' && styles.iconActive]}>🕘</Text>
        <Text style={[styles.label, active === 'History' && styles.labelActive]}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={handleDevicePress}
      >
        <Text style={[styles.icon, active === 'Device' && styles.iconActive]}>📶</Text>
        <Text style={[styles.label, active === 'Device' && styles.labelActive]}>Device</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.primary,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
