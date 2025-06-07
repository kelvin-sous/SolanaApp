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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Scroll container
  scrollContainer: {
    flex: 1,
  },
  
  // Container do QR Code
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    padding: 20,
  },
  
  // Loading state
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#262728',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // QR Code content
  qrCodeContent: {
    alignItems: 'center',
    width: '100%',
  },
  qrCodeData: {
    color: '#262728',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'monospace',
    lineHeight: 12,
  },
  qrPlaceholderText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Copy button
  copyButton: {
    backgroundColor: '#AB9FF3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  },
  
  // Input container
  inputContainer: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Input groups
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#4A4A4A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555555',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Generate button
  generateButton: {
    backgroundColor: '#AB9FF3',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Action buttons
  actionButtons: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#4A4A4A',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Container inferior com botão voltar
  bottomContainer: {
    paddingBottom: 30,
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