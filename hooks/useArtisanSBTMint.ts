import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// ABI for the SoulBoundArtisanID contract (only the mint function)
const artisanContractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "fullName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "craftType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "region",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "verificationId",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function useArtisanSBTMint() {
  const contractAddress = '0xa71dbeE2B0094ea44eF5D08A290663d3eE06FE71';
  const [transactionHash, setTransactionHash] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  // Use the current wagmi hooks
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();
  
  // Track transaction status
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update transaction hash when available
  useEffect(() => {
    if (hash) {
      setTransactionHash(hash);
    }
  }, [hash]);

  // Generate a verification ID
  const generateVerificationId = () => {
    return `VR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  };

  // Create a mint function that can be called with form data
  const mintArtisanNFT = async (formData) => {
    try {
      // Only generate and store a new verification ID if we don't have one
      // This prevents regenerating on subsequent renders
      const newVerificationId = verificationId || generateVerificationId();
      setVerificationId(newVerificationId);
      
      await writeContract({
        address: contractAddress,
        abi: artisanContractAbi,
        functionName: 'mint',
        args: [
          formData.walletAddress, // to address
          formData.fullName, // fullName
          formData.craftType === 'Other' ? formData.otherCraftType : formData.craftType, // craftType  
          formData.address, // region (using address as region)
          newVerificationId // verification ID
        ],
      });
      
      return newVerificationId;
    } catch (err) {
      console.error("Error minting artisan NFT:", err);
      throw err;
    }
  };

  return {
    mintArtisanNFT,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: error?.message || '',
    transactionHash,
    verificationId
  };
}