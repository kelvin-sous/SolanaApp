// ========================================
// src/screens/main/QRPayScreen/styles.ts
// Estilos completos da tela de Pagar via QR Code Scanner
// ========================================

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
    paddingHorizontal: 20,
  },
  
  // Header com ícone QR-Code
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  
  // Título
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
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
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  idleText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Cantos do viewfinder
  cornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderColor: '#000000',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: '#000000',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderColor: '#000000',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: '#000000',
    borderBottomRightRadius: 8,
  },
  
  // Botões de ação
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  scanButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  
  // Estado de scanning
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  scanningSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  cancelScanButton: {
    backgroundColor: '#E6474A',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    marginTop: 30,
  },
  cancelScanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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