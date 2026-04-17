import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

interface DatePickerInputProps {
  testID: string;
  value: string;
  placeholder?: string;
  onDateChange: (dateStr: string) => void;
}

export default function DatePickerInput({
  testID,
  value,
  placeholder = 'YYYY-MM-DD',
  onDateChange,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const currentDate = isValidDate ? new Date(value + 'T00:00:00') : new Date();

  return (
    <View style={styles.row}>
      <TextInput
        testID={testID}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onDateChange}
      />
      <TouchableOpacity
        testID={`${testID}_button`}
        style={styles.pickerBtn}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.pickerBtnText}>📅</Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={currentDate}
        mode="date"
        onConfirm={(date) => {
          setOpen(false);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          onDateChange(`${year}-${month}-${day}`);
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
