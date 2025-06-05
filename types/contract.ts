import { ethers } from 'ethers';

export type Addressable = string | ethers.Signer;

export interface ContractDetails {
  owner: string;
  players: string[];
  balance: string;
  isManager: boolean;
  hasEntered: boolean;
  participants: number;
  contractBalance: string;
}
