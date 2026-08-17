import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { colors } from '../theme/colors';

const GOOD_GREEN = '#3FAE58';
const FAIR_AMBER = '#C98A2C';
const POOR_RED = '#D14343';

const PRESENTATION_DISPLAY = {
  Cephalic: { headline: 'HEAD DOWN', sub: 'Cephalic', icon: '⬇', tone: 'good' },
  Breech: { headline: 'BREECH', sub: 'Breech presentation', icon: '⬆', tone: 'warning' },
  Transverse: { headline: 'TRANSVERSE', sub: 'Transverse lie', icon: '↔', tone: 'warning' },
  Uncertain: { headline: 'UNCERTAIN', sub: 'Presentation unclear', icon: '?', tone: 'poor' },
};

const TONE_COLORS = {
  good: { color: GOOD_GREEN, bg: 'rgba(63,174,88,0.06)', border: 'rgba(63,174,88,0.35)' },
  warning: { color: FAIR_AMBER, bg: 'rgba(201,138,44,0.06)', border: 'rgba(201,138,44,0.35)' },
  poor: { color: POOR_RED, bg: 'rgba(209,67,67,0.06)', border: 'rgba(209,67,67,0.35)' },
};

const SCAN_QUALITY_COLOR = {
  Good: GOOD_GREEN,
  Fair: FAIR_AMBER,
  Poor: POOR_RED,
};

export default function UltrasoundAnalysisScreen({ navigation, route }) {
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

  const display = PRESENTATION_DISPLAY[presentation] || PRESENTATION_DISPLAY.Uncertain;
  const tone = TONE_COLORS[display.tone];
  const qualityColor = SCAN_QUALITY_COLOR[scanQualityLabel] || FAIR_AMBER;

  // Purely visual — a gentle pulse on the AI detection box so the result
  // reads as an active finding rather than a static label.
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  const handleContinue = () => {
    navigation.navigate('RiskScreening', {
      deviceName,
      battery,
      startedAt,
      presentation,
      confidence,
      bpd,
      hc,
      scanQualityLabel,
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
        <Text style={styles.headerTitle}>Scan Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚠ Experimental AI Analysis — demo data</Text>
        </View>

        <ImageBackground
          source={require('../assets/fetalhead.png')}
          style={styles.imageBox}
          imageStyle={styles.imageBoxImage}
          resizeMode="cover"
        >
          <View style={styles.imageDarkOverlay} pointerEvents="none" />

          <View style={styles.aiTag}>
            <View style={styles.aiTagDot} />
            <Text style={styles.aiTagText}>AI DETECTED</Text>
          </View>

          <Animated.View
            style={[
              styles.detectionBox,
              { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
            ]}
          >
            <View style={[styles.cornerBracket, styles.cornerTL]} />
            <View style={[styles.cornerBracket, styles.cornerTR]} />
            <View style={[styles.cornerBracket, styles.cornerBL]} />
            <View style={[styles.cornerBracket, styles.cornerBR]} />
          </Animated.View>
          <Text style={styles.detectionLabel}>Fetal head</Text>
        </ImageBackground>

        <View style={[styles.presentationCard, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          <View style={styles.presentationTop}>
            <Text style={[styles.presentationIcon, { color: tone.color }]}>{display.icon}</Text>
            <View style={styles.presentationTextGroup}>
              <Text style={styles.sectionTitle}>Fetal Presentation</Text>
              <Text style={styles.headline}>{display.headline}</Text>
              <Text style={styles.subheadline}>{display.sub}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, styles.spaced]}>AI Detection Confidence</Text>
        <View style={styles.confidenceBarTrack}>
          <View style={[styles.confidenceBarFill, { width: `${confidence}%` }]} />
        </View>
        <Text style={styles.confidenceValue}>{confidence}%</Text>

        <Text style={[styles.sectionTitle, styles.spaced]}>Fetal Measurements</Text>
        <View style={styles.measurementRow}>
          <View style={styles.measurementCard}>
            <Text style={styles.measurementLabel}>BPD</Text>
            <Text style={styles.measurementValue}>{bpd} mm</Text>
          </View>
          <View style={styles.measurementCard}>
            <Text style={styles.measurementLabel}>HC</Text>
            <Text style={styles.measurementValue}>{hc} mm</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, styles.spaced]}>Scan Quality</Text>
        <View style={styles.qualityPill}>
          <View style={[styles.qualityDot, { backgroundColor: qualityColor }]} />
          <Text style={[styles.qualityPillText, { color: qualityColor }]}>
            {scanQualityLabel.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  badge: {
    backgroundColor: '#FFF4E5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B5710F',
  },
  imageBox: {
    height: 210,
    borderRadius: 16,
    backgroundColor: '#1B1F24',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageBoxImage: {
    borderRadius: 16,
  },
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,14,18,0.25)',
  },
  aiTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  aiTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOOD_GREEN,
    marginRight: 5,
  },
  aiTagText: {
    color: '#E8ECEF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detectionBox: {
    width: 140,
    height: 110,
    borderRadius: 8,
  },
  cornerBracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: GOOD_GREEN,
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3 },
  detectionLabel: {
    position: 'absolute',
    bottom: 10,
    color: '#5FD68A',
    fontSize: 12,
    fontWeight: '700',
  },
  presentationCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  presentationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presentationIcon: {
    fontSize: 28,
    fontWeight: '700',
    width: 40,
  },
  presentationTextGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  spaced: {
    marginTop: 20,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subheadline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  confidenceBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  qualityPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 32,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
