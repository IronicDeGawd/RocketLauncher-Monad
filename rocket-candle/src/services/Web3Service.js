import { API_CONFIG, CONTRACTS } from "../config/web3Config.js";

class Web3Service {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.walletAddress = null;
    this.isConnected = false;
  }

  // Set wallet address when user connects
  setWallet(address) {
    this.walletAddress = address;
    this.isConnected = !!address;
    console.log(
      `Wallet ${this.isConnected ? "connected" : "disconnected"}:`,
      address
    );
  }

  // Generic API call with retry logic
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `API call (attempt ${attempt}):`,
          url,
          defaultOptions.method || "GET"
        );

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API response:", data);

        return data;
      } catch (error) {
        lastError = error;
        console.error(`API call attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  // Submit game score to blockchain
  async submitScore(level, score) {
    if (!this.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      const response = await this.apiCall(API_CONFIG.ENDPOINTS.SUBMIT_SCORE, {
        method: "POST",
        body: JSON.stringify({
          player: this.walletAddress,
          level: level,
          score: score,
        }),
      });

      if (response.success) {
        console.log("Score submitted successfully:", response.transactionHash);
        return response;
      } else {
        throw new Error(response.error || "Failed to submit score");
      }
    } catch (error) {
      console.error("Submit score error:", error);
      throw error;
    }
  }

  // Reward FUEL tokens
  async rewardFuel(amount) {
    if (!this.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      const response = await this.apiCall(API_CONFIG.ENDPOINTS.REWARD_FUEL, {
        method: "POST",
        body: JSON.stringify({
          player: this.walletAddress,
          amount: amount,
        }),
      });

      if (response.success) {
        console.log("FUEL reward successful:", response.transactionHash);
        return response;
      } else {
        throw new Error(response.error || "Failed to reward FUEL");
      }
    } catch (error) {
      console.error("Reward FUEL error:", error);
      throw error;
    }
  }

  // Get player's scores
  async getPlayerScores(address = null) {
    const playerAddress = address || this.walletAddress;

    if (!playerAddress) {
      throw new Error("No wallet address provided");
    }

    try {
      const response = await this.apiCall(
        `${API_CONFIG.ENDPOINTS.PLAYER_SCORES}/${playerAddress}`
      );
      return response.results || [];
    } catch (error) {
      console.error("Get player scores error:", error);
      return [];
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const response = await this.apiCall(
        `${API_CONFIG.ENDPOINTS.LEADERBOARD}?limit=${limit}`
      );
      return response.leaderboard || [];
    } catch (error) {
      console.error("Get leaderboard error:", error);
      return [];
    }
  }

  // Get FUEL balance
  async getFuelBalance(address = null) {
    const playerAddress = address || this.walletAddress;

    if (!playerAddress) {
      throw new Error("No wallet address provided");
    }

    try {
      const response = await this.apiCall(
        `${API_CONFIG.ENDPOINTS.FUEL_BALANCE}/${playerAddress}`
      );
      return {
        balance: parseFloat(response.balance) || 0,
        address: playerAddress,
      };
    } catch (error) {
      console.error("Get FUEL balance error:", error);
      return { balance: 0, address: playerAddress };
    }
  }

  // Check backend health
  async checkHealth() {
    try {
      const response = await fetch(
        `${this.baseUrl.replace("/api", "")}/health`
      );
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "ERROR", error: error.message };
    }
  }
}

// Export singleton instance
export const web3Service = new Web3Service();
