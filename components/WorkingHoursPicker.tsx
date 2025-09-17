import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Clock, Check } from 'lucide-react-native';

interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    available: boolean;
  };
}

interface WorkingHoursPickerProps {
  workingHours: WorkingHours;
  onUpdate: (workingHours: WorkingHours) => void;
}

const days = [
  { key: 'monday', label: 'Luni' },
  { key: 'tuesday', label: 'Marți' },
  { key: 'wednesday', label: 'Miercuri' },
  { key: 'thursday', label: 'Joi' },
  { key: 'friday', label: 'Vineri' },
  { key: 'saturday', label: 'Sâmbătă' },
  { key: 'sunday', label: 'Duminică' },
];

export const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({
  workingHours,
  onUpdate,
}) => {
  const toggleDay = (day: string) => {
    const updatedHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        available: !workingHours[day].available,
      },
    };
    onUpdate(updatedHours);
  };

  const updateTime = (day: string, field: 'start' | 'end', value: string) => {
    const updatedHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    };
    onUpdate(updatedHours);
  };

  return (
    <View style={styles.container}>
      {days.map(({ key, label }) => (
        <View key={key} style={styles.dayContainer}>
          <TouchableOpacity
            style={styles.dayHeader}
            onPress={() => toggleDay(key)}
          >
            <View style={styles.dayInfo}>
              <Clock size={20} color="#6b7280" />
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
            <View style={[
              styles.toggle,
              workingHours[key].available && styles.toggleActive
            ]}>
              {workingHours[key].available && <Check size={16} color="#ffffff" />}
            </View>
          </TouchableOpacity>

          {workingHours[key].available && (
            <View style={styles.timeInputs}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>De la:</Text>
                <TextInput
                  style={styles.timeInputField}
                  value={workingHours[key].start}
                  onChangeText={(text) => updateTime(key, 'start', text)}
                  placeholder="09:00"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Până la:</Text>
                <TextInput
                  style={styles.timeInputField}
                  value={workingHours[key].end}
                  onChangeText={(text) => updateTime(key, 'end', text)}
                  placeholder="17:00"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dayContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  timeInputs: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeInputField: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
});

export default WorkingHoursPicker;
