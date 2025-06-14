/**
 * AssetGenerator - Creates placeholder sprites programmatically
 * This utility generates simple colored shapes as textures for MVP development
 */
export class AssetGenerator {
  /**
   * Generate all placeholder assets for the game
   * @param {Phaser.Scene} scene - The Phaser scene to add textures to
   */
  static generateAssets(scene) {
    // Skip rocket and launcher sprites - using actual assets
    // this.createRectangleTexture(scene, "rocket", 20, 60, 0x3498db);
    // this.createRectangleTexture(scene, "launcher", 40, 40, 0xe74c3c);

    // Create destructible blocks (30x30px squares) - keeping for fallback
    this.createRectangleTexture(scene, "block-red", 30, 30, 0xff0000, true); // Added red
    this.createRectangleTexture(scene, "block-green", 30, 30, 0x27ae60, true);
    this.createRectangleTexture(scene, "block-blue", 30, 30, 0x3498db, true); // Added blue
    this.createRectangleTexture(scene, "block-yellow", 30, 30, 0xf1c40f, true);

    // Market-driven block types
    this.createRectangleTexture(
      scene,
      "block-reinforced",
      30,
      30,
      0x4a4a4a,
      true,
      false,
      "reinforced"
    );
    this.createRectangleTexture(
      scene,
      "block-fragile",
      30,
      30,
      0xffcccc,
      true,
      false,
      "fragile"
    );
    this.createRectangleTexture(
      scene,
      "block-volume-high",
      30,
      30,
      0x9d4edd,
      true,
      false,
      "volume"
    );
    this.createRectangleTexture(
      scene,
      "block-volume-low",
      30,
      30,
      0xe0aaff,
      true,
      false,
      "volume"
    );

    // Create enemy sprite (black circle 20px diameter)
    this.createCircleTexture(scene, "enemy", 10, 0x2c3e50);

    // Create candlestick barrier (gray bar)
    this.createRectangleTexture(scene, "candlestick", 60, 100, 0x7f8c8d);

    // Create indestructible base platform (dark gray, solid looking)
    this.createRectangleTexture(
      scene,
      "base-platform",
      50,
      20,
      0x555555,
      false,
      true
    ); // New texture

    // Create particle texture for explosions
    this.createCircleTexture(scene, "particle", 3, 0xffffff);

    console.log("✅ Placeholder assets generated successfully");
  }

  /**
   * Create a rectangle texture
   */
  static createRectangleTexture(
    scene,
    key,
    width,
    height,
    color,
    isBlock = false,
    isPlatform = false, // New flag for platform styling
    blockType = "standard" // New parameter for block type styling
  ) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color);

    if (key === "rocket") {
      // Draw a pointed rocket shape (triangle on top of a rectangle)
      const bodyHeight = height * 0.7;
      const headHeight = height * 0.3;
      // Body
      graphics.fillRect(0, headHeight, width, bodyHeight);
      // Head (triangle)
      graphics.beginPath();
      graphics.moveTo(width / 2, 0); // Tip of the rocket
      graphics.lineTo(0, headHeight); // Bottom-left of the head
      graphics.lineTo(width, headHeight); // Bottom-right of the head
      graphics.closePath();
      graphics.fillPath();
    } else {
      graphics.fillRect(0, 0, width, height);
    }

    // Add a simple pattern for blocks to make them more distinct
    if (isBlock) {
      graphics.lineStyle(2, 0x000000, 0.5); // Add a thin black border
      graphics.strokeRect(0, 0, width, height);

      // Add type-specific styling
      if (blockType === "reinforced") {
        // Add metal-like appearance with cross pattern
        graphics.lineStyle(1, 0x666666, 0.8);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(width, height);
        graphics.moveTo(width, 0);
        graphics.lineTo(0, height);
        graphics.strokePath();

        // Add rivets in corners
        graphics.fillStyle(0x333333);
        graphics.fillCircle(3, 3, 2);
        graphics.fillCircle(width - 3, 3, 2);
        graphics.fillCircle(3, height - 3, 2);
        graphics.fillCircle(width - 3, height - 3, 2);
      } else if (blockType === "fragile") {
        // Add crack pattern
        graphics.lineStyle(1, 0x999999, 0.6);
        graphics.beginPath();
        graphics.moveTo(5, 0);
        graphics.lineTo(8, height / 2);
        graphics.lineTo(12, height);
        graphics.moveTo(width - 5, 0);
        graphics.lineTo(width - 8, height / 2);
        graphics.strokePath();
      } else if (blockType === "volume") {
        // Add volume bar pattern
        graphics.fillStyle(color, 0.3);
        for (let i = 0; i < 5; i++) {
          const barHeight = (i + 1) * 4;
          graphics.fillRect(3 + i * 4, height - barHeight - 2, 3, barHeight);
        }
      } else {
        // Standard block with inner square
        graphics.fillStyle(color, 0.7); // Slightly darker or different shade
        graphics.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6);
      }
    }

    // Add styling for indestructible platforms (e.g., a border or slight bevel)
    if (isPlatform) {
      graphics.lineStyle(2, 0x333333, 1); // Darker border for solidity
      graphics.strokeRect(0, 0, width, height);
      // Optional: add a subtle highlight or shadow for a 3D effect
      graphics.lineStyle(1, 0x777777, 1);
      graphics.beginPath();
      graphics.moveTo(1, height - 1);
      graphics.lineTo(1, 1);
      graphics.lineTo(width - 1, 1);
      graphics.strokePath();
    }

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * Create a circle texture
   */
  static createCircleTexture(scene, key, radius, color) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillCircle(radius, radius, radius);
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
  }
}
