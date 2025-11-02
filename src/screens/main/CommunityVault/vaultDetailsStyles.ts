// src/screens/main/CommunityVault/vaultDetailsStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    transform: [{ rotate: '180deg' }],
  },
  vaultCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  vaultName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#AB9FF3',
    fontWeight: '600',
  },
  
  // Saldo
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  balanceValue: {
    color: '#4ADE80',
    fontSize: 28,
    fontWeight: '700',
  },
  balanceArrow: {
    color: '#4ADE80',
    fontSize: 20,
    marginLeft: 4,
  },
  
  // Conteúdo das Tabs
  tabContent: {
    flex: 1,
  },
  
  // Eventos
  eventsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  eventItem: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  myEventItem: {
    alignItems: 'flex-end',
  },
  eventBubble: {
    backgroundColor: '#4A4A4A',
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
  },
  myEventBubble: {
    backgroundColor: '#AB9FF3',
  },
  eventText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  eventWallet: {
    fontWeight: '700',
  },
  depositAmount: {
    color: '#4ADE80',
    fontWeight: '700',
  },
  
  // Solicitação de Saque/Depósito
  withdrawRequestCard: {
    width: '100%',
  },
  withdrawRequestTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  withdrawAmount: {
    color: '#EF4444',
    fontWeight: '700',
  },
  votesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  voteFavor: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  voteAgainst: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  voteProgress: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  voteProgressBar: {
    height: '100%',
    backgroundColor: '#4ADE80',
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  voteButtonReject: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  voteButtonRejectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteButtonApprove: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  voteButtonApproveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteDisabledNote: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  voteDisabledText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Placeholder
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  
  // Botões de Ação
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 12,
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#4ADE80',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Estado vazio de eventos
  emptyEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEventsIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyEventsText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
  },
});