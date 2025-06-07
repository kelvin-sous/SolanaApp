// ========================================
// src/components/CryptoBalanceCard/styles.ts
// Estilos para o card de saldos de criptomoedas
// ========================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  coinsContainer: {
    gap: 0,
  },

  coinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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

  coinBalance: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
  },

  coinRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  coinValueChangeContainer: {
    alignItems: 'flex-end',
  },

  coinValueChange: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },

  coinChange: {
    fontSize: 14,
    fontWeight: '500',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(55, 55, 55, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  loadingText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 8,
  },
});