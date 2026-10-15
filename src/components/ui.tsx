import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { colors } from '@/src/theme';

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  );
}

export function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipOn]}>
            <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'quiet' | 'danger';
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, variant === 'quiet' && styles.quiet, variant === 'danger' && styles.danger, disabled && styles.disabled, style]}>
      <Text style={[styles.buttonText, variant === 'quiet' && styles.quietText, variant === 'danger' && styles.dangerText]}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, extra }: { title: string; extra?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {extra ? <View>{typeof extra === 'string' ? <Text style={styles.sectionExtra}>{extra}</Text> : extra}</View> : null}
    </View>
  );
}

export function Figure({ value, unit }: { value: string; unit?: string }) {
  return (
    <Text style={styles.figure}>
      {value}
      {unit ? <Text style={styles.figureUnit}> {unit}</Text> : null}
    </Text>
  );
}

export function Countdown({ days }: { days: number }) {
  if (days === 0) return <Text style={styles.countdownLabel}>今天</Text>;
  return (
    <Text style={styles.countdownLabel}>
      {days < 0 ? '逾期 ' : '还有 '}
      <Text style={styles.figure}>{Math.abs(days)}</Text>
      <Text style={styles.figureUnit}> 天</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  error: { color: colors.danger, fontSize: 13, marginTop: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  chipTextOn: { color: colors.white },
  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quiet: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.dangerSoft },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  quietText: { color: colors.primary },
  dangerText: { color: colors.danger },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: colors.text, lineHeight: 26 },
  sectionExtra: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  figure: { color: colors.text, fontWeight: '500', fontVariant: ['tabular-nums'], fontSize: 16 },
  figureUnit: { color: colors.textSecondary, fontWeight: '400', fontSize: 13 },
  countdownLabel: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
