// ========================================
// src/screens/main/SendPaymentScreen/styles.ts
// Estilos da tela de formulário de envio - ATUALIZADO
// ========================================

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  
  // Header
  header: {
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  
  // Título
  titleContainer: {
    alignItems: 'center', // ✅ Centralizado
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 20,
    paddingHorizontal: 20, // ✅ Padding horizontal
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },

  // ✅ NOVO: INDICADOR DE SALDO
  balanceIndicator: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
  },
  
  // Conteúdo
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Card de Valor
  amountCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  solanaIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  currencyIndicator: {
    width: 12,
    height: 8,
    backgroundColor: '#00FF88',
    borderRadius: 2,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'left',
  },

  // ✅ NOVO: INPUT DESABILITADO
  amountInputDisabled: {
    color: '#CCCCCC',
    opacity: 0.8,
  },

  solEquivalent: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },

  // ✅ NOVO: TEXTO DE SALDO INSUFICIENTE
  insufficientText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  
  // Card de Detalhes
  detailsCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },

  // ✅ NOVO: LINHA TOTAL
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },

  totalLabel: {
    color: '#AB9FF3',
    fontSize: 16,
    fontWeight: '700',
  },

  totalValue: {
    color: '#AB9FF3',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Botões
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  confirmButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center', // ✅ Para acomodar ActivityIndicator
    minHeight: 54, // ✅ Altura mínima consistente
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
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