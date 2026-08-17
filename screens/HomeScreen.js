import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getAllSessions } from '../data/db';
import BottomNav from '../components/BottomNav';
import { useDevice } from '../context/DeviceContext';
import { useProfile } from '../context/ProfileContext';

const CONNECTED_GREEN = '#3FAE58';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function HomeScreen({ navigation, route }) {
  const { profile } = useProfile();
  const { name = 'there', pregnancyWeek = null } =
    profile || route?.params || {};

  const { pairedDevice } = useDevice();
  const deviceConnected = !!pairedDevice?.connected;

  const [recentScreening, setRecentScreening] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllSessions()
        .then((rows) => {
          if (active) {
            setRecentScreening(rows.find((r) => r.type === 'screening') || null);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const goToStartScreening = () => {
    navigation.navigate(deviceConnected ? 'DeviceCheck' : 'ConnectDevice');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.topBarLogo}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hello, {name}</Text>
          {pregnancyWeek ? (
            <Text style={styles.weekText}>Pregnancy Week {pregnancyWeek}</Text>
          ) : null}
        </View>

        <View style={styles.deviceCard}>
          <Text style={styles.deviceCardTitle}>BumpCare Belt</Text>

          {deviceConnected ? (
            <>
              <View style={styles.deviceRow}>
                <View style={styles.statusDotRow}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <Text style={styles.deviceRowValue}>
                  Battery {pairedDevice.battery}%
                </Text>
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DeviceDetails')}
              >
                <Text style={styles.secondaryButtonText}>Device Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceRowLabel}>Status</Text>
                <Text style={styles.disconnectedText}>Disconnected</Text>
              </View>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceRowLabel}>Battery</Text>
                <Text style={styles.deviceRowValue}>--</Text>
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ConnectDevice')}
              >
                <Text style={styles.secondaryButtonText}>Connect Device</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={goToStartScreening}
        >
          <Text style={styles.startButtonText}>Start Screening</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.quickAccessIcon}>🕘</Text>
            <Text style={styles.quickAccessLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Education')}
          >
            <Text style={styles.quickAccessIcon}>📚</Text>
            <Text style={styles.quickAccessLabel}>Education</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Screening</Text>
        {recentScreening ? (
          <TouchableOpacity
            style={styles.recentSessionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('SessionDetails', { sessionId: recentScreening.id })
            }
          >
            <Text style={styles.recentSessionDate}>
              {formatDate(recentScreening.date)}
            </Text>
            <Text style={styles.recentSessionMeta}>
              Presentation: {recentScreening.presentation || 'Uncertain'}
            </Text>
            <Text style={styles.recentSessionMeta}>
              Scan Quality: {recentScreening.scanQuality || '—'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.recentSessionBox}>
            <Text style={styles.recentSessionText}>No screening yet</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topBarLogo: {
    width: 120,
    height: 34,
  },
  settingsIcon: {
    fontSize: 22,
    color: colors.textDark,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  weekText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  deviceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    backgroundColor: colors.background,
  },
  deviceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
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
  disconnectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statusDotRow: {
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
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 28,
  },
  startButtonText: {
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
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  quickAccessCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  quickAccessIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
  },
  recentSessionBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  recentSessionText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  recentSessionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  recentSessionDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  recentSessionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
