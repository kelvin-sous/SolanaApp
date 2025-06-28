// ========================================
// src/screens/main/NFCReceiveScreen/styles.ts
// Estilos completos para NFCReceiveScreen
// ========================================

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  nfcHeaderIcon: ImageStyle;
  modeSelectorSingle: ViewStyle;
  modeButtonTextActive: TextStyle;
  walletCard: ViewStyle;
  walletLabel: TextStyle;
  walletAddress: TextStyle;
  walletBalance: TextStyle;
  instructionsCard: ViewStyle;
  instructionsTitle: TextStyle;
  instructionsText: TextStyle;
  nfcIconContainer: ViewStyle;
  nfcAnimationContainer: ViewStyle;
  searchingText: TextStyle;
  confirmationCard: ViewStyle;
  confirmationTitle: TextStyle;
  transactionDetails: ViewStyle;
  amountDisplay: ViewStyle;
  amountLabel: TextStyle;
  amountValue: TextStyle;
  amountSOL: TextStyle;
  transactionInfo: ViewStyle;
  transactionRow: ViewStyle;
  transactionLabel: TextStyle;
  transactionValue: TextStyle;
  warningBox: ViewStyle;
  warningText: TextStyle;
  acceptButton: ViewStyle;
  acceptButtonText: TextStyle;
  rejectButton: ViewStyle;
  rejectButtonText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  spacer: ViewStyle;
  actionButtons: ViewStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  primaryButtonDisabled: ViewStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
  statusInfo: ViewStyle;
  statusInfoText: TextStyle;
  statusWarning: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  modeActive: ViewStyle;
  modeInactive: ViewStyle;
  successHighlight: ViewStyle;
  errorHighlight: ViewStyle;
  warningHighlight: ViewStyle;
}

export const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  
  scrollContent: {
    flex: 1,
  },

  // ========================================
  // HEADER
  // ========================================
  
  header: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  
  nfcHeaderIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },

  // ========================================
  // SELETOR DE MODO
  // ========================================
  
  modeSelectorSingle: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  
  modeButtonTextActive: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // ========================================
  // CARD DA WALLET
  // ========================================
  
  walletCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
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
  
  walletLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  walletAddress: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 12,
    fontWeight: '600',
  },
  
  walletBalance: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '700',
  },

  // ========================================
  // CARD DE INSTRUÇÕES
  // ========================================
  
  instructionsCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
  },
  
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  
  instructionsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
    fontWeight: '400',
  },

  // ========================================
  // ÍCONE E ANIMAÇÃO NFC
  // ========================================
  
  nfcIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  
  nfcAnimationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  searchingText: {
    color: '#AAAAAA',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },

  // ========================================
  // CARD DE CONFIRMAÇÃO
  // ========================================
  
  confirmationCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#AB9FF3',
    shadowColor: '#AB9FF3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Detalhes da transação na confirmação
  transactionDetails: {
    marginBottom: 20,
  },
  
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444546',
  },
  
  amountLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#22c55e',
    marginBottom: 4,
  },
  
  amountSOL: {
    fontSize: 18,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  
  transactionInfo: {
    gap: 12,
  },
  
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  transactionLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    flex: 1,
    fontWeight: '500',
  },
  
  transactionValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginTop: 16,
  },
  
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },

  // Botões de confirmação na transação
  acceptButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  rejectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ========================================
  // CONTAINER DE ERRO
  // ========================================
  
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },

  // ========================================
  // SPACER E BOTÕES
  // ========================================
  
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  
  primaryButton: {
    backgroundColor: '#AB9FF3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#AB9FF3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  primaryButtonDisabled: {
    backgroundColor: '#555657',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  
  secondaryButtonText: {
    color: '#262728',
    fontSize: 16,
    fontWeight: '700',
  },

  // ========================================
  // STATUS DE CONEXÃO
  // ========================================
  
  statusInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#444546',
    marginTop: 16,
  },
  
  statusInfoText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  statusWarning: {
    fontSize: 11,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },

  // ========================================
  // ESTADOS ESPECIAIS
  // ========================================
  
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },

  // ========================================
  // VARIAÇÕES DE MODO
  // ========================================
  
  modeActive: {
    backgroundColor: '#AB9FF3',
    borderColor: '#AB9FF3',
  },
  
  modeInactive: {
    backgroundColor: 'transparent',
    borderColor: '#555657',
  },
  
  // ========================================
  // FEEDBACK VISUAL
  // ========================================
  
  successHighlight: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  
  errorHighlight: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  
  warningHighlight: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
});