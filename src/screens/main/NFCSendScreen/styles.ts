// ========================================
// src/screens/main/NFCSendScreen/styles.ts
// Estilos completos para NFCSendScreen - CORRIGIDO
// ========================================

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  nfcHeaderIcon: ImageStyle;
  titleContainer: ViewStyle;
  title: TextStyle;
  walletCard: ViewStyle;
  walletLabel: TextStyle;
  walletAddress: TextStyle;
  walletBalance: TextStyle;
  formCard: ViewStyle;
  formTitle: TextStyle;
  inputContainer: ViewStyle;
  inputLabel: TextStyle;
  textInput: TextStyle;
  inputError: ViewStyle;
  amountInputContainer: ViewStyle;
  currencySymbol: TextStyle;
  amountInput: TextStyle;
  solEquivalent: TextStyle;
  summaryCard: ViewStyle;
  summaryTitle: TextStyle;
  summaryRow: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  summaryTotal: ViewStyle;
  summaryTotalLabel: TextStyle;
  summaryTotalValue: TextStyle;
  nfcStatusContainer: ViewStyle;
  nfcAnimationContainer: ViewStyle;
  instructionText: TextStyle;
  successText: TextStyle;
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
  // TÍTULO
  // ========================================
  
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  
  title: {
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
  // FORMULÁRIO
  // ========================================
  
  formCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444546',
  },
  
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '600',
  },
  
  textInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444546',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },

  // ========================================
  // CAMPO DE VALOR
  // ========================================
  
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444546',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  
  currencySymbol: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: '600',
    marginRight: 8,
  },
  
  amountInput: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  
  solEquivalent: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },

  // ========================================
  // RESUMO DA TRANSAÇÃO
  // ========================================
  
  summaryCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#AB9FF3',
  },
  
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#444546',
    marginTop: 12,
    paddingTop: 12,
  },
  
  summaryTotalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  
  summaryTotalValue: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // ========================================
  // STATUS NFC
  // ========================================
  
  nfcStatusContainer: {
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
  
  instructionText: {
    color: '#AAAAAA',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  
  successText: {
    color: '#22c55e',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
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
    marginVertical: 2,
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
});