import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
  placeholder = 'HH:MM',
  onTimeChange,
}: TimePickerInputProps) {
  const [open, setOpen] = useState(false);

  const currentDate = new Date();
  const isValidTime = /^\d{2}:\d{2}$/.test(value);
  if (isValidTime) {
    const [hours, minutes] = value.split(':').map(Number);
    currentDate.setHours(hours, minutes, 0, 0);
  }

  return (
    <View style={styles.row}>
      <TextInput
        testID={testID}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onTimeChange}
      />
      <TouchableOpacity
        testID={`${testID}_button`}
        style={styles.pickerBtn}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.pickerBtnText}>🕐</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#1a1a1a',
  },
  pickerBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  pickerBtnText: {
    fontSize: 20,
  },
});
