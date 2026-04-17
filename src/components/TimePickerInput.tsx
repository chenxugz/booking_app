import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

interface TimePickerInputProps {
  testID: string;
  value: string;
  placeholder?: string;
  onTimeChange: (timeStr: string) => void;
}

export default function TimePickerInput({
  testID,
  value,
  placeholder = 'Select time',
  onTimeChange,
}: TimePickerInputProps) {
  const [open, setOpen] = useState(false);

  const displayTime = value || placeholder;
  const isPlaceholder = !value;

  const currentDate = new Date();
  if (value) {
    const [hours, minutes] = value.split(':').map(Number);
    currentDate.setHours(hours, minutes, 0, 0);
  }

  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={styles.input}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, isPlaceholder && styles.placeholder]}>
          {displayTime}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={currentDate}
        mode="time"
        is24hourSource="locale"
        onConfirm={(date) => {
          setOpen(false);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          onTimeChange(`${hours}:${minutes}`);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholder: {
    color: '#999',
  },
});
