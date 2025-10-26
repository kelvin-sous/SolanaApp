// src/screens/main/CommunityVault/createVaultInviteStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  
  // Header e progresso
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: '#444444',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#AB9FF3',
  },
  
  // ScrollView
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Container de configurações
  configContainer: {
    backgroundColor: '#373737',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  
  // Seção de input
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#444444',
  },
  pasteButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Seletor de cargo
  roleSection: {
    marginBottom: 20,
  },
  roleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  rolePicker: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  rolePickerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  
  // Botão adicionar
  addButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#555555',
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Divisor
  divider: {
    height: 1,
    backgroundColor: '#444444',
    marginVertical: 16,
  },
  
  // Lista de membros convidados
  invitedSection: {
    marginTop: 20,
  },
  invitedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  invitedSubtitle: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Cards de membros
  memberCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginRight: 12,
  },
  memberWallet: {
    color: '#AB9FF3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRole: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: '#CCCCCC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Aviso de validação
  validationWarning: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  warningText: {
    color: '#FFA500',
    fontSize: 12,
    lineHeight: 16,
  },
  
  validationSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  successText: {
    color: '#4ADE80',
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Modal de edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalWallet: {
    color: '#AB9FF3',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalRoleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Botões inferiores
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#262728',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#444444',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#555555',
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Dropdown customizado
  dropdownButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#444444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  dropdownArrow: {
    color: '#AB9FF3',
    fontSize: 12,
  },
  
  // Modal do picker
  pickerModalContent: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#AB9FF3',
  },
  pickerOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});