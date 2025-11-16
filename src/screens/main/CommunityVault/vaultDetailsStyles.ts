// src/screens/main/CommunityVault/vaultDetailsStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#262728',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1B1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 15,
    paddingBottom: 12,
    backgroundColor: '#262728',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  vaultCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  vaultName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#262728',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#AB9FF3',
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#262728',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceArrow: {
    fontSize: 20,
    color: '#10B981',
    marginLeft: 8,
  },
  tabContent: {
    flex: 1,
  },
  eventsContainer: {
    padding: 16,
  },
  emptyEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEventsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyEventsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },

  // ========================================
  // EVENTOS - Containers
  // ========================================
  eventItem: {
    marginBottom: 12,
  },
  myEventItem: {
    alignItems: 'flex-end',
  },
  myEventWallet: {
    fontWeight: '700',  // Mais bold
    color: '#FFFFFF',   // Branco
  },

  // ========================================
  // MENSAGENS COM NUVEM (Ações de usuário)
  // ========================================
  eventBubble: {
    backgroundColor: '#4A4B4C',
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
    marginBottom: 8,
  },
  myEventBubble: {
    backgroundColor: '#AB9FF3',
    alignSelf: 'flex-end',
  },
  eventText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // ========================================
  // MENSAGENS SEM NUVEM (Eventos do sistema)
  // ========================================
  systemEventBubble: {
    backgroundColor: '#3A3B3C',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  systemEventText: {
    fontSize: 13,
    color: '#CCCCCC',
    textAlign: 'center',
  },

  // ========================================
  // FORMATAÇÃO DE TEXTO
  // ========================================
  eventWallet: {
    fontWeight: '600',
    color: '#AB9FF3',
  },
  depositAmount: {
    fontWeight: '600',
    color: '#10B981',
  },
  withdrawAmount: {
    fontWeight: '600',
    color: '#EF4444',
  },

  // ========================================
  // CARD DE VOTAÇÃO
  // ========================================
  voteCard: {
    backgroundColor: '#4A4B4C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    width: '90%',
  },
  voteTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },

  // Estatísticas de votos
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  voteStat: {
    alignItems: 'center',
  },
  voteLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voteCountFavor: {
    color: '#10B981',
  },
  voteCountAgainst: {
    color: '#EF4444',
  },

  // Barra de progresso
  voteProgressBar: {
    height: 8,
    backgroundColor: '#2A2B2C',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  voteProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },

  // Botões de voto
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  voteButtonReject: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  voteButtonApprove: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Status do voto
  voteStatus: {
    backgroundColor: '#3A3B3C',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  voteStatusText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },

  // ========================================
  // DEPRECATED (manter para compatibilidade)
  // ========================================
  withdrawRequestCard: {
    width: '100%',
  },
  withdrawRequestTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  votesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  voteItem: {
    alignItems: 'center',
  },
  voteFavor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  voteAgainst: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  voteProgress: {
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  voteButtonRejectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteButtonApproveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteDisabledNote: {
    backgroundColor: '#3A3B3C',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  voteDisabledText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },

  // ========================================
  // PLACEHOLDERS
  // ========================================
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
  },

  // ========================================
  // BOTÕES DE AÇÃO
  // ========================================
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#262728',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========================================
  // MODAL DE TRANSAÇÃO
  // ========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  transactionModal: {
    backgroundColor: '#2A2B2C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  transactionModalContent: {
    paddingBottom: 20,
  },
  transactionModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  amountDisplay: {
    backgroundColor: '#1A1B1C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountUSD: {
    fontSize: 16,
    color: '#AB9FF3',
  },
  transactionModalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  transactionCancelButton: {
    flex: 1,
    backgroundColor: '#3A3B3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  transactionCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionConfirmButton: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  transactionConfirmButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  transactionConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========================================
  // INDICADOR DE PREÇO
  // ========================================
  priceIndicator: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});