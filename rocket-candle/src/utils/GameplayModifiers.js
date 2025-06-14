/**
 * GameplayModifiers - Handles market-driven gameplay modifications
 * Translates market analysis into specific game mechanics
 */
export class GameplayModifiers {
  /**
   * Generate blocks based on market analysis
   * @param {Object} analysis - Market analysis from MarketAnalyzer
   * @param {Object} platform - Platform configuration
   * @returns {Object} Block generation configuration
   */
  static generateBlockConfiguration(analysis, platform) {
    const { gameplayModifiers } = analysis;
    const { blockDensity, blockHealth, blockStability } = gameplayModifiers;

    // Calculate number of layers based on market volatility and timeframe
    const baseLayersByTimeframe = {
      "1m": 2,
      "5m": 2,
      "15m": 3,
      "1h": 4,
      "4h": 5,
      "1d": 6,
    };

    const baseLayers = baseLayersByTimeframe[analysis.timeframe] || 3;
    const volatilityModifier =
      analysis.volatility.level === "extreme"
        ? 1.5
        : analysis.volatility.level === "high"
        ? 1.3
        : 1.0;

    const maxLayers = Math.min(8, Math.ceil(baseLayers * volatilityModifier));
    const actualLayers = Math.max(1, Math.floor(Math.random() * maxLayers) + 1);

    // Calculate blocks per layer based on density
    const densityMultiplier =
      {
        low: 0.8,
        medium: 1.0,
        high: 1.4,
      }[blockDensity] || 1.0;

    const baseBlocksPerLayer = Math.floor(platform.width / 25); // 25px block spacing
    const blocksPerLayer = Math.max(
      1,
      Math.floor(baseBlocksPerLayer * densityMultiplier)
    );

    // Determine block types based on market conditions
    const blockTypes = this.determineBlockTypes(analysis);

    return {
      layers: actualLayers,
      blocksPerLayer,
      blockHealth,
      blockStability,
      blockTypes,
      spacing: platform.width / blocksPerLayer,
      reinforcementProbability: blockStability === "high" ? 0.3 : 0.1,
    };
  }

  /**
   * Generate enemy configuration based on market analysis
   * @param {Object} analysis - Market analysis
   * @returns {Object} Enemy configuration
   */
  static generateEnemyConfiguration(analysis) {
    const { gameplayModifiers, marketCondition } = analysis;
    const { enemySpeed, enemyAggression, enemyIntelligence } =
      gameplayModifiers;

    // Spawn probability based on timeframe and volatility
    const baseSpawnProbability = 0.4;
    const volatilityBonus = analysis.volatility.isHighVolatility ? 0.2 : 0;
    const spawnProbability = Math.min(
      0.8,
      baseSpawnProbability + volatilityBonus
    );

    return {
      spawnProbability,
      speed: enemySpeed,
      aggression: enemyAggression,
      intelligence: enemyIntelligence,
      movementPattern: this.determineMovementPattern(marketCondition),
      color: this.determineEnemyColor(marketCondition),
      detectionRange: enemyAggression === "high" ? 150 : 100,
    };
  }

  /**
   * Calculate dynamic scoring based on market context
   * @param {Object} analysis - Market analysis
   * @param {Object} destructionData - Destruction statistics
   * @returns {number} Calculated score
   */
  static calculateMarketBasedScore(analysis, destructionData) {
    const { gameplayModifiers } = analysis;
    let baseScore = destructionData.enemiesDestroyed * 100;

    // Apply market-based bonuses
    baseScore += gameplayModifiers.volatilityBonus;
    baseScore += gameplayModifiers.trendBonus;
    baseScore += gameplayModifiers.volumeBonus;

    // Efficiency bonuses based on market conditions
    if (
      analysis.trend.direction === "bullish" &&
      destructionData.shotsUsed <= 3
    ) {
      baseScore *= 1.3; // Bull markets reward quick decisions
    }

    if (
      analysis.trend.direction === "bearish" &&
      destructionData.accuracy > 0.8
    ) {
      baseScore *= 1.4; // Bear markets reward precision
    }

    if (
      analysis.volatility.isHighVolatility &&
      destructionData.chainReactions > 2
    ) {
      baseScore *= 1.5; // High volatility rewards chain reactions
    }

    // Timeframe difficulty multiplier
    baseScore *= analysis.characteristics.difficultyMultiplier;

    return Math.floor(baseScore);
  }

  /**
   * Determine block types based on market conditions
   */
  static determineBlockTypes(analysis) {
    const { trend, volatility, volume } = analysis;
    const types = [];

    // Standard blocks always present
    types.push("standard");

    // Add reinforced blocks for strong trends or high volume
    if (trend.strength > 0.05 || volume.isHighVolume) {
      types.push("reinforced");
    }

    // Add fragile blocks for high volatility
    if (volatility.isHighVolatility) {
      types.push("fragile");
    }

    return types;
  }

  /**
   * Determine enemy movement pattern based on market condition
   */
  static determineMovementPattern(marketCondition) {
    const patterns = {
      volatile: "erratic",
      strong_bull: "aggressive",
      strong_bear: "defensive",
      bull: "steady",
      bear: "cautious",
      sideways: "patrol",
    };
    return patterns[marketCondition] || "steady";
  }

  /**
   * Determine enemy color based on market condition
   */
  static determineEnemyColor(marketCondition) {
    const colors = {
      volatile: 0xff6600, // Orange for volatility
      strong_bull: 0x00ff00, // Bright green for strong bull
      strong_bear: 0xff0000, // Bright red for strong bear
      bull: 0x90ee90, // Light green for bull
      bear: 0xffb6c1, // Light red for bear
      sideways: 0x2c3e50, // Dark gray for sideways
    };
    return colors[marketCondition] || 0x2c3e50;
  }

  /**
   * Generate educational feedback messages
   * @param {Object} analysis - Market analysis
   * @param {Object} gameResult - Game completion results
   * @returns {Array} Educational messages
   */
  static generateEducationalFeedback(analysis, gameResult) {
    const messages = [];
    const { trend, volatility, volume, marketCondition } = analysis;

    // Performance-based feedback
    if (gameResult.efficiency > 0.8) {
      messages.push(
        `Excellent efficiency! This ${
          analysis.timeframe
        } timeframe rewards ${analysis.characteristics.educationalFocus.toLowerCase()}.`
      );
    }

    // Market condition feedback
    if (marketCondition === "volatile" && gameResult.chainReactions > 2) {
      messages.push(
        "Great job capitalizing on volatility! In real trading, high volatility creates both opportunities and risks."
      );
    }

    if (trend.direction === "bullish" && gameResult.decisiveActions) {
      messages.push(
        "Your quick decision-making reflects successful bull market strategies!"
      );
    }

    if (trend.direction === "bearish" && gameResult.precision > 0.8) {
      messages.push(
        "Excellent precision! Bear markets require careful risk management and precise entry points."
      );
    }

    // Timeframe-specific feedback
    if (analysis.timeframe === "1m") {
      messages.push(
        "1-minute charts show market noise. Focus on learning basic patterns rather than trading signals."
      );
    } else if (analysis.timeframe === "1d") {
      messages.push(
        "Daily charts reveal the big picture. Your strategic approach shows understanding of long-term trends."
      );
    }

    return messages;
  }

  /**
   * Get special mechanics based on market analysis
   * @param {Object} analysis - Market analysis
   * @returns {Object} Special mechanics configuration
   */
  static getSpecialMechanics(analysis) {
    const mechanics = {};
    const { specialMechanics } = analysis.characteristics;

    if (specialMechanics.includes("support_resistance")) {
      mechanics.supportResistance = {
        enabled: true,
        levels: analysis.supportResistance,
        visualization: true,
      };
    }

    if (specialMechanics.includes("volume_analysis")) {
      mechanics.volumeAnalysis = {
        enabled: true,
        showVolumeIndicators: true,
        volumeBasedStructures: true,
      };
    }

    if (specialMechanics.includes("trend_following")) {
      mechanics.trendFollowing = {
        enabled: true,
        trendIndicators: true,
        momentumBonus: true,
      };
    }

    return mechanics;
  }
}
