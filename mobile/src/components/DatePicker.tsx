import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    mode?: 'date' | 'time' | 'datetime';
    label?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    placeholder?: string;
}

export default function DatePicker({
    value,
    onChange,
    mode = 'date',
    label,
    minimumDate,
    maximumDate,
    placeholder = 'Seleccionar fecha',
}: DatePickerProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const [show, setShow] = useState(false);

    const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const displayValue = mode === 'time'
        ? formatTime(value)
        : formatDate(value);

    return (
        <View>
            {label && (
                <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            )}
            <TouchableOpacity
                style={[styles.container, {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                }]}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <Calendar size={18} color={theme.primary} />
                <Text style={[styles.value, { color: theme.text }]}>
                    {displayValue}
                </Text>
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={value}
                    mode={mode}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    themeVariant={isDark ? 'dark' : 'light'}
                    accentColor={theme.primary}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        height: 54,
        gap: 12,
    },
    value: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
});
