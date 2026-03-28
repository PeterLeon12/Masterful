import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthLevel {
  level: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  color: string;
  label: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (password: string): StrengthLevel => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Determine strength level
    if (score < 2) {
      return { level: 'weak', score, color: '#ef4444', label: 'Slabă' };
    } else if (score < 3) {
      return { level: 'fair', score, color: '#f59e0b', label: 'Acceptabilă' };
    } else if (score < 4) {
      return { level: 'good', score, color: '#3b82f6', label: 'Bună' };
    } else {
      return { level: 'strong', score, color: '#10b981', label: 'Puternică' };
    }
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            style={[
              styles.bar,
              {
                backgroundColor: segment <= strength.score ? strength.color : '#e5e7eb',
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        Parolă {strength.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  bar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PasswordStrengthIndicator;
