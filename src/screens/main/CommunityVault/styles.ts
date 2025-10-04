// src/screens/main/CommunityVault/styles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  
  // Header com ícone
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
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#262728',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  
  // Botões de Ação (Criar caixa e Convites)
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#373737',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    width: 28,
    height: 28,
    tintColor: '#AB9FF3',
  },
  actionButtonText: {
    color: '#AB9FF3',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Linha divisória
  dividerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#444444',
  },
  
  // Container de conteúdo
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainerStyle: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Estados Vazios
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  phantomIcon: {
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
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
  
  // Cards de Caixas (quando houver)
  vaultCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 0,
  },
  vaultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  vaultInfo: {
    flex: 1,
  },
  vaultName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vaultDescription: {
    color: '#999',
    fontSize: 12,
  },
  vaultBalance: {
    alignItems: 'flex-end',
  },
  vaultBalanceLabel: {
    color: '#999',
    fontSize: 10,
    marginBottom: 2,
  },
  vaultBalanceValue: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '600',
  },
  vaultSecurityBadge: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  vaultSecurityText: {
    color: '#999999',
    fontSize: 11,
    fontStyle: 'italic',
  },
  
  // Nota de segurança
  securityNote: {
    backgroundColor: 'rgba(171, 159, 243, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  securityNoteText: {
    color: '#AB9FF3',
    fontSize: 12,
    lineHeight: 16,
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
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#262728',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  
  // Inputs do Modal
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1A1B1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Categorias
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#1A1B1D',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#AB9FF3',
    borderColor: '#AB9FF3',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    color: '#999',
    fontSize: 10,
  },
  
  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1A1B1D',
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#AB9FF3',
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});