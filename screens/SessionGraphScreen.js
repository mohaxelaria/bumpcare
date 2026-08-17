import React from 'react';
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

function minuteLabels(durationSeconds, count) {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const step = totalMinutes / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => Math.round(i * step));
}

function Sparkline({ series, color }) {
  const safeSeries = series && series.length > 0 ? series : [0];
  return (
    <View style={styles.graphBox}>
      {safeSeries.map((value, i) => (
        <View
          key={i}
          style={[
            styles.graphBar,
            { height: `${Math.max(4, value)}%`, backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

export default function SessionGraphScreen({ navigation, route }) {
  const {
    deviceName = 'BumpCare Belt',
    durationSeconds = 0,
    pressureSeries = [],
    movementSeries = [],
  } = route?.params || {};

  const axisLabels = minuteLabels(durationSeconds, 5);

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
        <Text style={styles.headerTitle}>Sensor Graph</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.deviceName}>{deviceName}</Text>

        <Text style={styles.sectionTitle}>Pressure / Contact</Text>
        <Sparkline series={pressureSeries} color={colors.primary} />
        <View style={styles.axisRow}>
          {axisLabels.map((min, i) => (
            <Text key={i} style={styles.axisLabel}>
              {min} min
            </Text>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.secondGraphTitle]}>
          Movement / Stability
        </Text>
        <Sparkline series={movementSeries} color={colors.primaryDark} />
        <View style={styles.axisRow}>
          {axisLabels.map((min, i) => (
            <Text key={i} style={styles.axisLabel}>
              {min} min
            </Text>
          ))}
        </View>

        <Text style={styles.footnote}>
          Recorded and retrieved from this session's stored sensor data.
        </Text>
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },
  secondGraphTitle: {
    marginTop: 30,
  },
  graphBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  graphBar: {
    width: 5,
    borderRadius: 2.5,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  footnote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 28,
    textAlign: 'center',
  },
});
