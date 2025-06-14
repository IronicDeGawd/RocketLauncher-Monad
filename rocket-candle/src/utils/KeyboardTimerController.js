/**
 * KeyboardTimerController - Handles keyboard controls and timer lock system
 * Provides abstracted keyboard input handling and launch timer management
 */
export class KeyboardTimerController {
  constructor(scene, config = {}) {
    this.scene = scene;

    // Configuration
    this.angleMin = config.angleMin || 15;
    this.angleMax = config.angleMax || 75;
    this.powerMin = config.powerMin || 0;
    this.powerMax = config.powerMax || 100;
    this.angleStepSize = config.angleStepSize || 2;
    this.powerStepSize = config.powerStepSize || 5;
    this.timerDuration = config.timerDuration || 8000; // 8 seconds

    // State
    this.isTimerActive = false;
    this.timerStartTime = 0;
    this.hasInteracted = false;

    // UI Elements
    this.timerText = null;
    this.timerContainer = null;

    // Callbacks
    this.onAngleChange = config.onAngleChange || (() => {});
    this.onPowerChange = config.onPowerChange || (() => {});
    this.onAutoLaunch = config.onAutoLaunch || (() => {});

    // Initialize
    this.setupKeyboardControls();
    this.createTimerUI();

    console.log("✅ KeyboardTimerController initialized");
  }

  /**
   * Set up keyboard input handling
   */
  setupKeyboardControls() {
    // Create keyboard input cursors for arrow keys and WASD
    this.keys = this.scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // Set up key press events with rate limiting
    this.setupKeyPressEvents();

    console.log(
      "⌨️ Keyboard controls configured: W/E for angle, S/D for power, SPACE for launch"
    );
  }

  /**
   * Set up key press events with proper rate limiting
   */
  setupKeyPressEvents() {
    // Rate limiting variables
    this.lastKeyPressTime = {
      W: 0,
      E: 0,
      S: 0,
      D: 0,
      SPACE: 0,
    };
    this.keyRepeatDelay = 150; // milliseconds between key repeats

    // Store original scene update if it exists
    this.originalUpdate = this.scene.update
      ? this.scene.update.bind(this.scene)
      : null;

    // Override scene update to handle our keyboard logic
    this.scene.update = (time, delta) => {
      // Call original update first
      if (this.originalUpdate) {
        this.originalUpdate(time, delta);
      }

      // Handle our keyboard input
      this.handleKeyboardInput(time);

      // Update timer
      this.updateTimer(time);
    };
  }

  /**
   * Handle keyboard input with rate limiting
   */
  handleKeyboardInput(time) {
    // Check if we can launch (not in timer or rocket not in flight)
    const canInteract = this.scene.canLaunch && !this.scene.gameOver;

    if (!canInteract) return;

    // Handle angle controls (W/E)
    if (
      this.keys.W.isDown &&
      time - this.lastKeyPressTime.W > this.keyRepeatDelay
    ) {
      this.adjustAngle(this.angleStepSize);
      this.lastKeyPressTime.W = time;
      this.startTimer();
    }

    if (
      this.keys.E.isDown &&
      time - this.lastKeyPressTime.E > this.keyRepeatDelay
    ) {
      this.adjustAngle(-this.angleStepSize);
      this.lastKeyPressTime.E = time;
      this.startTimer();
    }

    // Handle power controls (S/D)
    if (
      this.keys.S.isDown &&
      time - this.lastKeyPressTime.S > this.keyRepeatDelay
    ) {
      this.adjustPower(-this.powerStepSize);
      this.lastKeyPressTime.S = time;
      this.startTimer();
    }

    if (
      this.keys.D.isDown &&
      time - this.lastKeyPressTime.D > this.keyRepeatDelay
    ) {
      this.adjustPower(this.powerStepSize);
      this.lastKeyPressTime.D = time;
      this.startTimer();
    }

    // Handle launch (SPACE)
    if (
      this.keys.SPACE.isDown &&
      time - this.lastKeyPressTime.SPACE > this.keyRepeatDelay
    ) {
      this.manualLaunch();
      this.lastKeyPressTime.SPACE = time;
    }
  }

  /**
   * Adjust angle value within bounds
   */
  adjustAngle(delta) {
    const currentAngle = this.scene.launchAngle;
    const newAngle = Phaser.Math.Clamp(
      currentAngle + delta,
      this.angleMin,
      this.angleMax
    );

    if (newAngle !== currentAngle) {
      this.scene.launchAngle = Math.round(newAngle);
      this.onAngleChange(this.scene.launchAngle);
      console.log(`🎯 Angle adjusted to ${this.scene.launchAngle}°`);
    }
  }

  /**
   * Adjust power value within bounds
   */
  adjustPower(delta) {
    const currentPower = this.scene.launchPower;
    const newPower = Phaser.Math.Clamp(
      currentPower + delta,
      this.powerMin,
      this.powerMax
    );

    if (newPower !== currentPower) {
      this.scene.launchPower = Math.round(newPower);
      this.onPowerChange(this.scene.launchPower);
      console.log(`⚡ Power adjusted to ${this.scene.launchPower}%`);
    }
  }

  /**
   * Start the launch timer
   */
  startTimer() {
    if (this.isTimerActive) return; // Timer already running

    this.isTimerActive = true;
    this.timerStartTime = this.scene.time.now;
    this.hasInteracted = true;

    // Show timer UI
    if (this.timerContainer) {
      this.timerContainer.setVisible(true);
    }

    console.log(
      `⏱️ Launch timer started: ${this.timerDuration / 1000}s countdown`
    );
  }

  /**
   * Stop the timer
   */
  stopTimer() {
    this.isTimerActive = false;
    this.hasInteracted = false;

    // Hide timer UI
    if (this.timerContainer) {
      this.timerContainer.setVisible(false);
    }

    console.log("⏹️ Launch timer stopped");
  }

  /**
   * Update timer display and handle auto-launch
   */
  updateTimer(time) {
    if (!this.isTimerActive || !this.hasInteracted) return;

    const elapsed = time - this.timerStartTime;
    const remaining = Math.max(0, this.timerDuration - elapsed);

    // Update timer text (removed timer bar logic)
    if (this.timerText) {
      const secondsRemaining = Math.ceil(remaining / 1000);
      this.timerText.setText(`Auto-launch in: ${secondsRemaining}s`);
    }

    // Auto-launch when timer expires
    if (remaining <= 0 && this.scene.canLaunch) {
      console.log("🚀 Auto-launching rocket - timer expired!");
      this.stopTimer();
      this.onAutoLaunch();
    }
  }

  /**
   * Handle manual launch (SPACE key)
   */
  manualLaunch() {
    if (this.scene.canLaunch && !this.scene.gameOver) {
      console.log("🚀 Manual launch triggered");
      this.stopTimer();
      this.onAutoLaunch(); // Use same callback
    }
  }

  /**
   * Create timer UI elements
   */
  createTimerUI() {
    // Create container for timer UI (moved to avoid overlap)
    this.timerContainer = this.scene.add.container(600, 100);

    // Timer text (only numeric countdown, no bar)
    this.timerText = this.scene.add
      .text(0, 0, "Auto-launch in: 8s", {
        fontSize: "18px",
        fill: "#ffffff",
        fontFamily: "Arial",
        align: "center",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Instruction text (positioned below timer text)
    const instructionText = this.scene.add
      .text(0, 25, "W/E: Angle | S/D: Power | SPACE: Launch", {
        fontSize: "14px",
        fill: "#aaaaaa",
        fontFamily: "Arial",
        align: "center",
      })
      .setOrigin(0.5);

    // Add to container (removed timer bar)
    this.timerContainer.add([this.timerText, instructionText]);

    // Initially hidden
    this.timerContainer.setVisible(false);

    console.log("⏱️ Timer UI created (text only, no bar)");
  }

  /**
   * Reset the controller state
   */
  reset() {
    this.stopTimer();
    this.hasInteracted = false;
    console.log("🔄 KeyboardTimerController reset");
  }

  /**
   * Clean up the controller
   */
  destroy() {
    // Restore original update method
    if (this.originalUpdate) {
      this.scene.update = this.originalUpdate;
    } else {
      delete this.scene.update;
    }

    // Clean up UI
    if (this.timerContainer) {
      this.timerContainer.destroy();
    }

    // Clean up keyboard input
    if (this.keys) {
      Object.values(this.keys).forEach((key) => {
        if (key && key.destroy) {
          key.destroy();
        }
      });
    }

    console.log("🧹 KeyboardTimerController destroyed");
  }

  /**
   * Get current timer state for debugging
   */
  getTimerState() {
    return {
      isActive: this.isTimerActive,
      hasInteracted: this.hasInteracted,
      elapsed: this.isTimerActive
        ? this.scene.time.now - this.timerStartTime
        : 0,
      remaining: this.isTimerActive
        ? Math.max(
            0,
            this.timerDuration - (this.scene.time.now - this.timerStartTime)
          )
        : 0,
    };
  }
}
