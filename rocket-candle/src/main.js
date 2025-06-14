import "./style.css";
import Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { EndGameScene } from "./scenes/EndGameScene.js";
import { walletManager } from "./services/WalletManager.js";
import { web3Service } from "./services/Web3Service.js";

// Initialize wallet manager
console.log("🔗 Initializing wallet manager...");

// Check if wallet is already connected from landing page
if (walletManager.isConnected) {
  console.log("✅ Wallet already connected:", walletManager.address);
} else {
  console.log("⚠️ Starting game without wallet connection");
}

// Check backend health
web3Service.checkHealth().then((health) => {
  console.log("🔧 Backend health:", health);
});

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1200, // Increased from 800
  height: 600,
  parent: "app",
  backgroundColor: "#2c3e50",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [PreloadScene, MenuScene, GameScene, EndGameScene],
};

// Initialize Phaser game
const game = new Phaser.Game(config);

// Make wallet manager and web3 service globally available to game scenes
window.walletManager = walletManager;
window.web3Service = web3Service;

console.log("🚀 Rocket Candle: Game initialized with Web3 integration!");
