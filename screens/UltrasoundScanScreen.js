import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { colors } from '../theme/colors';

const SCAN_BOX_HEIGHT = 190;

const GOOD_GREEN = '#3FAE58';
const WARNING_AMBER = '#C98A2C';
const READY_THRESHOLD = 80;

const PROCESSING_STEPS = [
  'Image preprocessing',
  'Running AI image-analysis model',
  'Identifying fetal structures',
  'Estimating presentation',
  'Extracting measurements',
  'Validating scan quality',
];

function formatElapsed(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// No real probe/ultrasound feed yet — this simulates the contact/stability
// signal (same demo pattern used in Live Monitoring) so the guidance path
// is testable, and computes a single combined "readiness" score from it.
// Contact and stability gate the score so the user always has exactly one
// thing to fix before readiness can climb — they never have to interpret
// raw numbers themselves.
function useScanSimulation() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const probeGood = tick < 4 || tick >= 7;
  const stable = tick < 5 || tick >= 8;
  const rawQuality = probeGood && stable ? 88 + (tick % 5) : 45 + (tick % 10);
  const quality = Math.min(99, rawQuality);

  let readiness = quality;
  if (!probeGood) readiness = Math.min(readiness, 40);
  else if (!stable) readiness = Math.min(readiness, 60);

  return { probeGood, stable, quality, readiness: Math.min(99, readiness), elapsed: tick };
}

// BumpCare interprets the sensor signals for the user and gives one clear
// instruction at a time, instead of making them read raw values.
function getGuidance({ probeGood, stable, readiness }) {
  if (!probeGood) return { text: 'Increase probe contact', ready: false };
  if (!stable) return { text: 'Hold still', ready: false };
  if (readiness < READY_THRESHOLD) {
    return { text: 'Adjust probe position for a clearer image', ready: false };
  }
  return { text: 'Probe position good', ready: true };
}

function generateScanResult(scanQualityPercent) {
  const roll = Math.random();
  let presentation;
  if (roll < 0.7) presentation = 'Cephalic';
  else if (roll < 0.85) presentation = 'Breech';
  else if (roll < 0.95) presentation = 'Transverse';
  else presentation = 'Uncertain';

  const confidence =
    presentation === 'Cephalic'
      ? 88 + Math.round(Math.random() * 9)
      : 62 + Math.round(Math.random() * 20);

  const bpd = 80 + Math.round(Math.random() * 14);
  const hc = 300 + Math.round(Math.random() * 28);

  const scanQualityLabel =
    scanQualityPercent >= 80 ? 'Good' : scanQualityPercent >= 60 ? 'Fair' : 'Poor';

  return { presentation, confidence, bpd, hc, scanQualityLabel };
}

export default function UltrasoundScanScreen({ navigation, route }) {
  const { deviceName = 'BumpCare Belt', battery = 84 } = route?.params || {};
  const { probeGood, stable, readiness, elapsed } = useScanSimulation();
  const guidance = getGuidance({ probeGood, stable, readiness });

  const [capturing, setCapturing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const startedAtRef = useRef(new Date().toISOString());
  const readinessRef = useRef(readiness);
  readinessRef.current = readiness;

  // Purely visual — a looping sweep line over the preview image so the
  // "live" ultrasound feed reads as active/moving rather than a static photo.
  const sweepAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sweepAnim]);
  const sweepTranslateY = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, SCAN_BOX_HEIGHT],
  });

  const handleCapture = () => {
    if (!guidance.ready) return;
    setCapturing(true);
    setStepIndex(0);
  };

  useEffect(() => {
    if (!capturing) return undefined;

    if (stepIndex >= PROCESSING_STEPS.length) {
      const result = generateScanResult(readinessRef.current);
      navigation.replace('UltrasoundAnalysis', {
        deviceName,
        battery,
        startedAt: startedAtRef.current,
        ...result,
      });
      return undefined;
    }

    const timer = setTimeout(() => {
      setStepIndex((i) => i + 1);
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturing, stepIndex]);

  if (capturing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.processingBox}>
          <Text style={styles.processingTitle}>Analyzing Scan...</Text>
          {PROCESSING_STEPS.map((step, i) => (
            <View key={step} style={styles.processingRow}>
              {i < stepIndex ? (
                <Text style={styles.processingDone}>✓</Text>
              ) : i === stepIndex ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.processingPending}>○</Text>
              )}
              <Text
                style={[
                  styles.processingLabel,
                  i <= stepIndex && styles.processingLabelActive,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
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
        <Text style={styles.headerTitle}>Ultrasound Scan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <ImageBackground
          source={require('../assets/ultrasoundPreview.png')}
          style={styles.imageBox}
          imageStyle={styles.imageBoxImage}
          resizeMode="cover"
        >
          <View style={styles.imageDarkOverlay} pointerEvents="none" />

          <Animated.View
            style={[styles.scanLineBand, { transform: [{ translateY: sweepTranslateY }] }]}
            pointerEvents="none"
          >
            <View style={styles.scanLineGlow} />
            <View style={styles.scanLineCore} />
            <View style={styles.scanLineGlow} />
          </Animated.View>

          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>DEMO</Text>
          </View>

          <View style={styles.targetOverlay} pointerEvents="none">
            <View style={[styles.cornerBracket, styles.cornerTL]} />
            <View style={[styles.cornerBracket, styles.cornerTR]} />
            <View style={[styles.cornerBracket, styles.cornerBL]} />
            <View style={[styles.cornerBracket, styles.cornerBR]} />
            <Text style={styles.targetOverlayText}>Scan area</Text>
          </View>

          <Text style={styles.imageBoxCaption}>Live Ultrasound Preview</Text>
        </ImageBackground>

        <View style={styles.guidanceDotRow}>
          <View style={[styles.dot, guidance.ready ? styles.dotGood : styles.dotWarning]} />
          <Text style={[styles.guidanceText, guidance.ready ? styles.good : styles.warning]}>
            {guidance.text}
          </Text>
        </View>
        {!guidance.ready && (
          <Text style={styles.guidanceSubtext}>Keep the probe steady for a clearer scan</Text>
        )}

        <View style={styles.cardsRow}>
          <View style={[styles.statusCard, probeGood ? styles.cardGood : styles.cardWarning]}>
            <Text style={styles.cardLabel}>Contact</Text>
            <Text style={[styles.cardValue, probeGood ? styles.good : styles.warning]}>
              {probeGood ? 'GOOD' : 'POOR'}
            </Text>
          </View>
          <View style={[styles.statusCard, stable ? styles.cardGood : styles.cardWarning]}>
            <Text style={styles.cardLabel}>Stability</Text>
            <Text style={[styles.cardValue, stable ? styles.good : styles.warning]}>
              {stable ? 'STABLE' : 'UNSTABLE'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Scan Readiness</Text>
        <View style={styles.qualityBarTrack}>
          <View
            style={[
              styles.qualityBarFill,
              { width: `${readiness}%` },
              !guidance.ready && styles.qualityBarFillWarning,
            ]}
          />
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.qualityPercent}>{readiness}%</Text>
          {guidance.ready && <Text style={styles.readyText}>✓ Ready to capture</Text>}
        </View>

        <Text style={styles.deviceTimerText}>
          {deviceName} · {formatElapsed(elapsed)}
        </Text>

        <TouchableOpacity
          style={[styles.captureButton, !guidance.ready && styles.captureButtonDisabled]}
          activeOpacity={guidance.ready ? 0.85 : 1}
          onPress={handleCapture}
          disabled={!guidance.ready}
        >
          <Text
            style={[
              styles.captureButtonText,
              !guidance.ready && styles.captureButtonTextDisabled,
            ]}
          >
            {guidance.ready ? 'Capture Ultrasound' : 'Adjust Probe'}
          </Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  imageBox: {
    height: SCAN_BOX_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#1B1F24',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  imageBoxImage: {
    borderRadius: 16,
  },
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,14,18,0.35)',
  },
  scanLineBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
  },
  scanLineGlow: {
    height: 8,
    backgroundColor: 'rgba(120,220,255,0.12)',
  },
  scanLineCore: {
    height: 2,
    backgroundColor: 'rgba(160,230,255,0.85)',
  },
  recBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E15757',
    marginRight: 5,
  },
  recText: {
    color: '#8A94A0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  targetOverlay: {
    width: 130,
    height: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetOverlayText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
  cornerBracket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#FFFFFF',
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  imageBoxCaption: {
    position: 'absolute',
    bottom: 8,
    color: '#8A94A0',
    fontSize: 11,
  },
  guidanceDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGood: {
    backgroundColor: GOOD_GREEN,
  },
  dotWarning: {
    backgroundColor: WARNING_AMBER,
  },
  guidanceText: {
    fontSize: 15,
    fontWeight: '700',
  },
  guidanceSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
    marginLeft: 16,
  },
  good: {
    color: GOOD_GREEN,
  },
  warning: {
    color: WARNING_AMBER,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  cardGood: {
    borderColor: 'rgba(63,174,88,0.35)',
    backgroundColor: 'rgba(63,174,88,0.06)',
  },
  cardWarning: {
    borderColor: 'rgba(201,138,44,0.35)',
    backgroundColor: 'rgba(201,138,44,0.06)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  qualityBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  qualityBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  qualityBarFillWarning: {
    backgroundColor: WARNING_AMBER,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  qualityPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  readyText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOOD_GREEN,
  },
  deviceTimerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 'auto',
  },
  captureButtonDisabled: {
    backgroundColor: colors.border,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButtonTextDisabled: {
    color: colors.textMuted,
  },
  processingBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 28,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  processingDone: {
    width: 24,
    fontSize: 16,
    color: GOOD_GREEN,
    fontWeight: '700',
  },
  processingPending: {
    width: 24,
    fontSize: 14,
    color: colors.border,
  },
  processingLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 10,
  },
  processingLabelActive: {
    color: colors.textDark,
    fontWeight: '600',
  },
});
