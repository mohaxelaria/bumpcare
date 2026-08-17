import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getSessionById, deleteSession } from '../data/db';

function formatDuration(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function formatDateParts(isoString) {
  const d = new Date(isoString);
  const date = d.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { date, time };
}

function averageOf(series) {
  if (!series || series.length === 0) return 0;
  const sum = series.reduce((a, b) => a + b, 0);
  return Math.round(sum / series.length);
}

function buildReportText(session) {
  const { date, time } = formatDateParts(session.date);

  if (session.type === 'screening') {
    return [
      'BumpCare Screening Report (Experimental AI Analysis)',
      `Date: ${date}`,
      `Time: ${time}`,
      `Device: ${session.deviceName}`,
      '',
      'Fetal Presentation',
      `${session.presentation} (confidence ${session.presentationConfidence}%)`,
      '',
      'Fetal Measurements',
      `BPD: ${session.bpd} mm`,
      `HC: ${session.hc} mm`,
      '',
      `Scan Quality: ${session.scanQuality}`,
      `Fetal Size: ${session.sizeRiskFlag}`,
      '',
      'Screening Result',
      session.screeningResult,
      '',
      'This screening does not diagnose obstructed labour.',
    ].join('\n');
  }

  return [
    'BumpCare Session Report',
    `Date: ${date}`,
    `Time: ${time}`,
    `Duration: ${formatDuration(session.durationSeconds)}`,
    `Device: ${session.deviceName}`,
    '',
    'Monitoring Quality',
    `Contact: ${session.contactQuality}`,
    `Stability: ${session.stability}`,
    `Signal: ${session.signalQuality}%`,
    '',
    'Sensor Summary',
    `Average Contact: ${averageOf(session.pressureSeries)}%`,
    `Movement: ${session.movement}`,
    `Packets Received: ${session.packetsReceived}`,
    '',
    session.notes ? `Notes: ${session.notes}` : 'Notes: (none)',
  ].join('\n');
}

export default function SessionDetailsScreen({ navigation, route }) {
  const { sessionId } = route?.params || {};
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getSessionById(sessionId)
        .then((row) => {
          if (active) {
            setSession(row);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [sessionId])
  );

  const handleExport = async () => {
    if (!session) return;
    try {
      await Share.share({ message: buildReportText(session) });
    } catch (err) {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record?',
      'This record and its data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
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
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingBox}>
          <Text style={styles.emptyText}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time } = formatDateParts(session.date);

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
        <Text style={styles.headerTitle}>
          {session.type === 'screening' ? 'Screening Details' : 'Session Details'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Date</Text>
          <Text style={styles.plainValue}>{date}</Text>
        </View>
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Time</Text>
          <Text style={styles.plainValue}>{time}</Text>
        </View>
        {session.type !== 'screening' && (
          <View style={styles.plainRow}>
            <Text style={styles.plainLabel}>Duration</Text>
            <Text style={styles.plainValue}>
              {formatDuration(session.durationSeconds)}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Device</Text>
        <Text style={styles.deviceName}>{session.deviceName}</Text>

        {session.type === 'screening' ? (
          <>
            <Text style={styles.sectionTitle}>Fetal Presentation</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Presentation</Text>
                <Text style={styles.cardValue}>{session.presentation}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Confidence</Text>
                <Text style={styles.cardValue}>
                  {session.presentationConfidence}%
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Fetal Measurements</Text>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>BPD</Text>
              <Text style={styles.plainValue}>{session.bpd} mm</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>HC</Text>
              <Text style={styles.plainValue}>{session.hc} mm</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Scan Quality</Text>
              <Text style={styles.plainValue}>{session.scanQuality}</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Fetal Size</Text>
              <Text style={styles.plainValue}>{session.sizeRiskFlag}</Text>
            </View>

            <Text style={styles.sectionTitle}>Screening Result</Text>
            <Text style={styles.notesText}>{session.screeningResult}</Text>
            <Text style={styles.experimentalNote}>
              Experimental AI analysis — for prototype/demo purposes only. This
              screening does not diagnose obstructed labour.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Monitoring Quality</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Contact</Text>
                <Text style={styles.cardValue}>{session.contactQuality}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Stability</Text>
                <Text style={styles.cardValue}>{session.stability}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Signal</Text>
                <Text style={styles.cardValue}>{session.signalQuality}%</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Sensor Summary</Text>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Average Contact</Text>
              <Text style={styles.plainValue}>
                {averageOf(session.pressureSeries)}%
              </Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Movement</Text>
              <Text style={styles.plainValue}>{session.movement}</Text>
            </View>
            <View style={styles.plainRow}>
              <Text style={styles.plainLabel}>Packets Received</Text>
              <Text style={styles.plainValue}>
                {session.packetsReceived?.toLocaleString?.() ?? session.packetsReceived}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('SessionGraph', {
                  deviceName: session.deviceName,
                  durationSeconds: session.durationSeconds,
                  pressureSeries: session.pressureSeries,
                  movementSeries: session.movementSeries,
                })
              }
            >
              <Text style={styles.secondaryButtonText}>View Sensor Graph</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>
              {session.notes ? `"${session.notes}"` : 'No notes added.'}
            </Text>
          </>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleExport}
        >
          <Text style={styles.primaryButtonText}>Export Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.7}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Record</Text>
        </TouchableOpacity>
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
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  plainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 18,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 15,
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
    color: colors.textMuted,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
    fontStyle: 'italic',
  },
  experimentalNote: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#D14343',
    fontSize: 14,
    fontWeight: '600',
  },
});
