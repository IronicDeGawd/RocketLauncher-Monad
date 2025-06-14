import { web3Service } from "../services/Web3Service.js";

export class WalletManager {
  constructor() {
    this.isConnected = false;
    this.address = null;
    this.fuelBalance = 0;
    this.onConnectionChange = null;

    // Check if Web3 is available
    this.isWeb3Available = typeof window !== "undefined" && window.ethereum;

    if (this.isWeb3Available) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("Accounts changed:", accounts);
        this.handleAccountsChanged(accounts);
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId) => {
        console.log("Chain changed:", chainId);
        this.handleChainChanged(chainId);
      });

      // Listen for connection
      window.ethereum.on("connect", (connectInfo) => {
        console.log("Wallet connected:", connectInfo);
      });

      // Listen for disconnection
      window.ethereum.on("disconnect", (error) => {
        console.log("Wallet disconnected:", error);
        this.handleDisconnect();
      });
    }
  }

  async connectWallet() {
    if (!this.isWeb3Available) {
      throw new Error(
        "Web3 wallet not available. Please install MetaMask or another Web3 wallet."
      );
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        await this.handleConnection(accounts[0]);
        return this.address;
      } else {
        throw new Error("No accounts returned from wallet");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    }
  }

  async handleConnection(address) {
    this.address = address;
    this.isConnected = true;

    // Update Web3 service
    web3Service.setWallet(address);

    // Load FUEL balance
    await this.loadFuelBalance();

    // Check/switch to Monad network
    await this.ensureCorrectNetwork();

    console.log(`Wallet connected: ${address}`);

    // Notify listeners
    if (this.onConnectionChange) {
      this.onConnectionChange(this.isConnected, this.address);
    }
  }

  async handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.handleDisconnect();
    } else {
      await this.handleConnection(accounts[0]);
    }
  }

  handleChainChanged(chainId) {
    // Convert hex to decimal
    const decimalChainId = parseInt(chainId, 16);
    console.log("Chain changed to:", decimalChainId);

    // Check if we're on Monad testnet
    if (decimalChainId !== 10143) {
      console.warn("Not on Monad testnet, requesting switch...");
      this.switchToMonadNetwork();
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    this.address = null;
    this.fuelBalance = 0;

    // Update Web3 service
    web3Service.setWallet(null);

    console.log("Wallet disconnected");

    // Notify listeners
    if (this.onConnectionChange) {
      this.onConnectionChange(this.isConnected, this.address);
    }
  }

  async ensureCorrectNetwork() {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const decimalChainId = parseInt(chainId, 16);

      if (decimalChainId !== 10143) {
        await this.switchToMonadNetwork();
      }
    } catch (error) {
      console.error("Network check failed:", error);
    }
  }

  async switchToMonadNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x279F" }], // 10143 in hex
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x279F",
                chainName: "Monad Testnet",
                nativeCurrency: {
                  name: "MON",
                  symbol: "MON",
                  decimals: 18,
                },
                rpcUrls: ["https://testnet-rpc.monad.xyz/"],
                blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Monad network:", addError);
          throw addError;
        }
      } else {
        console.error("Failed to switch to Monad network:", switchError);
        throw switchError;
      }
    }
  }

  async loadFuelBalance() {
    if (!this.isConnected) return;

    try {
      this.fuelBalance = await web3Service.getFuelBalance();
      console.log(`FUEL balance: ${this.fuelBalance}`);
    } catch (error) {
      console.error("Failed to load FUEL balance:", error);
      this.fuelBalance = 0;
    }
  }

  disconnect() {
    this.handleDisconnect();
  }

  // Get shortened address for display
  getShortAddress() {
    if (!this.address) return "";
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  // Set callback for connection changes
  onConnect(callback) {
    this.onConnectionChange = callback;
  }

  // Check if wallet is already connected
  async checkConnection() {
    if (!this.isWeb3Available) {
      return false;
    }

    try {
      // Check if there are connected accounts
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts && accounts.length > 0) {
        await this.handleConnection(accounts[0]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
      return false;
    }
  }
}

// Export singleton instance
export const walletManager = new WalletManager();
