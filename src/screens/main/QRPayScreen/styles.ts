// ========================================
// src/screens/main/QRPayScreen/styles.ts
// Estilos da tela de Scanner QR Code - Padrão visual consistente
// ========================================

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },

  // ========================================
  // HEADER
  // ========================================
  header: {
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },

  // ========================================
  // TÍTULO
  // ========================================
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  balanceIndicator: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
  },

  // ========================================
  // CONTEÚDO
  // ========================================
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ========================================
  // CÂMERA E SCANNER
  // ========================================
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    minHeight: height * 0.5,
  },

  cameraViewfinder: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#373737',
    borderWidth: 2,
    borderColor: '#AB9FF3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  cameraWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },

  camera: {
    width: '100%',
    height: '100%',
  },

  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#2A2A2A',
  },

  idleText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  permissionButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ========================================
  // OVERLAY DE SCANNER
  // ========================================
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Cantos do viewfinder
  cornerTopLeft: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#AB9FF3',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#AB9FF3',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#AB9FF3',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#AB9FF3',
    borderBottomRightRadius: 8,
  },

  // Instruções no scanner
  instructionOverlay: {
    position: 'absolute',
    bottom: '10%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },

  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ========================================
  // BOTÕES DE AÇÃO
  // ========================================
  actionButtonsContainer: {
    paddingVertical: 20,
    gap: 15,
  },

  manualButton: {
    backgroundColor: '#4A4A4A',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========================================
  // INPUT MANUAL
  // ========================================
  manualInputContainer: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  manualInputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  manualTextInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    fontFamily: 'monospace', // Para endereços
  },

  processButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  processButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },

  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========================================
  // ESTADOS DE FEEDBACK
  // ========================================
  processingOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(171, 159, 243, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },

  // ========================================
  // BOTÃO VOLTAR
  // ========================================
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backButtonText: {
    color: '#262728',
    fontSize: 18,
    fontWeight: '600',
  },

  // ========================================
  // RESPONSIVIDADE E ACESSIBILIDADE
  // ========================================
  accessibilityHint: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
  },

  accessibilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Estados específicos
  cameraError: {
    backgroundColor: '#E6474A',
    borderColor: '#FF6B6B',
  },

  cameraSuccess: {
    backgroundColor: '#22C55E',
    borderColor: '#10B981',
  },

  // Animações suaves
  fadeIn: {
    opacity: 1,
  },

  fadeOut: {
    opacity: 0.5,
  },

  // Ajustes para diferentes tamanhos de tela
  smallScreen: {
    paddingHorizontal: 15,
  },

  largeScreen: {
    paddingHorizontal: 30,
  },
});