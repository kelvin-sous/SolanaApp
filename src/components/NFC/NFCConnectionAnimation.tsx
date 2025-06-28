// ========================================
// src/components/NFC/NFCConnectionAnimation.tsx
// Componente de animação NFC com estilos separados
// ========================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Image,
} from 'react-native';
import { NFCOperationStatus } from '../../types/nfc';
import animationStyles, { 
  NFCColors, 
  NFCDimensions, 
  NFCAnimationConfig,
  getStatusColor,
  getSizeDimensions,
  createGlowStyle,
  createShadowStyle
} from './AnimationStyles';

// ========================================
// INTERFACES
// ========================================

interface NFCConnectionAnimationProps {
  status: NFCOperationStatus;
  size?: 'small' | 'medium' | 'large';
  showDevices?: boolean;
  showWaves?: boolean;
  showParticles?: boolean;
  deviceDistance?: number;
  style?: any;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const NFCConnectionAnimation: React.FC<NFCConnectionAnimationProps> = ({
  status,
  size = 'medium',
  showWaves = true,
  showParticles = false,
  deviceDistance = 50,
  style,
}) => {
  // ========================================
  // REFS DE ANIMAÇÃO
  // ========================================
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  // ========================================
  // CONFIGURAÇÕES BASEADAS NO TAMANHO
  // ========================================
  
  const dimensions = getSizeDimensions(size);
  const statusColor = getStatusColor(status);

  // ========================================
  // EFEITOS DE ANIMAÇÃO
  // ========================================

  useEffect(() => {
    // Parar todas as animações primeiro
    stopAllAnimations();
    
    // Iniciar animações baseadas no status
    startAnimationsForStatus();
  }, [status]);

  // ========================================
  // CONTROLE DE ANIMAÇÕES
  // ========================================

  const stopAllAnimations = () => {
    pulseAnim.stopAnimation();
    rotationAnim.stopAnimation();
    wave1Anim.stopAnimation();
    wave2Anim.stopAnimation();
    wave3Anim.stopAnimation();
    particleAnims.forEach(particle => {
      particle.x.stopAnimation();
      particle.y.stopAnimation();
      particle.opacity.stopAnimation();
      particle.scale.stopAnimation();
    });
  };

  const startAnimationsForStatus = () => {
    switch (status) {
      case 'SEARCHING':
        startPulseAnimation();
        if (showWaves) startWaveAnimations();
        break;
        
      case 'CONNECTED':
        if (showParticles) startParticleAnimations();
        break;
        
      case 'SENDING_DATA':
      case 'RECEIVING_DATA':
        startPulseAnimation();
        if (showParticles) startParticleAnimations();
        break;
        
      case 'PROCESSING_TRANSACTION':
        startRotationAnimation();
        if (showParticles) startParticleAnimations();
        break;
        
      case 'SUCCESS':
        startSuccessAnimation();
        break;
        
      case 'ERROR':
        startErrorAnimation();
        break;
        
      default:
        // Reset para estado idle
        pulseAnim.setValue(1);
        rotationAnim.setValue(0);
        resetWaves();
        resetParticles();
        break;
    }
  };

  // ========================================
  // ANIMAÇÕES ESPECÍFICAS
  // ========================================

  const startPulseAnimation = () => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: NFCAnimationConfig.scales.pulseMax,
          duration: NFCAnimationConfig.durations.pulse,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: NFCAnimationConfig.scales.pulseMin,
          duration: NFCAnimationConfig.durations.pulse,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotationAnimation = () => {
    rotationAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: NFCAnimationConfig.durations.rotation,
        useNativeDriver: true,
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
            duration: NFCAnimationConfig.durations.wave,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: NFCAnimationConfig.durations.fast,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Iniciar ondas com delays escalonados
    createWaveAnimation(wave1Anim, NFCAnimationConfig.delays.wave1).start();
    createWaveAnimation(wave2Anim, NFCAnimationConfig.delays.wave2).start();
    createWaveAnimation(wave3Anim, NFCAnimationConfig.delays.wave3).start();
  };

  const startParticleAnimations = () => {
    particleAnims.forEach((particle, index) => {
      const angle = (index / particleAnims.length) * 2 * Math.PI;
      const radius = dimensions.container * 0.4;
      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * radius;

      // Animação de entrada
      Animated.sequence([
        Animated.delay(index * NFCAnimationConfig.delays.particle),
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: targetX,
            duration: NFCAnimationConfig.durations.slow,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: targetY,
            duration: NFCAnimationConfig.durations.slow,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: NFCAnimationConfig.opacities.strong,
            duration: NFCAnimationConfig.durations.normal,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: NFCAnimationConfig.durations.normal,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Animação de flutuação contínua
      const startFloating = () => {
        const floatX = targetX + (Math.random() - 0.5) * 20;
        const floatY = targetY + (Math.random() - 0.5) * 20;
        
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: floatX,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: floatY,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (showParticles && (status === 'CONNECTED' || status === 'SENDING_DATA' || status === 'RECEIVING_DATA')) {
            startFloating();
          }
        });
      };

      setTimeout(startFloating, 1000 + index * 100);
    });
  };

  const startSuccessAnimation = () => {
    // Pulse rápido de sucesso
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: NFCAnimationConfig.durations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: NFCAnimationConfig.durations.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startErrorAnimation = () => {
    // Shake animation para erro
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetWaves = () => {
    wave1Anim.setValue(0);
    wave2Anim.setValue(0);
    wave3Anim.setValue(0);
  };

  const resetParticles = () => {
    particleAnims.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.opacity.setValue(0);
      particle.scale.setValue(0);
    });
  };

  // ========================================
  // INTERPOLAÇÕES
  // ========================================

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const createWaveInterpolation = (animValue: Animated.Value, maxScale: number) => ({
    scale: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [NFCAnimationConfig.scales.waveMin, maxScale],
    }),
    opacity: animValue.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 0.8, 0.3, 0],
    }),
  });

  const wave1Interpolation = createWaveInterpolation(wave1Anim, 2);
  const wave2Interpolation = createWaveInterpolation(wave2Anim, 2.5);
  const wave3Interpolation = createWaveInterpolation(wave3Anim, 3);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderWaves = () => {
    if (!showWaves || status !== 'SEARCHING') return null;

    const waveConfigs = [
      { anim: wave1Interpolation, key: 'wave1' },
      { anim: wave2Interpolation, key: 'wave2' },
      { anim: wave3Interpolation, key: 'wave3' },
    ];

    return waveConfigs.map(({ anim, key }) => (
      <Animated.View
        key={key}
        style={[
          animationStyles.wave,
          {
            width: dimensions.wave,
            height: dimensions.wave,
            borderColor: statusColor,
            transform: [{ scale: anim.scale }],
            opacity: anim.opacity,
          },
        ]}
      />
    ));
  };

  const renderParticles = () => {
    if (!showParticles) return null;

    return particleAnims.map((particle, index) => (
      <Animated.View
        key={`particle-${index}`}
        style={[
          animationStyles.dataParticle,
          {
            width: dimensions.particle,
            height: dimensions.particle,
            backgroundColor: statusColor,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
          },
        ]}
      />
    ));
  };

  const renderMainCircle = () => {
    const glowStyle = status === 'SUCCESS' ? createGlowStyle(statusColor, 0.6) : {};
    const shadowStyle = createShadowStyle('medium', statusColor);

    return (
      <Animated.View
        style={[
          animationStyles.mainCircle,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderColor: statusColor,
            backgroundColor: `${statusColor}20`,
            transform: [
              { scale: pulseAnim },
              { rotate: rotation },
            ],
          },
          shadowStyle,
          glowStyle,
        ]}
      >
        {/* Ícone NFC */}
        <Image
          source={require('../../../assets/icons/nfcBRANCO.png')}
          style={[
            animationStyles.nfcIcon,
            {
              width: dimensions.icon,
              height: dimensions.icon,
              tintColor: statusColor,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  const renderStatusDot = () => (
    <View style={animationStyles.statusContainer}>
      <View
        style={[
          animationStyles.statusDot,
          {
            height: dimensions.statusDot,
            backgroundColor: statusColor,
          },
          createShadowStyle('low', statusColor),
        ]}
      />
    </View>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <View
      style={[
        animationStyles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
        },
        style,
      ]}
    >
      {/* Container de ondas */}
      <View style={animationStyles.container}>
        {renderWaves()}
      </View>

      {/* Container de partículas */}
      <View style={animationStyles.container}>
        {renderParticles()}
      </View>

      {/* Círculo principal */}
      {renderMainCircle()}

      {/* Indicador de status */}
      {renderStatusDot()}
    </View>
  );
};

export default NFCConnectionAnimation;