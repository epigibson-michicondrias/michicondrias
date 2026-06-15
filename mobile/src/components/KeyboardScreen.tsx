import React from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface KeyboardScreenProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    horizontal?: boolean;
}

export default function KeyboardScreen({
    children,
    style,
    contentContainerStyle,
    horizontal = false,
}: KeyboardScreenProps) {
    return (
        <KeyboardAvoidingView
            style={[styles.container, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, contentContainerStyle]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                horizontal={horizontal}
                bounces={false}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
    },
});
