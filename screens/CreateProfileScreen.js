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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { useProfile } from '../context/ProfileContext';

const MIN_AGE = 13;
const MAX_AGE = 60;
const MAX_EDD_DAYS_AHEAD = 310; // ~10 months out, generous upper bound
const WEEK_OPTIONS = Array.from({ length: 42 }, (_, i) => i + 1);

function formatDate(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function yearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.segmentedOption, active && styles.segmentedOptionActive]}
            activeOpacity={0.8}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[styles.segmentedText, active && styles.segmentedTextActive]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CreateProfileScreen({ navigation }) {
  const { setProfile } = useProfile();

  const [name, setName] = useState('');
  const [dob, setDob] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [pregnancyWeek, setPregnancyWeek] = useState(28);
  const [edd, setEdd] = useState(null);
  const [showEddPicker, setShowEddPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Obstetric history — optional context, not required to continue.
  const [isFirstPregnancy, setIsFirstPregnancy] = useState(null);
  const [previousDeliveryType, setPreviousDeliveryType] = useState(null);
  const [previousObstructedLabour, setPreviousObstructedLabour] = useState(null);
  const [otherHistoryNotes, setOtherHistoryNotes] = useState('');

  const onChangeDob = (event, selectedDate) => {
    setShowDobPicker(false);
    if (event.type === 'set' && selectedDate) {
      setDob(selectedDate);
    }
  };

  const onChangeEdd = (event, selectedDate) => {
    setShowEddPicker(false);
    if (event.type === 'set' && selectedDate) {
      setEdd(selectedDate);
    }
  };

  const validate = () => {
    const next = {};
    const today = new Date();

    if (!name.trim()) {
      next.name = 'Name is required.';
    }

    if (!(pregnancyWeek >= 1 && pregnancyWeek <= 42)) {
      next.pregnancyWeek = 'Pregnancy week must be between 1 and 42.';
    }

    if (!dob) {
      next.dob = 'Please select your date of birth.';
    } else if (dob > today || dob < yearsAgo(MAX_AGE) || dob > yearsAgo(MIN_AGE)) {
      next.dob = 'Please enter a valid date of birth.';
    }

    if (!edd) {
      next.edd = 'Please select the expected delivery date.';
    } else if (edd < addDays(today, -14) || edd > addDays(today, MAX_EDD_DAYS_AHEAD)) {
      next.edd = 'Please enter a valid expected delivery date.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setProfile({
      name: name.trim(),
      dob,
      pregnancyWeek,
      edd,
      isFirstPregnancy: isFirstPregnancy === 'Yes',
      previousDeliveryType: isFirstPregnancy === 'No' ? previousDeliveryType : null,
      previousObstructedLabour,
      otherHistoryNotes: otherHistoryNotes.trim(),
    });

    navigation.replace('Home', { name: name.trim(), pregnancyWeek });
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
        <Text style={styles.headerTitle}>Create Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="e.g. Sarah Johnson"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={[styles.input, errors.dob && styles.inputError]}
          onPress={() => setShowDobPicker(true)}
        >
          <Text style={dob ? styles.inputValueText : styles.inputPlaceholderText}>
            {dob ? formatDate(dob) : 'DD / MM / YYYY'}
          </Text>
        </TouchableOpacity>
        {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
        {showDobPicker && (
          <DateTimePicker
            value={dob || yearsAgo(25)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            minimumDate={yearsAgo(MAX_AGE)}
            onChange={onChangeDob}
          />
        )}

        <Text style={styles.label}>Pregnancy Week</Text>
        <View style={[styles.input, styles.pickerWrapper]}>
          <Picker
            selectedValue={pregnancyWeek}
            onValueChange={setPregnancyWeek}
            style={styles.picker}
            dropdownIconColor={colors.textDark}
          >
            {WEEK_OPTIONS.map((week) => (
              <Picker.Item key={week} label={`${week} weeks`} value={week} />
            ))}
          </Picker>
        </View>
        {errors.pregnancyWeek ? (
          <Text style={styles.errorText}>{errors.pregnancyWeek}</Text>
        ) : null}

        <Text style={styles.label}>Expected Delivery Date</Text>
        <TouchableOpacity
          style={[styles.input, errors.edd && styles.inputError]}
          onPress={() => setShowEddPicker(true)}
        >
          <Text style={edd ? styles.inputValueText : styles.inputPlaceholderText}>
            {edd ? formatDate(edd) : 'DD / MM / YYYY'}
          </Text>
        </TouchableOpacity>
        {errors.edd ? <Text style={styles.errorText}>{errors.edd}</Text> : null}
        {showEddPicker && (
          <DateTimePicker
            value={edd || new Date()}
            mode="date"
            display="default"
            minimumDate={addDays(new Date(), -14)}
            maximumDate={addDays(new Date(), MAX_EDD_DAYS_AHEAD)}
            onChange={onChangeEdd}
          />
        )}

        <Text style={styles.sectionHeading}>Obstetric History (optional)</Text>
        <Text style={styles.sectionSubtext}>
          Helps provide context alongside the ultrasound screening — not
          required to continue.
        </Text>

        <Text style={styles.label}>Is this your first pregnancy?</Text>
        <Segmented
          options={['Yes', 'No']}
          value={isFirstPregnancy}
          onChange={setIsFirstPregnancy}
        />

        {isFirstPregnancy === 'No' && (
          <>
            <Text style={styles.label}>Previous delivery type</Text>
            <Segmented
              options={['Vaginal', 'C-section', 'Both']}
              value={previousDeliveryType}
              onChange={setPreviousDeliveryType}
            />
          </>
        )}

        <Text style={styles.label}>Known previous obstructed labour?</Text>
        <Segmented
          options={['Yes', 'No', 'Unsure']}
          value={previousObstructedLabour}
          onChange={setPreviousObstructedLabour}
        />

        <Text style={styles.label}>Other relevant history</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Optional notes for clinician context..."
          placeholderTextColor={colors.textMuted}
          value={otherHistoryNotes}
          onChangeText={setOtherHistoryNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
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
  backButton: {
    width: 32,
  },
  backArrow: {
    fontSize: 22,
    color: colors.textDark,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSpacer: {
    width: 32,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#D14343',
  },
  inputValueText: {
    fontSize: 15,
    color: colors.textDark,
  },
  inputPlaceholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  pickerWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textDark,
  },
  errorText: {
    color: '#D14343',
    fontSize: 12,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 32,
  },
  sectionSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentedOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
  },
  segmentedTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
