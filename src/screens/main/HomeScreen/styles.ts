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
  balanceContainer: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  refreshButton: {
    padding: 4,
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
  balanceAmount: {
    marginTop: 4,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 20,
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
    paddingVertical: 30,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#4A4A4A',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#5A5A5A',
  },
  actionIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
  sidebarOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});