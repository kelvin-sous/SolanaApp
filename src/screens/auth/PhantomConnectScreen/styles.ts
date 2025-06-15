import { StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../constants/typography';

// Cores específicas do design Phantom
const PHANTOM_COLORS = {
  BACKGROUND: '#262728',
  CARD_WHITE: '#FFFFFF',
  CARD_PURPLE: '#AB9FF3',
  BUTTON_DARK: '#373737',
  TEXT_WHITE: '#FFFFFF',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PHANTOM_COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: PHANTOM_COLORS.TEXT_WHITE,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 32,
  },
  phantomCardContainer: {
    alignItems: 'center',
    marginBottom: 40,
    height: 400,
    position: 'relative',
  },
  phantomCardBack: {
    width: 350,
    height: 360,
    backgroundColor: PHANTOM_COLORS.CARD_WHITE,
    borderRadius: 20,
    position: 'absolute',
    left: 20,
    top: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  phantomCardFront: {
    width: 350,
    height: 360,
    backgroundColor: PHANTOM_COLORS.CARD_PURPLE,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    right: 20,
    top: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  phantomLogo: {
    marginTop: 30,
    alignItems: 'center',
  },
  phantomLogoImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  phantomLogoText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: PHANTOM_COLORS.TEXT_WHITE,
    marginTop: 10,
    letterSpacing: 1,
  },
  connectButtonContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: PHANTOM_COLORS.BUTTON_DARK,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonText: {
    color: PHANTOM_COLORS.TEXT_WHITE,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  noPhantomText: {
    color: PHANTOM_COLORS.TEXT_WHITE,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 40,
    marginTop: 'auto',
  },
  footerLink: {
    color: PHANTOM_COLORS.TEXT_WHITE,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  
  // Estilos para quando está conectado
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.WHITE,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Estilos mantidos da versão anterior
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeConnected: {
    backgroundColor: COLORS.SUCCESS + '20',
  },
  statusBadgeDisconnected: {
    backgroundColor: COLORS.GRAY_200,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statusBadgeTextConnected: {
    color: COLORS.SUCCESS,
  },
  statusBadgeTextDisconnected: {
    color: COLORS.TEXT_SECONDARY,
  },
  walletInfo: {
    marginTop: 8,
  },
  walletAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.GRAY_50,
    padding: 12,
    borderRadius: 8,
  },
  walletAddressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  secondaryButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.ERROR,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: COLORS.ERROR,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: FONT_SIZES.base,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.ERROR + '30',
  },
  errorTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.ERROR,
    marginBottom: 4,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  connectButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  featuresSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: COLORS.INFO,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  testButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});