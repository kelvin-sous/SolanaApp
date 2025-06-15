// ========================================
// src/screens/main/NFCSendScreen/styles.ts
// Estilos atualizados para NFCSendScreen
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
  amountCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    minHeight: 140,
    position: 'relative',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  solanaIcon: {
    width: 60,
    height: 60,
  },
  
  // Informações de saldo
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 10,
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    minWidth: 150,
    textAlign: 'right',
  },

  // Informações de equivalência
  equivalentInfo: {
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#444546',
  },
  equivalentSOLText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  feeText: {
    fontSize: 12,
    color: '#f59e0b',
  },

  // Campo do destinatário
  receiverCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
  },
  receiverLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  receiverInput: {
    backgroundColor: '#262728',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#444546',
  },

  nfcIconContainer: {
    alignItems: 'center',
    marginVertical: 40,
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

  // Informações da transação
  transactionInfoContainer: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#444546',
  },
  transactionInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  transactionInfoText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 6,
    fontFamily: 'monospace',
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