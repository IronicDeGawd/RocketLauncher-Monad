import { UIComponents } from "../components/UIComponents.js";

/**
 * MenuScene - Main menu with play button and last game score
 * Handles score persistence via localStorage
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.walletManager = null;
    this.web3Service = null;
  }

  create() {
    // Initialize wallet services
    this.initializeWalletServices();

    // Set background
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // Create animated starry background
    this.createStarryBackground();

    // Create title
    this.add
      .text(600, 150, "🚀 ROCKET CANDLE", {
        fontSize: "72px", // Increased from 64px
        fill: "#ffffff",
        fontStyle: "bold",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Create subtitle
    this.add
      .text(600, 220, "Destroy enemies in candlestick markets!", {
        fontSize: "28px", // Increased from 24px
        fill: "#87ceeb",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Get last game score from localStorage
    const lastScore = this.getLastScore();
    const bestScore = this.getBestScore();

    // Display last game score if it exists
    if (lastScore > 0) {
      this.add
        .text(600, 280, `Last Game Score: ${lastScore}`, {
          fontSize: "22px", // Increased from 20px
          fill: "#ffaa00",
          fontFamily: "Pixelify Sans, Arial",
        })
        .setOrigin(0.5);
    }

    // Display best score if it exists
    if (bestScore > 0) {
      this.add
        .text(600, 310, `Best Score: ${bestScore}`, {
          fontSize: "22px", // Increased from 20px
          fill: "#00ff00",
          fontFamily: "Pixelify Sans, Arial",
        })
        .setOrigin(0.5);
    }

    // Create play button - now shows wallet connection status
    const playButton = UIComponents.createButton(
      this,
      600,
      380,
      this.getWalletConnected() ? "PLAY GAME" : "WALLET NOT CONNECTED",
      () => this.startGame(),
      {
        width: 250,
        height: 60,
        fontSize: "22px", // Increased from 20px
        fill: this.getWalletConnected() ? 0x00cc00 : 0x555555, // Darker green for connected, darker grey for disconnected
        hoverFill: this.getWalletConnected() ? 0x00aa00 : 0x444444, // Even darker on hover
        textColor: "#ffffff", // White text for better contrast
        borderRadius: 30, // Rounded corners
        fontFamily: "Pixelify Sans, Inter, sans-serif", // Consistent font
      }
    );

    // Store reference for potential updates
    this.playButton = playButton;

    // Show connection message if wallet not connected
    if (!this.getWalletConnected()) {
      this.add
        .text(600, 340, "Please connect your wallet on the main page", {
          fontSize: "18px", // Increased from 16px
          fill: "#ff6666",
          fontFamily: "Pixelify Sans, Arial",
        })
        .setOrigin(0.5);
    }

    // Create instructions
    this.add
      .text(600, 480, "Use sliders to aim, LAUNCH to fire!", {
        fontSize: "20px", // Increased from 18px
        fill: "#aaaaaa",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    this.add
      .text(600, 510, "Limited attempts per level - make them count!", {
        fontSize: "18px", // Increased from 16px
        fill: "#ff6666",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    console.log("🎮 Main menu created");
  }

  /**
   * Initialize wallet services and add connected account display to top right
   */
  initializeWalletServices() {
    // Get global wallet manager and web3 service
    this.walletManager = window.walletManager;
    this.web3Service = window.web3Service;

    if (this.getWalletConnected() && this.walletManager?.address) {
      const address = this.walletManager.address;
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      this.add
        .text(this.cameras.main.width - 10, 10, `🔗 ${shortAddress}`, {
          fontSize: "16px", // Increased from 14px
          fill: "#00ff00",
          fontFamily: "Pixelify Sans, Inter, sans-serif",
          align: "right",
        })
        .setOrigin(1, 0) // Align to top right
        .setScrollFactor(0); // Keep it fixed on screen
    }

    console.log("🔗 MenuScene: Wallet services initialized");
  }

  /**
   * Check if wallet is connected
   */
  getWalletConnected() {
    return this.walletManager?.isConnected || false;
  }

  /**
   * Start the game
   */
  startGame() {
    if (!this.getWalletConnected()) {
      console.warn("⚠️ Cannot start game: Wallet not connected");
      // Show alert or redirect to main page
      alert("Please connect your wallet on the main page first!");
      return;
    }

    console.log("🚀 Starting new game...");
    this.scene.start("GameScene");
  }

  /**
   * Get last game score from localStorage
   * @returns {number} Last game score or 0 if none
   */
  getLastScore() {
    try {
      const score = localStorage.getItem("rocketCandle_lastScore");
      return score ? parseInt(score, 10) : 0;
    } catch (error) {
      console.warn("Error reading last score from localStorage:", error);
      return 0;
    }
  }

  /**
   * Get best score from localStorage
   * @returns {number} Best score or 0 if none
   */
  getBestScore() {
    try {
      const score = localStorage.getItem("rocketCandle_bestScore");
      return score ? parseInt(score, 10) : 0;
    } catch (error) {
      console.warn("Error reading best score from localStorage:", error);
      return 0;
    }
  }

  /**
   * Create animated starry background
   */
  createStarryBackground() {
    // Create container for stars
    const starContainer = this.add.container(0, 0);
    starContainer.setAlpha(0.4); // Set overall opacity for the star container

    // Generate random stars
    for (let i = 0; i < 70; i++) {
      // Reduced number of stars
      const x = Math.random() * 1200;
      const y = Math.random() * 600;
      const size = Math.random() * 1.5 + 0.3; // Smaller stars
      const alpha = Math.random() * 0.6 + 0.1; // Less bright stars

      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      starContainer.add(star);

      // Add twinkling animation
      this.tweens.add({
        targets: star,
        alpha: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 2000 + 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Add some larger glowing stars
    for (let i = 0; i < 10; i++) {
      // Reduced number of glowing stars
      const x = Math.random() * 1200;
      const y = Math.random() * 600;
      const size = Math.random() * 2.5 + 1.5; // Slightly smaller glowing stars

      const glowStar = this.add.circle(x, y, size, 0x87ceeb, 0.4); // Dimmer glow
      starContainer.add(glowStar);

      // Add pulsing animation
      this.tweens.add({
        targets: glowStar,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0.3,
        duration: Math.random() * 3000 + 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Add floating elements
    this.createFloatingElements();

    console.log("✨ Starry background created for menu");
  }

  /**
   * Create floating elements in the background
   */
  createFloatingElements() {
    // Create floating rocket emojis
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;

      const rocket = this.add
        .text(x, y, "🚀", {
          fontSize: "20px",
          fill: "#ffffff",
          alpha: 0.2,
        })
        .setOrigin(0.5);

      // Add floating animation
      this.tweens.add({
        targets: rocket,
        y: y - 40,
        duration: Math.random() * 5000 + 4000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Add slow rotation
      this.tweens.add({
        targets: rocket,
        rotation: Math.PI * 2,
        duration: Math.random() * 8000 + 6000,
        repeat: -1,
        ease: "Linear",
      });
    }

    // Create floating candlestick emojis
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;

      const candle = this.add
        .text(x, y, "🕯️", {
          fontSize: "18px",
          fill: "#ffaa00",
          alpha: 0.15,
        })
        .setOrigin(0.5);

      // Add gentle floating animation
      this.tweens.add({
        targets: candle,
        y: y - 30,
        x: x + Math.random() * 40 - 20,
        duration: Math.random() * 6000 + 5000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}
