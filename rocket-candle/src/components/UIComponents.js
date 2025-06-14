/**
 * UIComponents - Creates reusable UI elements for the game
 * Provides utilities for buttons, sliders, and HUD elements
 */
export class UIComponents {
  /**
   * Create a simple button
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {Function} callback
   * @param {Object} options - Optional settings for button customization
   * @param {number} options.width - Width of the button
   * @param {number} options.height - Height of the button
   * @param {string} options.fontSize - Font size of the button text
   * @param {number} options.fill - Base color of the button
   * @param {number} options.hoverFill - Color of the button on hover
   * @param {string} options.textColor - Color of the button text
   * @param {string} options.fontFamily - Font family of the button text
   * @param {number} options.borderRadius - Border radius of the button
   */
  static createButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || 120;
    const height = options.height || 40;
    const fontSize = options.fontSize || "16px";
    const fill = options.fill || 0x3498db;
    const hoverFill = options.hoverFill || 0x2980b9;
    const textColor = options.textColor || "#ffffff";
    const fontFamily = options.fontFamily || "Arial";
    const borderRadius = options.borderRadius || 0; // Default to 0 if not provided

    const button = scene.add
      .graphics()
      .fillStyle(fill)
      .fillRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        borderRadius
      ) // Use fillRoundedRect
      .setInteractive(
        new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
        Phaser.Geom.Rectangle.Contains
      )
      .on("pointerdown", callback)
      .on("pointerover", () => {
        button.clear();
        button.fillStyle(hoverFill);
        button.fillRoundedRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
          borderRadius
        );
      })
      .on("pointerout", () => {
        button.clear();
        button.fillStyle(fill);
        button.fillRoundedRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
          borderRadius
        );
      });

    const buttonText = scene.add
      .text(x, y, text, {
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
      })
      .setOrigin(0.5);

    return { button, text: buttonText };
  }

  /**
   * Create a slider control
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} min
   * @param {number} max
   * @param {number} initial
   * @param {Function} onChange
   */
  static createSlider(scene, x, y, min, max, initial, onChange) {
    const sliderBg = scene.add.rectangle(x, y, 200, 10, 0x7f8c8d);
    const sliderHandle = scene.add
      .circle(x + ((initial - min) / (max - min)) * 200 - 100, y, 8, 0x3498db)
      .setInteractive()
      .on("drag", (pointer, dragX) => {
        const clampedX = Phaser.Math.Clamp(dragX, x - 100, x + 100);
        sliderHandle.x = clampedX;
        const value = min + ((clampedX - (x - 100)) / 200) * (max - min);
        onChange(value);
      });

    scene.input.setDraggable(sliderHandle);

    return { background: sliderBg, handle: sliderHandle };
  }

  /**
   * Create a vertical slider control
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} min
   * @param {number} max
   * @param {number} initial
   * @param {Function} onChange
   * @param {number} height - Height of the slider (default: 150)
   * @param {Object} options - Optional settings for slider customization
   * @param {number} options.sliderWidth - Width of the slider
   * @param {number} options.handleRadius - Radius of the slider handle
   * @param {number} options.bgColor - Background color of the slider
   * @param {number} options.handleColor - Color of the slider handle
   */
  static createVerticalSlider(
    scene,
    x,
    y,
    min,
    max,
    initial,
    onChange,
    height = 150,
    options = {}
  ) {
    const sliderWidth = options.sliderWidth || 10;
    const handleRadius = options.handleRadius || 8;
    const bgColor = options.bgColor || 0x7f8c8d;
    const handleColor = options.handleColor || 0x3498db;

    const sliderBg = scene.add.rectangle(x, y, sliderWidth, height, bgColor);
    const handleInitialY =
      y + height / 2 - ((initial - min) / (max - min)) * height;
    const sliderHandle = scene.add
      .circle(x, handleInitialY, handleRadius, handleColor)
      .setInteractive()
      .on("drag", (pointer, dragX, dragY) => {
        const clampedY = Phaser.Math.Clamp(
          dragY,
          y - height / 2,
          y + height / 2
        );
        sliderHandle.y = clampedY;
        const value =
          max - ((clampedY - (y - height / 2)) / height) * (max - min);
        onChange(value);
      });

    scene.input.setDraggable(sliderHandle);

    return { background: sliderBg, handle: sliderHandle };
  }

  /**
   * Create HUD text element
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} text
   */
  static createHUDText(scene, x, y, text) {
    return scene.add.text(x, y, text, {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 2,
    });
  }
}
