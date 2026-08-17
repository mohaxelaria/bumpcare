import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { insertSession } from '../data/db';

const CONNECTED_GREEN = '#3FAE58';

function formatDuration(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Turns what actually happened during the session (from Live Monitoring)
// into a plain-language quality summary. This deliberately stops at
// "was the device positioned/working well" — it does not attempt any
// medical assessment (e.g. no risk scoring).
function computeQuality({ hadInstability, hadDisconnect }) {
  return {
    contactQuality: hadDisconnect ? 'Fair' : 'Good',
    stability: hadInstability ? 'Moderate' : 'Stable',
    signalQuality: hadDisconnect ? 78 : 92,
    movement: hadInstability ? 'Moderate' : 'Low',
    pressureRange: 'Normal Range',
  };
}

// Fake per-session time series so History → Session Details → View Sensor
// Graph has real stored/retrieved data to render, until actual per-second
// ESP32 readings are captured during Live Monitoring.
function generateSeries(good) {
  const points = 24;
  const base = good ? 72 : 55;
  return Array.from({ length: points }, () => {
    const v = base + (Math.random() * 26 - 13);
    return Math.max(10, Math.min(100, Math.round(v)));
  });
}

export default function SessionSummaryScreen({ navigation, route }) {
  const {
    deviceName = 'BumpCare Belt',
    battery = 79,
    durationSeconds = 0,
    hadInstability = false,
    hadDisconnect = false,
  } = route?.params || {};

  const quality = computeQuality({ hadInstability, hadDisconnect });

  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const id = `SES-${Date.now().toString().slice(-6)}`;
      const packetsReceived = Math.round(
        durationSeconds * (hadDisconnect ? 3.5 : 4.8)
      );

      await insertSession({
        id,
        type: 'monitoring',
        date: new Date().toISOString(),
        durationSeconds,
        deviceName,
        batteryEnd: battery,
        contactQuality: quality.contactQuality,
        stability: quality.stability,
        signalQuality: quality.signalQuality,
        movement: quality.movement,
        pressureRange: quality.pressureRange,
        notes: notes.trim(),
        pressureSeries: generateSeries(quality.contactQuality === 'Good'),
        movementSeries: generateSeries(quality.stability === 'Stable'),
        packetsReceived,
      });

      setSessionId(id);
      setSaved(true);
    } catch (err) {
      Alert.alert(
        'Save failed',
        'Something went wrong saving this session. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Session?',
      'This session will not be saved. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  if (saved) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.savedBox}>
          <Text style={styles.savedTitle}>Session saved successfully.</Text>
          {sessionId ? (
            <Text style={styles.savedSessionId}>Session ID: {sessionId}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SessionDetails', { sessionId })}
          >
            <Text style={styles.primaryButtonText}>View Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Session Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.completedText}>Session Completed ✓</Text>

        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Duration</Text>
          <Text style={styles.plainValue}>{formatDuration(durationSeconds)}</Text>
        </View>
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Device</Text>
          <Text style={styles.plainValue}>{deviceName}</Text>
        </View>
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Battery End</Text>
          <Text style={styles.plainValue}>{battery}%</Text>
        </View>

        <Text style={styles.sectionTitle}>Monitoring Quality</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Belt Contact</Text>
            <Text style={styles.cardValue}>{quality.contactQuality}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Stability</Text>
            <Text style={styles.cardValue}>{quality.stability}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Signal Quality</Text>
            <Text style={styles.cardValue}>{quality.signalQuality}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sensor Summary</Text>
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Pressure</Text>
          <Text style={styles.plainValue}>{quality.pressureRange}</Text>
        </View>
        <View style={styles.plainRow}>
          <Text style={styles.plainLabel}>Movement</Text>
          <Text style={styles.plainValue}>{quality.movement}</Text>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add session notes..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving...' : 'Save Session'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardButton}
          activeOpacity={0.7}
          onPress={handleDiscard}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
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
  completedText: {
    fontSize: 18,
    fontWeight: '700',
    color: CONNECTED_GREEN,
    marginBottom: 20,
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
    marginBottom: 12,
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
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
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
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  discardButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  discardButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  savedBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  savedTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  savedSessionId: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
});
