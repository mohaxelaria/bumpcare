import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getAllSessions } from '../data/db';
import BottomNav from '../components/BottomNav';

const GOOD_GREEN = '#3FAE58';
const FAIR_AMBER = '#C98A2C';
const POOR_RED = '#D14343';

function formatDuration(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function qualityLabel(signalQuality) {
  if (signalQuality >= 85) return { label: 'Good', color: GOOD_GREEN };
  if (signalQuality >= 65) return { label: 'Fair', color: FAIR_AMBER };
  return { label: 'Poor', color: POOR_RED };
}

const SCAN_QUALITY_COLOR = {
  Good: { label: 'Good', color: GOOD_GREEN },
  Fair: { label: 'Fair', color: FAIR_AMBER },
  Poor: { label: 'Poor', color: POOR_RED },
};

export default function HistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllSessions()
        .then((rows) => {
          if (active) {
            setSessions(rows);
            setLoaded(true);
          }
        })
        .catch(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, [])
  );

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
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Screenings & Monitoring Sessions</Text>

        {loaded && sessions.length === 0 ? (
          <Text style={styles.emptyText}>
            Nothing recorded yet. Start Screening from Home to record one.
          </Text>
        ) : null}

        {sessions.map((session) => {
          const isScreening = session.type === 'screening';
          const quality = isScreening
            ? SCAN_QUALITY_COLOR[session.scanQuality] || SCAN_QUALITY_COLOR.Fair
            : qualityLabel(session.signalQuality);

          return (
            <TouchableOpacity
              key={session.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('SessionDetails', { sessionId: session.id })
              }
            >
              <View style={styles.cardMain}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardDate}>{formatDate(session.date)}</Text>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>
                      {isScreening ? 'Screening' : 'Monitoring'}
                    </Text>
                  </View>
                </View>

                {isScreening ? (
                  <>
                    <Text style={styles.cardMeta}>
                      Presentation: {session.presentation || 'Uncertain'}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <View style={[styles.dot, { backgroundColor: quality.color }]} />
                      <Text style={styles.cardMeta}>
                        Scan Quality: {session.scanQuality || quality.label}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.cardDuration}>
                      {formatDuration(session.durationSeconds)}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <View style={[styles.dot, { backgroundColor: quality.color }]} />
                      <Text style={styles.cardMeta}>
                        Signal Quality: {quality.label}
                      </Text>
                    </View>
                  </>
                )}
                <Text style={styles.cardMeta}>Device: {session.deviceName}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNav navigation={navigation} active="History" />
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardMain: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeTag: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  cardDuration: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
