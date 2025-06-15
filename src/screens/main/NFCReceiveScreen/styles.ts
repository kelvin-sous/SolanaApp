// ========================================
// src/screens/main/NFCReceiveScreen/styles.ts
// Estilos atualizados para NFCReceiveScreen
// ========================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  nfcHeaderIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },
  modeSelectorSingle: {
    marginBottom: 30,
  },
  modeButtonTextActive: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Card da wallet
  walletCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },

  // Card de instruções
  instructionsCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },

  // Card de confirmação
  confirmationCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
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
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  amountSOL: {
    fontSize: 18,
    color: '#AAAAAA',
  },
  transactionInfo: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    flex: 1,
  },
  transactionValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  warningBox: {
    backgroundColor: '#f59e0b20',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Botões de confirmação
  acceptButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  nfcIconContainer: {
    alignItems: 'center',
    marginVertical: 40,
    marginTop: 80,
  },
  nfcIconLargeImage: {
    width: 120,
    height: 120,
    tintColor: '#FFFFFF',
  },
  nfcIconSearchingImage: {
    width: 120,
    height: 120,
  },
  
  // Container de animação NFC
  nfcAnimationContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  searchingText: {
    color: '#797979',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },

  // Container de erro
  errorContainer: {
    backgroundColor: '#ef444420',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },

  spacer: {
    flex: 1,
  },
  actionButtons: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: '#AB9FF3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonDisabled: {
    backgroundColor: '#555657',
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#262728',
    fontSize: 16,
    fontWeight: '600',
  },

  // Status de conexão
  statusInfo: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444546',
  },
  statusInfoText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  statusWarning: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
});