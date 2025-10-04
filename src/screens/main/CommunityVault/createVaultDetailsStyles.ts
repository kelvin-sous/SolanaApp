// src/screens/main/CommunityVault/createVaultDetailsStyles.ts

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
  
  // Seção de ícones
  iconSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  iconOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: '#AB9FF3',
  },
  iconImage: {
    width: 40,
    height: 40,
    tintColor: '#AB9FF3',
  },
  uploadIconContainer: {
    alignItems: 'center',
  },
  uploadIconText: {
    fontSize: 24,
    marginBottom: 2,
  },
  uploadText: {
    color: '#AB9FF3',
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Seção de inputs
  inputSection: {
    marginVertical: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#444444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Item de configuração com toggle
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  configTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  configLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  configHint: {
    color: '#FFA500',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  
  // Checkbox
  checkboxSection: {
    marginVertical: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#AB9FF3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#AB9FF3',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  
  // Divisor
  divider: {
    height: 1,
    backgroundColor: '#444444',
    marginVertical: 16,
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
  nextButton: {
    flex: 1,
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});