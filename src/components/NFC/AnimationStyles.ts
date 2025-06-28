// ========================================
// src/components/NFC/AnimationStyles.ts
// Estilos separados para componentes de animação NFC
// ========================================

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// ========================================
// INTERFACES DE ESTILOS
// ========================================

interface NFCAnimationStyles {
  // NFCConnectionAnimation
  container: ViewStyle;
  wave: ViewStyle;
  mainCircle: ViewStyle;
  nfcIcon: ImageStyle;
  statusContainer: ViewStyle;
  statusDot: ViewStyle;
  
  // NFCStatusIndicator
  statusIndicator: ViewStyle;
  statusText: TextStyle;
  
  // NFCTransactionPreview
  previewContainer: ViewStyle;
  previewTitle: TextStyle;
  amountContainer: ViewStyle;
  amountLabel: TextStyle;
  amountValue: TextStyle;
  amountSOL: TextStyle;
  detailsContainer: ViewStyle;
  detailRow: ViewStyle;
  detailLabel: TextStyle;
  detailValue: TextStyle;
  buttonsContainer: ViewStyle;
  confirmButton: ViewStyle;
  confirmButtonText: TextStyle;
  rejectButton: ViewStyle;
  rejectButtonText: TextStyle;
  buttonDisabled: ViewStyle;
  
  // Estilos adicionais para animações avançadas
  pulsingCircle: ViewStyle;
  rotatingElement: ViewStyle;
  fadeInElement: ViewStyle;
  slideInElement: ViewStyle;
  glowEffect: ViewStyle;
  connectionLine: ViewStyle;
  dataParticle: ViewStyle;
  waveRipple: ViewStyle;
}

// ========================================
// CORES TEMÁTICAS PARA ESTADOS NFC
// ========================================

export const NFCColors = {
  // Estados operacionais
  idle: '#6B7280',           // Cinza neutro
  initializing: '#3B82F6',   // Azul
  searching: '#F59E0B',      // Âmbar/Laranja
  connected: '#3B82F6',      // Azul
  sendingData: '#8B5CF6',    // Roxo
  receivingData: '#10B981',  // Verde esmeralda
  processing: '#AB9FF3',     // Roxo claro
  success: '#22C55E',        // Verde
  error: '#EF4444',          // Vermelho
  cancelled: '#9CA3AF',      // Cinza
  
  // Cores de fundo e acentos
  background: '#262728',
  surface: '#373737',
  surfaceLight: '#444546',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#6B7280',
  
  // Efeitos especiais
  glow: 'rgba(171, 159, 243, 0.3)',
  shimmer: 'rgba(255, 255, 255, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.25)',
} as const;

// ========================================
// DIMENSÕES RESPONSIVAS
// ========================================

export const NFCDimensions = {
  // Tamanhos de componentes
  sizes: {
    small: {
      container: 80,
      icon: 32,
      wave: 120,
      particle: 4,
      statusDot: 6,
      fontSize: 12,
    },
    medium: {
      container: 120,
      icon: 48,
      wave: 180,
      particle: 6,
      statusDot: 8,
      fontSize: 14,
    },
    large: {
      container: 160,
      icon: 64,
      wave: 240,
      particle: 8,
      statusDot: 10,
      fontSize: 16,
    },
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Raios de borda
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 1000,
  },
  
  // Elevações e sombras
  elevation: {
    low: 2,
    medium: 4,
    high: 8,
    extreme: 12,
  },
} as const;

// ========================================
// CONFIGURAÇÕES DE ANIMAÇÃO
// ========================================

export const NFCAnimationConfig = {
  // Durações (em milliseconds)
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    pulse: 1000,
    rotation: 2000,
    wave: 1500,
    fade: 400,
  },
  
  // Delays escalonados
  delays: {
    wave1: 0,
    wave2: 500,
    wave3: 1000,
    particle: 100, // delay entre partículas
  },
  
  // Configurações de escala
  scales: {
    pulseMin: 0.9,
    pulseMax: 1.2,
    waveMin: 0.5,
    waveMax: 2.5,
    particleMin: 0.8,
    particleMax: 1.2,
  },
  
  // Opacidades
  opacities: {
    hidden: 0,
    faint: 0.2,
    light: 0.4,
    medium: 0.6,
    strong: 0.8,
    visible: 1,
  },
} as const;

// ========================================
// ESTILOS PRINCIPAIS
// ========================================

export const animationStyles = StyleSheet.create<NFCAnimationStyles>({
  // ========================================
  // NFCConnectionAnimation
  // ========================================
  
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: NFCDimensions.borderRadius.full,
    backgroundColor: 'transparent',
  },
  
  mainCircle: {
    borderWidth: 3,
    borderRadius: NFCDimensions.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: NFCColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: NFCDimensions.elevation.medium,
  },
  
  nfcIcon: {
    position: 'absolute',
  },
  
  statusContainer: {
    position: 'absolute',
    bottom: -20,
    alignItems: 'center',
  },
  
  statusDot: {
    borderRadius: NFCDimensions.borderRadius.full,
    shadowColor: NFCColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: NFCDimensions.elevation.low,
  },

  // ========================================
  // NFCStatusIndicator
  // ========================================
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: NFCDimensions.spacing.sm,
    paddingHorizontal: NFCDimensions.spacing.md,
    backgroundColor: NFCColors.surface,
    borderRadius: NFCDimensions.borderRadius.lg,
    shadowColor: NFCColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: NFCDimensions.elevation.low,
  },
  
  statusText: {
    fontWeight: '600',
    marginLeft: NFCDimensions.spacing.sm,
  },

  // ========================================
  // NFCTransactionPreview
  // ========================================
  
  previewContainer: {
    backgroundColor: NFCColors.surface,
    borderRadius: NFCDimensions.borderRadius.lg,
    padding: NFCDimensions.spacing.lg,
    margin: NFCDimensions.spacing.lg,
    borderWidth: 1,
    borderColor: NFCColors.surfaceLight,
    shadowColor: NFCColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: NFCDimensions.elevation.medium,
  },
  
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: NFCColors.textPrimary,
    textAlign: 'center',
    marginBottom: NFCDimensions.spacing.lg,
  },
  
  amountContainer: {
    alignItems: 'center',
    marginBottom: NFCDimensions.spacing.lg,
    paddingBottom: NFCDimensions.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: NFCColors.surfaceLight,
  },
  
  amountLabel: {
    fontSize: 14,
    color: NFCColors.textSecondary,
    marginBottom: NFCDimensions.spacing.sm,
    fontWeight: '500',
  },
  
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: NFCColors.success,
    marginBottom: NFCDimensions.spacing.xs,
  },
  
  amountSOL: {
    fontSize: 18,
    color: NFCColors.textSecondary,
    fontWeight: '600',
  },
  
  detailsContainer: {
    marginBottom: NFCDimensions.spacing.lg,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: NFCDimensions.spacing.sm,
  },
  
  detailLabel: {
    fontSize: 14,
    color: NFCColors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  
  detailValue: {
    fontSize: 14,
    color: NFCColors.textPrimary,
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  
  buttonsContainer: {
    flexDirection: 'row',
    gap: NFCDimensions.spacing.md,
  },
  
  confirmButton: {
    flex: 1,
    backgroundColor: NFCColors.success,
    paddingVertical: NFCDimensions.spacing.md,
    borderRadius: NFCDimensions.borderRadius.md,
    alignItems: 'center',
    shadowColor: NFCColors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: NFCDimensions.elevation.medium,
  },
  
  confirmButtonText: {
    color: NFCColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  
  rejectButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: NFCColors.error,
    paddingVertical: NFCDimensions.spacing.md,
    borderRadius: NFCDimensions.borderRadius.md,
    alignItems: 'center',
  },
  
  rejectButtonText: {
    color: NFCColors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ========================================
  // ESTILOS AVANÇADOS PARA ANIMAÇÕES
  // ========================================
  
  pulsingCircle: {
    borderWidth: 2,
    borderRadius: NFCDimensions.borderRadius.full,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  
  rotatingElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  fadeInElement: {
    opacity: 0,
  },
  
  slideInElement: {
    transform: [{ translateY: 20 }],
    opacity: 0,
  },
  
  glowEffect: {
    shadowColor: NFCColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: NFCDimensions.elevation.extreme,
  },
  
  connectionLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: NFCColors.connected,
    borderRadius: 1.5,
    shadowColor: NFCColors.connected,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: NFCDimensions.elevation.low,
  },
  
  dataParticle: {
    position: 'absolute',
    borderRadius: NFCDimensions.borderRadius.full,
    shadowColor: NFCColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: NFCDimensions.elevation.low,
  },
  
  waveRipple: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: NFCDimensions.borderRadius.full,
    backgroundColor: 'transparent',
  },
});

// ========================================
// FUNÇÕES UTILITÁRIAS PARA ESTILOS
// ========================================

/**
 * Obtém cor baseada no status NFC
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'idle': return NFCColors.idle;
    case 'initializing': return NFCColors.initializing;
    case 'searching': return NFCColors.searching;
    case 'connected': return NFCColors.connected;
    case 'sending_data': return NFCColors.sendingData;
    case 'receiving_data': return NFCColors.receivingData;
    case 'processing_transaction': return NFCColors.processing;
    case 'success': return NFCColors.success;
    case 'error': return NFCColors.error;
    case 'cancelled': return NFCColors.cancelled;
    default: return NFCColors.idle;
  }
};

/**
 * Obtém dimensões baseadas no tamanho
 */
export const getSizeDimensions = (size: 'small' | 'medium' | 'large') => {
  return NFCDimensions.sizes[size];
};

/**
 * Cria estilo de sombra baseado na elevação
 */
export const createShadowStyle = (elevation: keyof typeof NFCDimensions.elevation, color: string = NFCColors.shadow) => {
  const elevationValue = NFCDimensions.elevation[elevation];
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: elevationValue / 2 },
    shadowOpacity: 0.25,
    shadowRadius: elevationValue,
    elevation: elevationValue,
  };
};

/**
 * Cria estilo de glow effect
 */
export const createGlowStyle = (color: string, intensity: number = 0.8) => {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 15,
    elevation: NFCDimensions.elevation.extreme,
  };
};

// ========================================
// EXPORTS
// ========================================

export default animationStyles;