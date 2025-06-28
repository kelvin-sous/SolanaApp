// ========================================
// src/screens/main/NFCScreen/styles.ts
// Estilos atualizados para NFCScreen com botão fixo
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
    paddingBottom: 100, // ESPAÇO PARA O BOTÃO FIXO
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
    alignItems: 'center',
  },
  modeButtonTextActive: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Card de informações da carteira
  walletInfoCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#444546',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walletInfoLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    fontWeight: '500',
  },
  walletInfoAddress: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 8,
    fontWeight: '600',
  },
  walletInfoBalance: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '700',
    marginBottom: 8,
  },
  walletInfoStatus: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },

  // Opções de modo NFC
  modeOptionsContainer: {
    marginBottom: 30,
  },
  modeOptionButton: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444546',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modeOptionButtonDisabled: {
    backgroundColor: '#2a2a2a',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  modeOptionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#262728',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeOptionIcon: {
    width: 30,
    height: 30,
    tintColor: '#AB9FF3',
  },
  modeOptionContent: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeOptionDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
    lineHeight: 20,
  },
  modeOptionNote: {
    fontSize: 12,
    color: '#AB9FF3',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  modeOptionError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '600',
  },
  modeOptionArrow: {
    fontSize: 24,
    color: '#AB9FF3',
    fontWeight: '700',
  },

  // Instruções de uso
  instructionsContainer: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444546',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    fontWeight: '400',
  },

  // Informações de segurança
  securityContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444546',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 18,
    fontWeight: '400',
  },

  // Estilos existentes mantidos
  amountCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    height: 120,
    position: 'relative',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  solanaIcon: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 60,
    height: 60,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  nfcIconSearchingImage: {
    width: 120,
    height: 120,
  },
  searchingText: {
    color: '#797979',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },

  // Container fixo para o botão
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#262728',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5, // Para Android
  },

  primaryButton: {
    backgroundColor: '#AB9FF3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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

  // Aviso de conexão
  warningContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
});