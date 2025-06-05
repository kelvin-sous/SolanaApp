import { StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../constants/typography';

export const styles = StyleSheet.create({
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