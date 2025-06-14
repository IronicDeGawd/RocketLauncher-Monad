import { UIComponents } from "../components/UIComponents.js";

/**
 * EndGameScene - Game over screen with score and restart options
 * Handles score saving and game completion
 */
export class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndGameScene" });
  }

  init(data) {
    // Receive data from GameScene
    this.finalScore = data.score || 0;
    this.totalAttempts = data.totalAttempts || 0;
    this.levelsCompleted = data.levelsCompleted || 0;
    this.reason = data.reason || "completed"; // "completed" or "failed"
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // Create animated starry background
    this.createStarryBackground();

    // Save score to localStorage
    this.saveScore(this.finalScore);

    // Determine if this is a win or loss
    const isVictory = this.reason === "completed";
    const titleText = isVictory ? "🏆 VICTORY!" : "💥 GAME OVER";
    const titleColor = isVictory ? "#00ff00" : "#ff6666";

    // Create title
    this.add
      .text(600, 120, titleText, {
        fontSize: "64px", // Increased from 56px
        fill: titleColor,
        fontStyle: "bold",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Create score display
    this.add
      .text(600, 200, `Final Score: ${this.finalScore}`, {
        fontSize: "36px", // Increased from 32px
        fill: "#ffffff",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Create stats
    this.add
      .text(600, 250, `Levels Completed: ${this.levelsCompleted}`, {
        fontSize: "28px", // Increased from 24px
        fill: "#87ceeb",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    this.add
      .text(600, 280, `Total Attempts Used: ${this.totalAttempts}`, {
        fontSize: "28px", // Increased from 24px
        fill: "#ffaa00",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Show efficiency rating
    const efficiency = this.calculateEfficiency();
    this.add
      .text(600, 310, `Efficiency: ${efficiency}`, {
        fontSize: "22px", // Increased from 20px
        fill: "#ff6b6b",
        fontFamily: "Pixelify Sans, Arial",
      })
      .setOrigin(0.5);

    // Show best score if this is a new record
    const bestScore = this.getBestScore();
    if (this.finalScore >= bestScore && this.finalScore > 0) {
      this.add
        .text(600, 350, "🎉 NEW BEST SCORE! 🎉", {
          fontSize: "28px", // Increased from 24px
          fill: "#ffd700",
          fontStyle: "bold",
          fontFamily: "Pixelify Sans, Arial",
        })
        .setOrigin(0.5);
    } else if (bestScore > 0) {
      this.add
        .text(600, 350, `Best Score: ${bestScore}`, {
          fontSize: "22px", // Increased from 20px
          fill: "#aaaaaa",
          fontFamily: "Pixelify Sans, Arial",
        })
        .setOrigin(0.5);
    }

    // Create restart button
    const restartButton = UIComponents.createButton(
      this,
      500,
      420,
      "PLAY AGAIN",
      () => this.restartGame(),
      {
        width: 160,
        height: 50,
        fontSize: "22px", // Increased from 20px
        fill: 0x00ff00,
        hoverFill: 0x00cc00,
        textColor: "#000000",
      }
    );

    // Create menu button
    const menuButton = UIComponents.createButton(
      this,
      700,
      420,
      "MAIN MENU",
      () => this.goToMenu(),
      {
        width: 160,
        height: 50,
        fontSize: "22px", // Increased from 20px
        fill: 0x3498db,
        hoverFill: 0x2980b9,
        textColor: "#ffffff",
      }
    );

    // Add celebratory particles for victory
    if (isVictory) {
      this.createCelebrationEffect();
    }

    console.log(
      `🎯 End game screen created - Score: ${this.finalScore}, Attempts: ${this.totalAttempts}`
    );
  }

  /**
   * Calculate efficiency rating based on attempts and score
   * @returns {string} Efficiency rating
   */
  calculateEfficiency() {
    if (this.totalAttempts === 0) return "N/A";

    const scorePerAttempt = this.finalScore / this.totalAttempts;

    if (scorePerAttempt >= 50) return "Excellent";
    if (scorePerAttempt >= 30) return "Good";
    if (scorePerAttempt >= 20) return "Average";
    if (scorePerAttempt >= 10) return "Poor";
    return "Needs Improvement";
  }

  /**
   * Create celebration particle effect for victory
   */
  createCelebrationEffect() {
    // Create multiple particle emitters for celebration
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    for (let i = 0; i < 3; i++) {
      const x = 400 + i * 200;
      const particles = this.add.particles(x, 100, "rocket", {
        speed: { min: 100, max: 200 },
        scale: { start: 0.3, end: 0 },
        tint: colors,
        lifespan: 2000,
        frequency: 100,
        gravityY: 50,
      });

      // Stop particles after 3 seconds
      this.time.delayedCall(3000, () => {
        particles.destroy();
      });
    }
  }

  /**
   * Save score to localStorage
   * @param {number} score - Score to save
   */
  saveScore(score) {
    try {
      // Save last score
      localStorage.setItem("rocketCandle_lastScore", score.toString());

      // Update best score if necessary
      const currentBest = this.getBestScore();
      if (score > currentBest) {
        localStorage.setItem("rocketCandle_bestScore", score.toString());
      }

      console.log(
        `💾 Score saved: ${score} (Best: ${Math.max(score, currentBest)})`
      );
    } catch (error) {
      console.warn("Error saving score to localStorage:", error);
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
   * Restart the game
   */
  restartGame() {
    console.log("🔄 Restarting game...");
    this.scene.start("GameScene");
  }

  /**
   * Go to main menu
   */
  goToMenu() {
    console.log("📋 Returning to main menu...");
    this.scene.start("MenuScene");
  }

  /**
   * Create animated starry background
   */
  createStarryBackground() {
    // Create container for stars
    const starContainer = this.add.container(0, 0);

    // Generate random stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.8 + 0.2;

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
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;
      const size = Math.random() * 3 + 2;

      const glowStar = this.add.circle(x, y, size, 0x87ceeb, 0.6);
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

    // Add floating rocket icons in the background
    this.createFloatingRockets();

    console.log("✨ Starry background created for end game scene");
  }

  /**
   * Create floating rocket icons in the background
   */
  createFloatingRockets() {
    // Create 5 floating rocket emojis
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;

      const rocket = this.add
        .text(x, y, "🚀", {
          fontSize: "24px",
          fill: "#ffffff",
          alpha: 0.3,
        })
        .setOrigin(0.5);

      // Add floating animation
      this.tweens.add({
        targets: rocket,
        y: y - 50,
        duration: Math.random() * 4000 + 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Add rotation animation
      this.tweens.add({
        targets: rocket,
        rotation: Math.PI * 2,
        duration: Math.random() * 6000 + 4000,
        repeat: -1,
        ease: "Linear",
      });
    }
  }
}
