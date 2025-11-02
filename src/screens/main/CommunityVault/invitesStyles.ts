// src/screens/main/CommunityVault/invitesStyles.ts

import { StyleSheet } from 'react-native';

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
    backgroundColor: '#262728',
  },
  headerIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  
  // Título
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  
  // Divisor
  divider: {
    height: 1,
    backgroundColor: '#444444',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  
  // Conteúdo
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Estado Vazio
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  
  // Card de Convite
  inviteCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444444',
  },
  vaultCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  vaultName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statsRow: {
    gap: 8,
    marginBottom: 16,
  },
  statText: {
    fontSize: 13,
  },
  statLabel: {
    color: '#999999',
    fontWeight: '400',
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Botões de Ação
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Botão Voltar
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
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
  
  // Modal de Sucesso
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});