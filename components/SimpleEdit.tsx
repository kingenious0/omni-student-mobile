import React from 'react';
import { Text, TextProps } from 'react-native';

interface SimpleEditProps extends TextProps {
    id?: string;
    text: string;
    tag?: string; // Ignored in RN
    className?: string; // Handled by NativeWind
}

export default function SimpleEdit({ text, className, ...props }: SimpleEditProps) {
    // In the future, this component can handle inline editing
    return (
        <Text className={className} {...props}>
            {text}
        </Text>
    );
}
