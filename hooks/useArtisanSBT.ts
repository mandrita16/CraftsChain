// hooks/useArtisanSBT.ts
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { type Address } from 'viem';

// The ABI for the functions we need
const contractABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'tokenOfOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getTokenMetadata',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'fullName', type: 'string' },
      { name: 'craftType', type: 'string' },
      { name: 'region', type: 'string' },
      { name: 'verificationId', type: 'string' },
      { name: 'verifier', type: 'address' },
      { name: 'issuedAt', type: 'uint256' },
      { name: 'active', type: 'bool' }
    ]
  }
] as const;

// Interface for artisan data
interface ArtisanData {
  fullName: string;
  craftType: string;
  region: string;
  verificationId: string;
  verifier: Address;
  issuedAt: Date;
  active: boolean;
  tokenId: number;
}

export function useArtisanSBT() {
  const [artisanData, setArtisanData] = useState<ArtisanData | null>(null);
  const [hasArtisanSBT, setHasArtisanSBT] = useState(false);
  
  const CONTRACT_ADDRESS = '0xa71dbeE2B0094ea44eF5D08A290663d3eE06FE71' as Address;
  
  // Get connected account from wagmi
  const { address, isConnected } = useAccount();
  
  // Read balance of SBTs for the connected account
  const { data: balanceData, isPending: isBalanceLoading, error: balanceError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    }
  });
  
  // Determine if user has an SBT
  useEffect(() => {
    if (balanceData !== undefined) {
      setHasArtisanSBT(Number(balanceData) > 0);
    } else {
      setHasArtisanSBT(false);
    }
  }, [balanceData]);
  
  // Get token ID if user has an SBT
  const { data: tokenIdData, isPending: isTokenIdLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'tokenOfOwner',
    args: address && hasArtisanSBT ? [address] : undefined,
    query: {
      enabled: !!address && hasArtisanSBT,
    }
  });
  
  // Get token metadata if token ID is available
  const { data: metadataData, isPending: isMetadataLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getTokenMetadata',
    args: tokenIdData !== undefined ? [tokenIdData] : undefined,
    query: {
      enabled: tokenIdData !== undefined,
    }
  });
  
  // Process metadata when available
  useEffect(() => {
    if (metadataData && tokenIdData !== undefined) {
      const [
        fullName,
        craftType,
        region,
        verificationId,
        verifier,
        issuedAt,
        active
      ] = metadataData as [string, string, string, string, Address, bigint, boolean];
      
      setArtisanData({
        fullName,
        craftType,
        region,
        verificationId,
        verifier,
        issuedAt: new Date(Number(issuedAt) * 1000), // Convert timestamp to date
        active,
        tokenId: Number(tokenIdData)
      });
    } else {
      setArtisanData(null);
    }
  }, [metadataData, tokenIdData]);
  
  const isLoading = isBalanceLoading || (hasArtisanSBT && (isTokenIdLoading || isMetadataLoading));
  const error = balanceError;
  
  return {
    isConnected,
    hasArtisanSBT,
    artisanData,
    isLoading,
    error,
    walletAddress: address,
  };
}