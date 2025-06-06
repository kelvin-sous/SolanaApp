// ========================================
// src/styles/app.styles.ts
// Estilos globais do aplicativo
// ========================================

import { StyleSheet } from 'react-native';
import { UI_CONFIG } from '../constants/config';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.COLORS.BACKGROUND,
  },
  
  // Estilos globais para consistência
  safeArea: {
    flex: 1,
    backgroundColor: UI_CONFIG.COLORS.BACKGROUND,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.COLORS.BACKGROUND,
  },
  
  loadingText: {
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    fontSize: 16,
    marginTop: 16,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.COLORS.BACKGROUND,
    padding: 20,
  },
  
  errorText: {
    color: UI_CONFIG.COLORS.ERROR,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  // Estilos para modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: UI_CONFIG.COLORS.SURFACE,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  
  // Estilos para botões globais
  primaryButton: {
    backgroundColor: UI_CONFIG.COLORS.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI_CONFIG.COLORS.PRIMARY,
  },
  
  secondaryButtonText: {
    color: UI_CONFIG.COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  
  disabledButton: {
    backgroundColor: UI_CONFIG.COLORS.TEXT_SECONDARY,
    opacity: 0.6,
  },
  
  disabledButtonText: {
    color: UI_CONFIG.COLORS.BACKGROUND,
  },
  
  // Estilos para cards
  card: {
    backgroundColor: UI_CONFIG.COLORS.SURFACE,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Estilos para texto
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  
  body: {
    fontSize: 16,
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  
  caption: {
    fontSize: 14,
    color: UI_CONFIG.COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  
  // Estilos para status
  successText: {
    color: UI_CONFIG.COLORS.SUCCESS,
  },
  
  errorTextStyle: {
    color: UI_CONFIG.COLORS.ERROR,
  },
  
  warningText: {
    color: UI_CONFIG.COLORS.WARNING,
  },
  
  // Estilos para separadores
  divider: {
    height: 1,
    backgroundColor: UI_CONFIG.COLORS.TEXT_SECONDARY,
    opacity: 0.3,
    marginVertical: 16,
  },
  
  // Estilos para inputs
  input: {
    backgroundColor: UI_CONFIG.COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    color: UI_CONFIG.COLORS.TEXT_PRIMARY,
    fontSize: 16,
    borderWidth: 1,
    borderColor: UI_CONFIG.COLORS.TEXT_SECONDARY,
  },
  
  inputFocused: {
    borderColor: UI_CONFIG.COLORS.PRIMARY,
    borderWidth: 2,
  },
  
  inputLabel: {
    fontSize: 14,
    color: UI_CONFIG.COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    fontWeight: '500',
  },
  
  // Utilitários
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Margens e paddings padrão
  m8: { margin: 8 },
  m16: { margin: 16 },
  m20: { margin: 20 },
  
  p8: { padding: 8 },
  p16: { padding: 16 },
  p20: { padding: 20 },
  
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  
  ml8: { marginLeft: 8 },
  ml16: { marginLeft: 16 },
  
  mr8: { marginRight: 8 },
  mr16: { marginRight: 16 },
});