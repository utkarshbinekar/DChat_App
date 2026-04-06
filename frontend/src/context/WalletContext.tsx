/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletState {
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  walletProvider: any;
  connect: () => Promise<void>;
  disconnect: () => void;
  getSigner: () => Promise<ethers.Signer>;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletState>({
  isConnected: false,
  address: undefined,
  chainId: undefined,
  walletProvider: undefined,
  connect: async () => {},
  disconnect: () => {},
  getSigner: async () => { throw new Error("Not connected"); },
  switchNetwork: async () => {},
});

export const SUPPORTED_CHAIN_ID = 1337;

const HARDHAT_CHAIN = {
  chainId: "0x" + SUPPORTED_CHAIN_ID.toString(16), // 0x539
  chainName: "Localhost 8545",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["http://127.0.0.1:8545"],
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const getEthereum = (): any => {
    return (window as any).ethereum;
  };

  const [address, setAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>(() => {
    const eth = getEthereum();
    if (eth && eth.chainId && typeof eth.chainId === "string") {
      return parseInt(eth.chainId, 16);
    }
    return undefined;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [walletProvider, setWalletProvider] = useState<any>(undefined);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(undefined);
      setWalletProvider(undefined);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      setWalletProvider(getEthereum());
    }
  }, []);

  const handleChainChanged = useCallback((chainIdHex: string) => {
    const parsed = parseInt(chainIdHex, 16);
    console.log("[WalletContext] chainChanged event - hex:", chainIdHex, "decimal:", parsed);
    setChainId(parsed);
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        setWalletProvider(ethereum);
      }
    });

    ethereum.request({ method: "eth_chainId" }).then((chainIdHex: string) => {
      const parsed = parseInt(chainIdHex, 16);
      console.log("[WalletContext] initial eth_chainId - hex:", chainIdHex, "decimal:", parsed);
      setChainId(parsed);
    });

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const switchNetwork = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [HARDHAT_CHAIN],
          });
        } catch (addError) {
          console.error("Could not add Hardhat chain:", addError);
          alert("Please manually switch your MetaMask network to Localhost 8545 (Chain ID: 1337).");
        }
      } else {
        console.error("Could not switch chain:", switchError);
        alert("Please manually switch your MetaMask network to Localhost 8545 (Chain ID: 1337).");
      }
    }

    try {
      const currentChain = await ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(currentChain, 16));
    } catch(e) {}
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      alert("MetaMask not found! Please install MetaMask.");
      return;
    }

    try {
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        setWalletProvider(ethereum);
      }

      await switchNetwork();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(undefined);
    setIsConnected(false);
    setChainId(undefined);
    setWalletProvider(undefined);
  }, []);

  const getSigner = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) throw new Error("No wallet");
    const provider = new ethers.BrowserProvider(ethereum);
    return provider.getSigner();
  }, []);

  return (
    <WalletContext.Provider
      value={{ isConnected, address, chainId, walletProvider, connect, disconnect, getSigner, switchNetwork }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
