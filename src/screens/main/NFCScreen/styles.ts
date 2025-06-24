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
    paddingBottom: 100, // ✨ ESPAÇO PARA O BOTÃO FIXO
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

  // Card de informações da carteira
  walletInfoCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#444546',
  },
  walletInfoLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  walletInfoAddress: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  walletInfoBalance: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 8,
  },
  walletInfoStatus: {
    fontSize: 14,
    color: '#AAAAAA',
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
  },
  modeOptionButtonDisabled: {
    backgroundColor: '#2a2a2a',
    opacity: 0.6,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeOptionDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  modeOptionNote: {
    fontSize: 12,
    color: '#AB9FF3',
    fontStyle: 'italic',
  },
  modeOptionArrow: {
    fontSize: 24,
    color: '#AB9FF3',
    fontWeight: 'bold',
  },

  // Instruções de uso
  instructionsContainer: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#444546',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },

  // ✨ REMOVIDO: nfcIconContainer, nfcIconLargeImage, nfcIconText
  // (Comentado para referência)
  /*
  nfcIconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  nfcIconLargeImage: {
    width: 120,
    height: 120,
    tintColor: '#FFFFFF',
    marginBottom: 16,
  },
  nfcIconText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  */

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

  // ✨ REMOVIDO: actionButtons (agora o botão é fixo)
  /*
  actionButtons: {
    marginTop: 'auto',
  },
  */

  // ✨ NOVO: Container fixo para o botão
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
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

  // Aviso de conexão
  warningContainer: {
    backgroundColor: '#f59e0b20',
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
  },
});