import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';

interface DatePickerInputProps {
  testID: string;
  value: string;
  placeholder?: string;
  onDateChange: (dateStr: string) => void;
  minimumDate?: Date;
}

export default function DatePickerInput({
  testID,
  value,
  placeholder = 'Select date',
  onDateChange,
  minimumDate,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  const displayDate = value || placeholder;
  const isPlaceholder = !value;

  const currentDate = value ? new Date(value + 'T00:00:00') : new Date();

  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={styles.input}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, isPlaceholder && styles.placeholder]}>
          {displayDate}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={currentDate}
        mode="date"
        minimumDate={minimumDate}
        onConfirm={(date) => {
          setOpen(false);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          onDateChange(`${year}-${month}-${day}`);
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
