import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728',
    paddingHorizontal: 20,
  },
  
  // Header com ícone QR-Code
  header: {
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  
  // Título
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 20,
    paddingLeft: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'left',
  },
  
  // Scroll container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Mais espaçamento no final
  },
  
  // Container do QR Code
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // QR Code content (único card)
  qrCodeContent: {
    alignItems: 'center',
    width: width * 0.7,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#444444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  // Loading container
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Placeholder container
  placeholderContainer: {
    width: width * 0.7,
    height: 150,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  qrPlaceholderText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // QR Code visual styles
  qrVisualContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    margin: 0.5,
  },
  
  // Copy button
  copyButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Wallet info
  walletInfo: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  walletLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  walletAddress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  tapToCopy: {
    color: '#AB9FF3',
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // Card de informações
  infoCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Container inferior com botão voltar
  bottomContainer: {
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: width * 0.8,
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
});