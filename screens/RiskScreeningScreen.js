import React, { useState } from 'react';
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
import { insertSession } from '../data/db';
import { useProfile } from '../context/ProfileContext';

const GOOD_GREEN = '#3FAE58';
const WARNING_AMBER = '#C98A2C';

// Simple, size-related "flag or not" heuristic — deliberately NOT a
// diagnosis. This never outputs a risk percentage or a pass/fail on
// obstructed labour itself, per the scientific-responsibility guidance:
// it only says whether the measurements landed in a range worth a
// clinician's second look.
function evaluateSizeFlag(bpd, hc, presentation) {
  const measurementsUnusual = bpd > 92 || hc > 325;
  const uncertainPresentation = presentation === 'Uncertain';
  return measurementsUnusual || uncertainPresentation
    ? 'Review Recommended'
    : 'Recorded';
}

function evaluateHistoryFactor(profile) {
  const previousObstructedLabour = profile?.previousObstructedLabour;

  if (previousObstructedLabour === 'Yes') {
    return { ready: false, label: 'Previous obstructed labour reported' };
  }
  if (previousObstructedLabour === 'Unsure') {
    return { ready: false, label: 'Previous obstructed labour — unsure' };
  }
  if (profile?.previousDeliveryType === 'C-section') {
    return { ready: true, label: 'Previous C-section reported' };
  }
  if (profile?.isFirstPregnancy) {
    return { ready: true, label: 'First pregnancy' };
  }
  return { ready: true, label: 'No known risk reported' };
}

function buildScreeningResult({ presentation, sizeFlag, scanQualityLabel, historyFlag }) {
  if (scanQualityLabel === 'Poor') {
    return {
      icon: '⚠',
      color: WARNING_AMBER,
      message: 'Scan inconclusive — repeat scan or seek in-person assessment.',
      articleId: 'understanding-results',
    };
  }
  if (!historyFlag) {
    return {
      icon: '⚠',
      color: WARNING_AMBER,
      message: 'One or more potential factors require professional assessment.',
      articleId: 'what-is-obstructed-labour',
    };
  }
  if (presentation !== 'Cephalic' || sizeFlag === 'Review Recommended') {
    return {
      icon: '⚠',
      color: WARNING_AMBER,
      message: 'One or more potential factors require professional assessment.',
      articleId: 'understanding-results',
    };
  }
  return {
    icon: '✓',
    color: GOOD_GREEN,
    message: 'No obvious risk factor identified from this screening.',
    articleId: null,
  };
}

// Compact "why was I flagged" summary — just the factors that actually
// stood out, so the link on the result screen has real context to show
// before sending the user to the relevant education article.
function getFlaggedFactorLines({ presentation, sizeFlag, scanQualityLabel, historyFactor }) {
  const lines = [];
  if (presentation !== 'Cephalic') lines.push(`Fetal presentation: ${presentation}`);
  if (sizeFlag === 'Review Recommended') lines.push('Fetal size: Review recommended');
  if (scanQualityLabel !== 'Good') lines.push(`Scan quality: ${scanQualityLabel}`);
  if (!historyFactor.ready) lines.push(`History: ${historyFactor.label}`);
  return lines;
}

export default function RiskScreeningScreen({ navigation, route }) {
  const { profile } = useProfile();
  const {
    deviceName = 'BumpCare Belt',
    battery = 84,
    startedAt,
    presentation = 'Uncertain',
    confidence = 0,
    bpd = 0,
    hc = 0,
    scanQualityLabel = 'Fair',
  } = route?.params || {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sizeFlag = evaluateSizeFlag(bpd, hc, presentation);
  const historyFactor = evaluateHistoryFactor(profile);
  const result = buildScreeningResult({
    presentation,
    sizeFlag,
    scanQualityLabel,
    historyFlag: historyFactor.ready,
  });
  const flaggedLines = getFlaggedFactorLines({
    presentation,
    sizeFlag,
    scanQualityLabel,
    historyFactor,
  });

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const id = `SCR-${Date.now().toString().slice(-6)}`;
      const durationSeconds = startedAt
        ? Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000))
        : 60;

      await insertSession({
        id,
        type: 'screening',
        date: new Date().toISOString(),
        durationSeconds,
        deviceName,
        batteryEnd: battery,
        presentation,
        presentationConfidence: confidence,
        bpd,
        hc,
        scanQuality: scanQualityLabel,
        sizeRiskFlag: sizeFlag,
        screeningResult: result.message,
      });

      setSessionId(id);
      setSaved(true);
    } catch (err) {
      // Keep the user on the result screen so they can retry.
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.savedBox}>
          <Text style={styles.savedTitle}>Screening saved successfully.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SessionDetails', { sessionId })}
          >
            <Text style={styles.primaryButtonText}>View Result</Text>
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
        <Text style={styles.headerTitle}>Screening Result</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>Obstructed Labour Risk Factors</Text>
        <Text style={styles.notDiagnosisTag}>Screening only — not a diagnosis</Text>

        <View style={styles.factorCard}>
          <Text style={styles.factorLabel}>Fetal Presentation</Text>
          <Text
            style={[
              styles.factorValue,
              presentation === 'Cephalic' ? styles.good : styles.warning,
            ]}
          >
            {presentation === 'Cephalic' ? '✓' : '⚠'} {presentation}
          </Text>
        </View>

        <View style={styles.factorCard}>
          <Text style={styles.factorLabel}>Fetal Size</Text>
          <Text
            style={[
              styles.factorValue,
              sizeFlag === 'Recorded' ? styles.good : styles.warning,
            ]}
          >
            {sizeFlag === 'Recorded' ? '✓' : '○'} {sizeFlag}
          </Text>
        </View>

        <View style={styles.factorCard}>
          <Text style={styles.factorLabel}>Scan Quality</Text>
          <Text
            style={[
              styles.factorValue,
              scanQualityLabel === 'Good' ? styles.good : styles.warning,
            ]}
          >
            {scanQualityLabel === 'Good' ? '✓' : '⚠'} {scanQualityLabel}
          </Text>
        </View>

        <View style={styles.factorCard}>
          <Text style={styles.factorLabel}>Previous Obstetric History</Text>
          <Text
            style={[
              styles.factorValue,
              historyFactor.ready ? styles.good : styles.warning,
            ]}
          >
            {historyFactor.ready ? '✓' : '⚠'} {historyFactor.label}
          </Text>
        </View>

        <Text style={styles.sectionHeading2}>Screening Result</Text>
        <View style={styles.resultBox}>
          <Text style={[styles.resultText, { color: result.color }]}>
            {result.icon} {result.message}
          </Text>

          {result.articleId && (
            <>
              {flaggedLines.map((line) => (
                <Text key={line} style={styles.flaggedLine}>
                  {line}
                </Text>
              ))}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('EducationArticle', { id: result.articleId })
                }
              >
                <Text style={styles.whyLink}>Why does this matter?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.disclaimer}>
          This screening does not diagnose obstructed labour. Findings here are
          intended to support — not replace — clinical assessment.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving...' : 'Save Result'}
          </Text>
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
  sectionHeading: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  notDiagnosisTag: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 20,
  },
  factorCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  factorLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  factorValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  factorValueMuted: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  good: {
    color: GOOD_GREEN,
  },
  warning: {
    color: WARNING_AMBER,
  },
  sectionHeading2: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 12,
  },
  resultBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  flaggedLine: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  whyLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: 28,
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
    marginBottom: 32,
  },
});
