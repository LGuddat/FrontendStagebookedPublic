import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ViewProps,
  TextProps,
  TouchableOpacityProps,
  TextInputProps,
  ScrollViewProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { commonStyles } from '../../constants/Theme';

// Container components
export const Container: React.FC<ViewProps> = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundColor },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export const Card: React.FC<ViewProps> = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBgColor,
          borderColor: theme.borderColor,
          ...commonStyles.shadow,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Typography components
export const Title: React.FC<TextProps> = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.title,
        { color: theme.textColor },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Subtitle: React.FC<TextProps> = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.subtitle,
        { color: theme.secondaryTextColor },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const BodyText: React.FC<TextProps> = ({ style, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.bodyText,
        { color: theme.secondaryTextColor },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Button components
interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  style,
  children,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const { theme } = useTheme();

  const buttonStyles = {
    primary: {
      backgroundColor: theme.buttonBgColor,
      borderColor: theme.buttonBgColor,
    },
    secondary: {
      backgroundColor: theme.accentBgColor,
      borderColor: theme.accentBgColor,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.buttonOutlineBorderColor,
    },
  };

  const textColors = {
    primary: theme.buttonTextColor,
    secondary: theme.buttonTextColor,
    outline: theme.buttonOutlineTextColor,
  };

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles[variant],
        sizeStyles[size],
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          { color: textColors[variant] },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Input components
export const Input: React.FC<TextInputProps> = ({ style, ...props }) => {
  const { theme } = useTheme();
  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.inputBgColor,
          color: theme.textColor,
          borderColor: theme.borderColor,
        },
        style,
      ]}
      placeholderTextColor={theme.placeholderColor}
      {...props}
    />
  );
};

// ScrollView with theme
export const ThemedScrollView: React.FC<ScrollViewProps> = ({
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={[
        { backgroundColor: theme.backgroundColor },
        style,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: commonStyles.spacing.md,
  },
  card: {
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.spacing.md,
    borderWidth: 1,
    marginVertical: commonStyles.spacing.sm,
  },
  title: {
    ...commonStyles.typography.h1,
    marginBottom: commonStyles.spacing.sm,
  },
  subtitle: {
    ...commonStyles.typography.h2,
    marginBottom: commonStyles.spacing.sm,
  },
  bodyText: {
    ...commonStyles.typography.body,
  },
  button: {
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...commonStyles.typography.button,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.spacing.md,
    ...commonStyles.typography.body,
  },
}); 