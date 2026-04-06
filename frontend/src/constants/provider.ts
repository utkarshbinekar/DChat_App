/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";

// Local Hardhat HTTP provider (no WebSocket needed)
export const readOnlyProvider = new ethers.JsonRpcProvider(
  import.meta.env.VITE_INFURA_RPC_URL || "http://127.0.0.1:8545"
);

// Browser wallet (read-write provider)
export const getProvider = (provider: any) =>
  new ethers.BrowserProvider(provider);
