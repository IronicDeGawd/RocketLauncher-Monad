import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
  })
);
app.use(express.json());

// Monad RPC configuration
const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize provider and wallet only if private key is valid
let provider;
let wallet;

if (
  PRIVATE_KEY &&
  PRIVATE_KEY !== "your_private_key_here" &&
  PRIVATE_KEY.length >= 64
) {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    // Add 0x prefix if not present
    const formattedPrivateKey = PRIVATE_KEY.startsWith("0x")
      ? PRIVATE_KEY
      : `0x${PRIVATE_KEY}`;
    wallet = new ethers.Wallet(formattedPrivateKey, provider);
    console.log("✅ Wallet initialized with address:", wallet.address);
  } catch (error) {
    console.error("❌ Failed to initialize wallet:", error.message);
    console.log("⚠️  Running in demo mode without wallet");
  }
} else {
  console.log("⚠️  No valid private key provided, running in demo mode");
  console.log(
    "   Current PRIVATE_KEY length:",
    PRIVATE_KEY ? PRIVATE_KEY.length : 0
  );
}

// Contract ABIs (simplified for demo)
const ROCKET_CANDLE_ABI = [
  "function recordResult(address _player, uint16 _score, string memory _period) external",
  "function getPlayerResults(address _player) external view returns (tuple(address player, uint256 timestamp, string period, uint16 score)[])",
  "function getLeaderboard(uint256 _limit) external view returns (tuple(address player, uint256 timestamp, string period, uint16 score)[])",
  "function getTotalResults() external view returns (uint256)",
];

const ROCKET_FUEL_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// Contract addresses (to be set after deployment)
const ROCKET_CANDLE_ADDRESS = process.env.ROCKET_CANDLE_ADDRESS;
const ROCKET_FUEL_ADDRESS = process.env.ROCKET_FUEL_ADDRESS;

let rocketCandleContract;
let rocketFuelContract;

if (ROCKET_CANDLE_ADDRESS && wallet) {
  rocketCandleContract = new ethers.Contract(
    ROCKET_CANDLE_ADDRESS,
    ROCKET_CANDLE_ABI,
    wallet
  );
}

if (ROCKET_FUEL_ADDRESS && wallet) {
  rocketFuelContract = new ethers.Contract(
    ROCKET_FUEL_ADDRESS,
    ROCKET_FUEL_ABI,
    wallet
  );
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    network: "monad-testnet",
    walletConnected: !!wallet,
    walletAddress: wallet?.address || "Not configured",
    contracts: {
      rocketCandle: ROCKET_CANDLE_ADDRESS || "Not configured",
      rocketFuel: ROCKET_FUEL_ADDRESS || "Not configured",
    },
  });
});

// Submit game score
app.post("/api/submit-score", async (req, res) => {
  try {
    const { player, level, score } = req.body;

    // Validation
    if (!ethers.isAddress(player)) {
      return res.status(400).json({ error: "Invalid player address" });
    }

    // Allow both numeric levels (1-7) and special final score identifiers
    const isFinalScore =
      typeof level === "string" && level.startsWith("final-");
    const isNumericLevel =
      typeof level === "number" && level >= 1 && level <= 7;

    if (!level || (!isFinalScore && !isNumericLevel)) {
      return res.status(400).json({
        error:
          "Invalid level (must be 1-7 or final-game-complete/final-game-failed)",
      });
    }

    if (!score || score < 0) {
      return res.status(400).json({ error: "Invalid score" });
    }

    if (!rocketCandleContract) {
      return res.status(500).json({ error: "Contract not configured" });
    }

    // Submit to blockchain with retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Submitting score attempt ${attempt}: Player ${player}, Level ${level}, Score ${score}`
        );

        // Format period string based on level type
        const periodString = isFinalScore ? level : `level-${level}`;

        const tx = await rocketCandleContract.recordResult(
          player,
          score,
          periodString
        );

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.transactionHash}`);

        return res.json({
          success: true,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
        });
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    console.error("All attempts failed:", lastError);
    return res.status(500).json({
      error: "Failed to submit score after multiple attempts",
      details: lastError.message,
    });
  } catch (error) {
    console.error("Submit score error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reward FUEL tokens
app.post("/api/reward-fuel", async (req, res) => {
  try {
    const { player, amount } = req.body;

    // Validation
    if (!ethers.isAddress(player)) {
      return res.status(400).json({ error: "Invalid player address" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!rocketFuelContract) {
      return res.status(500).json({ error: "FUEL contract not configured" });
    }

    // Get decimals for proper amount calculation
    const decimals = await rocketFuelContract.decimals();
    const mintAmount = ethers.parseUnits(amount.toString(), decimals);

    // Mint tokens with retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Minting FUEL attempt ${attempt}: ${amount} tokens to ${player}`
        );

        const tx = await rocketFuelContract.mint(player, mintAmount);
        console.log(`FUEL mint transaction sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`FUEL mint confirmed: ${receipt.transactionHash}`);

        return res.json({
          success: true,
          transactionHash: receipt.transactionHash,
          amount: amount,
          recipient: player,
        });
      } catch (error) {
        lastError = error;
        console.error(`FUEL mint attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    console.error("All FUEL mint attempts failed:", lastError);
    return res.status(500).json({
      error: "Failed to mint FUEL tokens after multiple attempts",
      details: lastError.message,
    });
  } catch (error) {
    console.error("Reward FUEL error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get player's scores
app.get("/api/player-scores/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    if (!rocketCandleContract) {
      return res.status(500).json({ error: "Contract not configured" });
    }

    const playerResults = await rocketCandleContract.getPlayerResults(address);

    // Format results
    const formattedResults = playerResults.map((result) => ({
      player: result.player,
      timestamp: Number(result.timestamp),
      period: result.period,
      score: Number(result.score),
    }));

    res.json({
      success: true,
      player: address,
      results: formattedResults,
      totalResults: formattedResults.length,
    });
  } catch (error) {
    console.error("Get player scores error:", error);
    res.status(500).json({ error: "Failed to fetch player scores" });
  }
});

// Get leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (!rocketCandleContract) {
      return res.status(500).json({ error: "Contract not configured" });
    }

    const leaderboard = await rocketCandleContract.getLeaderboard(limit);

    // Format leaderboard
    const formattedLeaderboard = leaderboard.map((result, index) => ({
      rank: index + 1,
      player: result.player,
      timestamp: Number(result.timestamp),
      period: result.period,
      score: Number(result.score),
    }));

    res.json({
      success: true,
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get FUEL balance
app.get("/api/fuel-balance/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    if (!rocketFuelContract) {
      return res.status(500).json({ error: "FUEL contract not configured" });
    }

    const balance = await rocketFuelContract.balanceOf(address);
    const decimals = await rocketFuelContract.decimals();

    res.json({
      success: true,
      address: address,
      balance: ethers.formatUnits(balance, decimals),
      balanceWei: balance.toString(),
    });
  } catch (error) {
    console.error("Get FUEL balance error:", error);
    res.status(500).json({ error: "Failed to fetch FUEL balance" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rocket Candle Backend running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Game API: http://localhost:${PORT}/api/`);
  console.log(`⛓️  Network: ${RPC_URL}`);
  console.log(
    `📝 Contracts configured: ${
      ROCKET_CANDLE_ADDRESS ? "✅" : "❌"
    } RocketCandle, ${ROCKET_FUEL_ADDRESS ? "✅" : "❌"} RocketFuel`
  );
});

export default app;
