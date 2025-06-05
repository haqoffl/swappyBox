import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';

async function getEthersProviderAndSigner() {
  const privy = usePrivy();

  if (!privy.user) {
    throw new Error('No wallet found. User not connected?');
  }

  // Get the raw ethereum provider from Privy wallet
  const rawProvider = await privy.wallet.getEthereumProvider();

  // Create ethers v6 BrowserProvider instance
  const ethersProvider = new ethers.BrowserProvider(rawProvider);

  // Get signer for signing transactions
  const signer = ethersProvider.getSigner();

  return { ethersProvider, signer };
}
