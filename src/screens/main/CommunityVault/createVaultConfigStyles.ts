// src/screens/main/CommunityVault/createVaultConfigStyles.ts

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
    color: '#999999',
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Seções
  configSection: {
    paddingVertical: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Radio buttons
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AB9FF3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AB9FF3',
  },
  radioLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  
  // Texto de aviso
  warningText: {
    color: '#FFA500',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 4,
  },
  
  // Spinner
  spinnerItem: {
    paddingVertical: 12,
  },
  spinnerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  spinnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 8,
    alignSelf: 'flex-start',
  },
  spinnerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  spinnerValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  spinnerHint: {
    color: '#999999',
    fontSize: 12,
    marginTop: 6,
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