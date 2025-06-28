// ========================================
// src/components/NFC/NFCStatusIndicator.tsx
// Componente visual para indicar status das operações NFC
// ========================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  Dimensions,
  ViewStyle,
  TextStyle
} from 'react-native';
import { NFCOperationStatus } from '../../types/nfc';
import { NFC_COLORS, NFC_ANIMATIONS } from '../../constants/nfc';
import { formatOperationStatus } from '../../utils/nfc';

// ========================================
// INTERFACES
// ========================================

interface NFCStatusIndicatorProps {
  status: NFCOperationStatus;
  message?: string | null;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  messageStyle?: TextStyle;
}

interface StatusConfig {
  color: string;
  icon: any;
  pulseEnabled: boolean;
  rotationEnabled: boolean;
  waveEnabled: boolean;
}

// ========================================
// CONFIGURAÇÕES DE STATUS
// ========================================

const STATUS_CONFIGS: Record<NFCOperationStatus, StatusConfig> = {
  IDLE: {
    color: NFC_COLORS.STATUS.IDLE,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: false,
    waveEnabled: false
  },
  INITIALIZING: {
    color: NFC_COLORS.STATUS.SEARCHING,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: true,
    waveEnabled: false
  },
  SEARCHING: {
    color: NFC_COLORS.STATUS.SEARCHING,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: true,
    rotationEnabled: false,
    waveEnabled: true
  },
  CONNECTED: {
    color: NFC_COLORS.STATUS.CONNECTED,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: false,
    waveEnabled: false
  },
  SENDING_DATA: {
    color: NFC_COLORS.STATUS.SENDING,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: true,
    rotationEnabled: false,
    waveEnabled: false
  },
  RECEIVING_DATA: {
    color: NFC_COLORS.STATUS.RECEIVING,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: true,
    rotationEnabled: false,
    waveEnabled: false
  },
  PROCESSING_TRANSACTION: {
    color: NFC_COLORS.STATUS.PROCESSING,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: true,
    waveEnabled: false
  },
  SUCCESS: {
    color: NFC_COLORS.STATUS.SUCCESS,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: false,
    waveEnabled: false
  },
  ERROR: {
    color: NFC_COLORS.STATUS.ERROR,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: false,
    waveEnabled: false
  },
  CANCELLED: {
    color: NFC_COLORS.STATUS.CANCELLED,
    icon: require('../../../assets/icons/nfcBRANCO.png'),
    pulseEnabled: false,
    rotationEnabled: false,
    waveEnabled: false
  }
};

// ========================================
// CONFIGURAÇÕES DE TAMANHO
// ========================================

const SIZE_CONFIGS = {
  small: {
    container: 60,
    icon: 24,
    fontSize: 12,
    waveSize: 80
  },
  medium: {
    container: 80,
    icon: 32,
    fontSize: 14,
    waveSize: 120
  },
  large: {
    container: 120,
    icon: 48,
    fontSize: 16,
    waveSize: 180
  }
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const NFCStatusIndicator: React.FC<NFCStatusIndicatorProps> = ({
  status,
  message,
  size = 'medium',
  showMessage = true,
  showIcon = true,
  animated = true,
  style,
  messageStyle
}) => {
  // ========================================
  // ANIMATIONS
  // ========================================
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ========================================
  // STATE
  // ========================================
  
  const [currentConfig, setCurrentConfig] = useState<StatusConfig>(STATUS_CONFIGS[status]);
  const [displayMessage, setDisplayMessage] = useState<string>('');

  // ========================================
  // EFFECTS
  // ========================================

  // Atualizar configuração quando status muda
  useEffect(() => {
    const config = STATUS_CONFIGS[status];
    setCurrentConfig(config);
    
    // Atualizar mensagem
    const newMessage = message || formatOperationStatus(status);
    setDisplayMessage(newMessage);

    // Fade in quando status muda
    if (animated) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: NFC_ANIMATIONS.DURATIONS.FAST,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: NFC_ANIMATIONS.DURATIONS.NORMAL,
          useNativeDriver: true
        })
      ]).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [status, message, animated]);

  // Controlar animações baseado no status
  useEffect(() => {
    if (!animated) return;

    // Parar todas as animações primeiro
    pulseAnim.stopAnimation();
    rotationAnim.stopAnimation();
    wave1Anim.stopAnimation();
    wave2Anim.stopAnimation();
    wave3Anim.stopAnimation();

    if (currentConfig.pulseEnabled) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }

    if (currentConfig.rotationEnabled) {
      startRotationAnimation();
    } else {
      rotationAnim.setValue(0);
    }

    if (currentConfig.waveEnabled) {
      startWaveAnimations();
    } else {
      wave1Anim.setValue(0);
      wave2Anim.setValue(0);
      wave3Anim.setValue(0);
    }
  }, [currentConfig, animated]);

  // ========================================
  // FUNÇÕES DE ANIMAÇÃO
  // ========================================

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: NFC_ANIMATIONS.PULSE_CONFIG.maxScale,
          duration: NFC_ANIMATIONS.PULSE_CONFIG.duration / 2,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: NFC_ANIMATIONS.PULSE_CONFIG.minScale,
          duration: NFC_ANIMATIONS.PULSE_CONFIG.duration / 2,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const startRotationAnimation = () => {
    rotationAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: NFC_ANIMATIONS.ROTATION_CONFIG.duration,
        useNativeDriver: true
      })
    ).start();
  };

  const startWaveAnimations = () => {
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: NFC_ANIMATIONS.DURATIONS.SCAN,
            useNativeDriver: true
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      );
    };

    // Iniciar ondas com delay escalonado
    createWaveAnimation(wave1Anim, 0).start();
    createWaveAnimation(wave2Anim, 500).start();
    createWaveAnimation(wave3Anim, 1000).start();
  };

  // ========================================
  // INTERPOLAÇÕES
  // ========================================

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const wave1Scale = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2]
  });

  const wave1Opacity = wave1Anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.8, 0.3, 0]
  });

  const wave2Scale = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2.5]
  });

  const wave2Opacity = wave2Anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.6, 0.2, 0]
  });

  const wave3Scale = wave3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 3]
  });

  const wave3Opacity = wave3Anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.4, 0.1, 0]
  });

  // ========================================
  // ELEMENTOS ESPECÍFICOS POR STATUS
  // ========================================

  const renderStatusSpecificElements = () => {
    switch (status) {
      case 'SUCCESS':
        return (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
        );

      case 'ERROR':
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>✗</Text>
          </View>
        );

      case 'PROCESSING_TRANSACTION':
        return (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>Phantom</Text>
          </View>
        );

      default:
        return null;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  const sizeConfig = SIZE_CONFIGS[size];
  const containerSize = sizeConfig.container;
  const iconSize = sizeConfig.icon;
  const waveSize = sizeConfig.waveSize;

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim },
        style
      ]}
    >
      {/* Container principal do indicador */}
      <View style={styles.indicatorContainer}>
        {/* Ondas de busca (apenas quando SEARCHING) */}
        {currentConfig.waveEnabled && animated && (
          <View style={[styles.wavesContainer, { width: waveSize, height: waveSize }]}>
            <Animated.View
              style={[
                styles.wave,
                {
                  width: waveSize,
                  height: waveSize,
                  borderColor: currentConfig.color,
                  transform: [{ scale: wave1Scale }],
                  opacity: wave1Opacity
                }
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                {
                  width: waveSize,
                  height: waveSize,
                  borderColor: currentConfig.color,
                  transform: [{ scale: wave2Scale }],
                  opacity: wave2Opacity
                }
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                {
                  width: waveSize,
                  height: waveSize,
                  borderColor: currentConfig.color,
                  transform: [{ scale: wave3Scale }],
                  opacity: wave3Opacity
                }
              ]}
            />
          </View>
        )}

        {/* Círculo principal do indicador */}
        <Animated.View
          style={[
            styles.statusCircle,
            {
              width: containerSize,
              height: containerSize,
              borderColor: currentConfig.color,
              backgroundColor: `${currentConfig.color}20`, // 20% de opacidade
              transform: [
                { scale: pulseAnim },
                { rotate: rotation }
              ]
            }
          ]}
        >
          {/* Ícone NFC */}
          {showIcon && (
            <Image
              source={currentConfig.icon}
              style={[
                styles.nfcIcon,
                {
                  width: iconSize,
                  height: iconSize,
                  tintColor: currentConfig.color
                }
              ]}
              resizeMode="contain"
            />
          )}

          {/* Indicador de ponto no centro */}
          <View
            style={[
              styles.centerDot,
              {
                backgroundColor: currentConfig.color,
                width: 8,
                height: 8,
                borderRadius: 4
              }
            ]}
          />
        </Animated.View>

        {/* Círculo externo para alguns status */}
        {(status === 'CONNECTED' || status === 'SUCCESS') && (
          <View
            style={[
              styles.outerRing,
              {
                width: containerSize + 20,
                height: containerSize + 20,
                borderColor: currentConfig.color
              }
            ]}
          />
        )}

        {/* Indicadores adicionais para diferentes status */}
        {renderStatusSpecificElements()}
      </View>

      {/* Mensagem de status */}
      {showMessage && displayMessage && (
        <View style={styles.messageContainer}>
          <Text
            style={[
              styles.statusMessage,
              {
                fontSize: sizeConfig.fontSize,
                color: currentConfig.color
              },
              messageStyle
            ]}
            numberOfLines={2}
          >
            {displayMessage}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// ========================================
// ESTILOS
// ========================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },

  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },

  wavesContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },

  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000, // Número grande para garantir círculo perfeito
    backgroundColor: 'transparent'
  },

  statusCircle: {
    borderWidth: 3,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },

  outerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000,
    backgroundColor: 'transparent',
    zIndex: 1
  },

  nfcIcon: {
    position: 'absolute',
    zIndex: 1
  },

  centerDot: {
    position: 'absolute',
    zIndex: 2
  },

  messageContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    maxWidth: 200
  },

  statusMessage: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20
  },

  // Elementos específicos por status
  successContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: NFC_COLORS.STATUS.SUCCESS,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3
  },

  successIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },

  errorContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: NFC_COLORS.STATUS.ERROR,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3
  },

  errorIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },

  processingContainer: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: NFC_COLORS.STATUS.PROCESSING,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 3
  },

  processingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

// ========================================
// COMPONENTES AUXILIARES
// ========================================

/**
 * Versão compacta do indicador para uso em listas
 */
export const NFCStatusIndicatorCompact: React.FC<{
  status: NFCOperationStatus;
  size?: number;
}> = ({ status, size = 24 }) => {
  const config = STATUS_CONFIGS[status];
  
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${config.color}30`,
        borderWidth: 2,
        borderColor: config.color,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <View
        style={{
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          backgroundColor: config.color
        }}
      />
    </View>
  );
};

/**
 * Indicador de progresso linear para operações NFC
 */
export const NFCProgressIndicator: React.FC<{
  progress: number; // 0-1
  status: NFCOperationStatus;
  width?: number;
  height?: number;
}> = ({ progress, status, width = 200, height = 6 }) => {
  const config = STATUS_CONFIGS[status];
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [progress]);

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: `${config.color}20`,
        borderRadius: height / 2,
        overflow: 'hidden'
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: config.color,
          borderRadius: height / 2,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp'
          })
        }}
      />
    </View>
  );
};

/**
 * Indicador de força de sinal NFC
 */
export const NFCSignalStrengthIndicator: React.FC<{
  strength: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}> = ({ strength, size = 'medium' }) => {
  const barCount = 4;
  const barSizes = {
    small: { width: 3, maxHeight: 12, spacing: 2 },
    medium: { width: 4, maxHeight: 16, spacing: 3 },
    large: { width: 5, maxHeight: 20, spacing: 4 }
  };
  
  const config = barSizes[size];
  const strengthPercent = Math.max(0, Math.min(100, strength)) / 100;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: config.maxHeight
      }}
    >
      {Array.from({ length: barCount }, (_, index) => {
        const barHeight = ((index + 1) / barCount) * config.maxHeight;
        const isActive = strengthPercent >= (index + 1) / barCount;
        
        return (
          <View
            key={index}
            style={{
              width: config.width,
              height: barHeight,
              backgroundColor: isActive 
                ? strengthPercent > 0.7 
                  ? NFC_COLORS.STATUS.SUCCESS
                  : strengthPercent > 0.3
                  ? NFC_COLORS.STATUS.SEARCHING
                  : NFC_COLORS.STATUS.ERROR
                : NFC_COLORS.STATUS.IDLE,
              marginRight: index < barCount - 1 ? config.spacing : 0,
              borderRadius: 1
            }}
          />
        );
      })}
    </View>
  );
};

export default NFCStatusIndicator;