import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#262728',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#262728',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userHandle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
  },
  logoContainer: {
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  accountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  expandButton: {
    padding: 8,
  },
  expandIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Novos estilos para o botão de scan
  scanButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', // Para deixar o ícone branco
  },
  
  // ✨ ESTILOS DO SALDO MELHORADOS
  balanceContainer: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  balanceContent: {
    marginBottom: 8,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  solanaIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  
  // ✨ BOTÃO DE REFRESH MELHORADO
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  currencyIcon: {
    width: 12,
    height: 8,
    backgroundColor: '#00FF88',
    marginRight: 8,
    borderRadius: 2,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  balanceLabel: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  
  // ✨ ÁREA DO SALDO COM MELHORIAS
  balanceAmount: {
    marginTop: 8,
    alignItems: 'center',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // ✨ NOVO: ESTILO PARA MENSAGEM DE ERRO
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  
  welcomeSection: {
    marginTop: 10,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  welcomeCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  welcomeCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeCardSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#262728',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#373737',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  actionIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionIconImage: {
    width: 50,
    height: 50,
  },
  actionLabel: {
    color: '#AB9FF3',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionLabelMultiline: {
    lineHeight: 14,
  },
  additionalContent: {
    flex: 1,
    minHeight: 200,
    paddingHorizontal: 20,
  },
  
  // ========================================
  // ESTILOS DA SIDEBAR
  // ========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sidebarContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sidebar: {
    backgroundColor: '#373737',
    width: width * 0.75, // 75% da largura da tela
    height: height,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sidebarUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarUserIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  sidebarUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sidebarUserInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sidebarUserDetails: {
    flex: 1,
  },
  sidebarUserName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sidebarAccountText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  sidebarWalletAddress: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#4A4A4A',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sidebarOptions: {
    paddingHorizontal: 20,
  },
  sidebarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  sidebarOptionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A4A4A',
    borderRadius: 20,
    marginRight: 15,
  },
  sidebarOptionIconText: {
    fontSize: 20,
  },
  sidebarOptionIconImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  sidebarOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});