// src/services/communityVault/types.ts

import { PublicKey } from '@solana/web3.js';

export enum MemberRole {
  FOUNDER = 'FOUNDER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export interface Member {
  publicKey: PublicKey;
  role: MemberRole;
  joinedAt: Date;
  nickname?: string;
}

export interface VotingRules {
  requiresVoting: boolean;
  votingPeriod: number; // em segundos
  approvalPercentage?: number; // porcentagem necessária (0.5 = 50%, 0.6 = 60%, etc.)
}

export interface DepositRules {
  requiresVoting: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface VaultSettings {
  depositRules: DepositRules;
  withdrawRules: VotingRules;
  withdrawalLimit?: number; // Limite para saque automático (sem votação)
  allowGuestView: boolean;
}

export interface CommunityVault {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Cor do ícone circular
  creator: PublicKey;
  members: Member[];
  balance: number; // em SOL
  walletAddress?: string; // Endereço da wallet PDA do caixa (quando implementado)
  settings: VaultSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVaultParams {
  name: string;
  description?: string;
  icon?: string;
  creator: PublicKey;
  settings: VaultSettings;
}

export interface VaultInvite {
  id: string;
  vaultId: string;
  vaultName: string;
  inviterPublicKey: PublicKey;
  inviteePublicKey: PublicKey;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}