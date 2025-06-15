// ========================================
// src/screens/main/QRPayScreen/styles.ts
// Estilos completos da tela de Pagar via QR Code Scanner - ATUALIZADO
// ========================================

import { StyleSheet, ImageStyle, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
    paddingHorizontal: 20,
  },

  // Header com ícone QR-Code
  header: {
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  headerIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  } as ImageStyle,

  // 
  titleContainer: {
    alignItems: 'flex-start',
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
    textAlign: 'center',
  },

  // ✨ NOVO: INDICADOR DE SALDO
  balanceIndicator: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Container de conteúdo
  contentContainer: {
    flex: 1,
  },

  // Estado idle - câmera/scanner
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  cameraViewfinder: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: '#CCCCCC',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    padding: 20,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos para scanner de QR Code
  scannedOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  scannedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  scanAgainButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Cantos do viewfinder para overlay da câmera
  cornerTopLeft: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#AB9FF3',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: '25%',
    right: '25%',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#AB9FF3',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '25%',
    left: '25%',
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#AB9FF3',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#AB9FF3',
    borderBottomRightRadius: 8,
  },

  // Botões de ação
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  manualButton: {
    backgroundColor: '#4A4A4A',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Input manual
  manualInputContainer: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  manualInputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  manualTextInput: {
    backgroundColor: '#4A4A4A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 15,
  },
  processButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Preview da transação
  previewContainer: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  previewValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    color: '#AB9FF3',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalValue: {
    color: '#AB9FF3',
    fontSize: 18,
    fontWeight: '700',
  },

  // Erros
  errorSection: {
    backgroundColor: '#E6474A',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },

  // Ações do preview
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A4A4A',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#666666',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Container inferior com botão voltar
  bottomContainer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: width * 0.8,
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
});