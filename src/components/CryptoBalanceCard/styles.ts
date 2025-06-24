// ========================================
// src/components/CryptoBalanceCard/styles.ts
// Estilos finais com estados de erro melhorados
// ========================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#373737',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  coinsContainer: {
    marginTop: 0,
  },

  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  lastCoinRow: {
    borderBottomWidth: 0,
  },

  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  coinIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  coinIcon: {
    width: 24,
    height: 24,
  },

  coinInfo: {
    flex: 1,
  },

  coinSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },

  marketPrice: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '400',
  },

  coinRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  priceChangeContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },

  dollarChange: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  percentChange: {
    fontSize: 12,
    fontWeight: '500',
  },

  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 8,
  },

  updateText: {
    color: '#888888',
    fontSize: 10,
    marginLeft: 6,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 12,
  },

  // ✨ ESTADOS DE ERRO MELHORADOS
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  errorTitle: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorMessage: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },

  errorSubtext: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 14,
    fontStyle: 'italic',
  },

  retryButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ✨ LOADING MELHORADO
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  loadingSubtext: {
    color: '#888888',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 12,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(55, 55, 55, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});