// ========================================
// src/components/common/Button/index.tsx
// Componente de botão reutilizável
// ========================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
  StyleSheet
} from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../constants/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' || variant === 'ghost' ? '#373737' : '#FFF'} 
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  
  // Variants
  primary: {
    backgroundColor: '#373737',
  },
  secondary: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: '#373737',
  },
  danger: {
    backgroundColor: COLORS.ERROR,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  
  // Width
  fullWidth: {
    width: '100%',
  },
  
  // State
  disabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.WHITE,
  },
  secondaryText: {
    color: '#373737',
  },
  dangerText: {
    color: COLORS.WHITE,
  },
  ghostText: {
    color: '#373737',
  },
  
  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.base,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  
  // Icon
  icon: {
    marginRight: 8,
    fontSize: 18,
  },
});

export default Button;