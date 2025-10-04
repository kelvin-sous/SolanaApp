// src/services/communityVault/types.ts

import { PublicKey } from '@solana/web3.js';

// Tipos de usuários no caixa
export enum MemberRole {
  FOUNDER = 'FOUNDER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

// Status das propostas
export enum ProposalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED'
}

// Tipo de proposta
export enum ProposalType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  CHANGE_RULES = 'CHANGE_RULES'
}

// Membro do caixa
export interface VaultMember {
  publicKey: PublicKey;
  role: MemberRole;
  joinedAt: Date;
  nickname?: string;
  depositedAmount: number;
  withdrawnAmount: number;
}

// Regras de votação
export interface VotingRules {
  requiresVoting: boolean;
  minVotesRequired: number;
  votingPeriod: number; // em segundos
  quorumPercentage?: number; // porcentagem mínima de participação
}

// Configurações do caixa
export interface VaultSettings {
  entryFee: number; // em SOL
  maxMembers: number;
  allowGuestDeposits: boolean;
  allowGuestWithdrawals: boolean;
  depositRules: VotingRules;
  withdrawRules: VotingRules;
  adminPermissions: string[];
  guestPermissions: string[];
  withdrawalLimit?: number; // limite por saque
  dailyWithdrawalLimit?: number;
}

// Proposta de ação no caixa
export interface Proposal {
  id: string;
  vaultId: string;
  proposer: PublicKey;
  type: ProposalType;
  amount?: number;
  targetMember?: PublicKey;
  description: string; // até 150 caracteres
  votes: Vote[];
  status: ProposalStatus;
  createdAt: Date;
  expiresAt: Date;
  executedAt?: Date;
}

// Voto em uma proposta
export interface Vote {
  voter: PublicKey;
  inFavor: boolean;
  timestamp: Date;
  comment?: string; // comentário opcional no voto
}

// Transação do caixa
export interface VaultTransaction {
  id: string;
  vaultId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE';
  amount: number;
  from?: PublicKey;
  to?: PublicKey;
  initiator: PublicKey;
  comment: string; // até 150 caracteres
  timestamp: Date;
  txSignature?: string; // hash da transação na blockchain
  proposalId?: string; // se foi através de proposta
}

// Caixa Comunitário
export interface CommunityVault {
  id: string;
  name: string;
  description?: string;
  icon?: string; // emoji ou URL
  creator: PublicKey;
  address?: PublicKey; // endereço PDA do caixa na blockchain
  balance: number;
  members: VaultMember[];
  settings: VaultSettings;
  proposals: Proposal[];
  transactions: VaultTransaction[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  inviteCode?: string; // código para convite
  category?: VaultCategory;
  stats: VaultStats;
}

// Categoria do caixa (templates)
export enum VaultCategory {
  PARTY = 'PARTY', // Festa/Churras
  TRAVEL = 'TRAVEL', // Viagem
  INVESTMENT = 'INVESTMENT', // Investimento
  EMERGENCY = 'EMERGENCY', // Emergência
  SAVINGS = 'SAVINGS', // Poupança
  CUSTOM = 'CUSTOM' // Personalizado
}

// Estatísticas do caixa
export interface VaultStats {
  totalDeposited: number;
  totalWithdrawn: number;
  totalMembers: number;
  activeProposals: number;
  completedProposals: number;
  lastActivity: Date;
}

// Formulário de criação de caixa
export interface CreateVaultForm {
  name: string;
  description?: string;
  icon?: string;
  category: VaultCategory;
  entryFee: number;
  maxMembers: number;
  requiresVotingForWithdraw: boolean;
  minVotesForWithdraw: number;
  withdrawalLimit?: number;
}

// Convite para o caixa
export interface VaultInvite {
  vaultId: string;
  vaultName: string;
  invitedBy: PublicKey;
  inviteCode: string;
  entryFee: number;
  currentMembers: number;
  maxMembers: number;
  expiresAt?: Date;
}