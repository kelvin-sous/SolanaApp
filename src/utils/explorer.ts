// ========================================
// Criação do arquivo de utilitários
// src/utils/explorer.ts
// ========================================

import { getExplorerUrl } from '../constants/networks';

/**
 * Abre o explorador da blockchain para uma transação
 */
export function openTransactionInExplorer(signature: string): void {
    const url = getExplorerUrl(signature);
    console.log('🔍 Abrindo explorador:', url);

}

/**
 * Formata endereço para exibição
 */
export function formatAddress(address: string, startChars: number = 8, endChars: number = 8): string {
    if (address.length <= startChars + endChars) {
        return address;
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formata valor SOL para exibição
 */
export function formatSOL(amount: number, decimals: number = 6): string {
    return `${amount.toFixed(decimals)} SOL`;
}

/**
 * Formata valor USD para exibição
 */
export function formatUSD(amount: number, decimals: number = 2): string {
    return `$${amount.toFixed(decimals)}`;
}