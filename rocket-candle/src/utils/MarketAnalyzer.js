/**
 * MarketAnalyzer - Analyzes market data to determine gameplay characteristics
 * Converts market conditions into meaningful game mechanics
 */
export class MarketAnalyzer {
  /**
   * Timeframe characteristics for educational gameplay
   */
  static TIMEFRAME_CHARACTERISTICS = {
    "1m": {
      difficultyMultiplier: 0.8,
      educationalFocus: "Basic market reading",
      blockHealth: 1,
      enemyIntelligence: "basic",
      specialMechanics: [],
      description: "High-frequency noise, good for learning basics",
    },

    "5m": {
      difficultyMultiplier: 0.9,
      educationalFocus: "Short-term patterns",
      blockHealth: 1,
      enemyIntelligence: "basic",
      specialMechanics: [],
      description: "Filtered noise, clearer signals",
    },

    "15m": {
      difficultyMultiplier: 1.0,
      educationalFocus: "Pattern recognition",
      blockHealth: 2,
      enemyIntelligence: "moderate",
      specialMechanics: ["support_resistance"],
      description: "Meaningful movements, pattern formation",
    },

    "1h": {
      difficultyMultiplier: 1.2,
      educationalFocus: "Trend analysis",
      blockHealth: 2,
      enemyIntelligence: "moderate",
      specialMechanics: ["support_resistance", "volume_analysis"],
      description: "Clear trends, institutional movements",
    },

    "4h": {
      difficultyMultiplier: 1.4,
      educationalFocus: "Market structure",
      blockHealth: 3,
      enemyIntelligence: "advanced",
      specialMechanics: [
        "support_resistance",
        "volume_analysis",
        "trend_following",
      ],
      description: "Major moves, swing trading signals",
    },

    "1d": {
      difficultyMultiplier: 1.5,
      educationalFocus: "Long-term trends",
      blockHealth: 3,
      enemyIntelligence: "advanced",
      specialMechanics: [
        "support_resistance",
        "volume_analysis",
        "trend_following",
      ],
      description: "Big picture, institutional decisions",
    },
  };

  /**
   * Analyze market data to determine game characteristics
   * @param {Array} candleData - Array of OHLC candlestick data
   * @param {string} timeframe - Market timeframe (1m, 5m, 15m, 1h, 4h, 1d)
   * @returns {Object} Market analysis for game generation
   */
  static analyzeMarketData(candleData, timeframe = "15m") {
    const analysis = {
      timeframe,
      characteristics:
        this.TIMEFRAME_CHARACTERISTICS[timeframe] ||
        this.TIMEFRAME_CHARACTERISTICS["15m"],
      trend: this.identifyTrend(candleData),
      volatility: this.calculateVolatility(candleData),
      volume: this.analyzeVolume(candleData),
      supportResistance: this.findSupportResistance(candleData),
      marketCondition: null,
      gameplayModifiers: {},
    };

    // Determine overall market condition
    analysis.marketCondition = this.determineMarketCondition(analysis);

    // Generate gameplay modifiers based on analysis
    analysis.gameplayModifiers = this.generateGameplayModifiers(analysis);

    return analysis;
  }

  /**
   * Identify overall trend direction
   * @param {Array} candleData - OHLC data array
   * @returns {Object} Trend analysis
   */
  static identifyTrend(candleData) {
    if (candleData.length < 3) return { direction: "sideways", strength: 0 };

    const first = candleData[0].close;
    const last = candleData[candleData.length - 1].close;
    const priceChange = (last - first) / first;

    // Calculate trend strength based on consistency
    let bullishCandles = 0;
    let bearishCandles = 0;
    candleData.forEach((candle) => {
      if (candle.close > candle.open) bullishCandles++;
      else bearishCandles++;
    });

    const consistency =
      Math.abs(bullishCandles - bearishCandles) / candleData.length;

    let direction = "sideways";
    if (priceChange > 0.02) direction = "bullish";
    else if (priceChange < -0.02) direction = "bearish";

    return {
      direction,
      strength: Math.abs(priceChange),
      consistency,
      priceChange,
    };
  }

  /**
   * Calculate market volatility
   * @param {Array} candleData - OHLC data array
   * @returns {Object} Volatility analysis
   */
  static calculateVolatility(candleData) {
    if (candleData.length === 0) return { level: "low", value: 0 };

    // Calculate average true range (ATR) as volatility measure
    let totalRange = 0;
    candleData.forEach((candle) => {
      const range = (candle.high - candle.low) / candle.close;
      totalRange += range;
    });

    const avgVolatility = totalRange / candleData.length;

    let level = "low";
    if (avgVolatility > 0.05) level = "extreme";
    else if (avgVolatility > 0.03) level = "high";
    else if (avgVolatility > 0.015) level = "medium";

    return {
      level,
      value: avgVolatility,
      isHighVolatility: avgVolatility > 0.03,
    };
  }

  /**
   * Analyze volume patterns
   * @param {Array} candleData - OHLC data array with volume
   * @returns {Object} Volume analysis
   */
  static analyzeVolume(candleData) {
    if (candleData.length === 0) return { level: "normal", trend: "stable" };

    const volumes = candleData.map((c) => c.volume || 100000);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    // Calculate volume trend
    const firstHalf = volumes.slice(0, Math.floor(volumes.length / 2));
    const secondHalf = volumes.slice(Math.floor(volumes.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const volumeChange = (secondAvg - firstAvg) / firstAvg;

    let level = "normal";
    if (avgVolume > volumes.length * 150000) level = "high";
    else if (avgVolume < volumes.length * 50000) level = "low";

    let trend = "stable";
    if (volumeChange > 0.2) trend = "increasing";
    else if (volumeChange < -0.2) trend = "decreasing";

    return {
      level,
      trend,
      avgVolume,
      volumeChange,
      isHighVolume: level === "high",
    };
  }

  /**
   * Find support and resistance levels
   * @param {Array} candleData - OHLC data array
   * @returns {Object} Support/resistance analysis
   */
  static findSupportResistance(candleData) {
    if (candleData.length < 3) return { support: null, resistance: null };

    const highs = candleData.map((c) => c.high);
    const lows = candleData.map((c) => c.low);

    // Simple support/resistance using highest/lowest points
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    const range = resistance - support;

    return {
      support,
      resistance,
      range,
      midpoint: (support + resistance) / 2,
    };
  }

  /**
   * Determine overall market condition
   * @param {Object} analysis - Market analysis object
   * @returns {string} Market condition
   */
  static determineMarketCondition(analysis) {
    const { trend, volatility } = analysis;

    if (volatility.level === "extreme") return "volatile";
    if (trend.direction === "bullish" && trend.strength > 0.05)
      return "strong_bull";
    if (trend.direction === "bearish" && trend.strength > 0.05)
      return "strong_bear";
    if (trend.direction === "bullish") return "bull";
    if (trend.direction === "bearish") return "bear";
    return "sideways";
  }

  /**
   * Generate gameplay modifiers based on market analysis
   * @param {Object} analysis - Market analysis object
   * @returns {Object} Gameplay modifiers
   */
  static generateGameplayModifiers(analysis) {
    const { timeframe, trend, volatility, volume, marketCondition } = analysis;
    const characteristics = analysis.characteristics;

    const modifiers = {
      // Block generation modifiers
      blockDensity: this.calculateBlockDensity(volatility, volume),
      blockHealth: characteristics.blockHealth,
      blockStability: this.calculateBlockStability(trend, volatility),

      // Enemy behavior modifiers
      enemySpeed: this.calculateEnemySpeed(marketCondition),
      enemyAggression: this.calculateEnemyAggression(volatility, trend),
      enemyIntelligence: characteristics.enemyIntelligence,

      // Scoring modifiers
      volatilityBonus: Math.round(volatility.value * 1000),
      trendBonus: Math.round(trend.strength * 500),
      volumeBonus: volume.isHighVolume ? 200 : 100,

      // Special mechanics
      chainReactionProbability: volatility.isHighVolatility ? 0.3 : 0.1,
      explosionRadius: volatility.isHighVolatility ? 70 : 60,

      // Educational context
      educationalTips: this.generateEducationalTips(analysis),
    };

    return modifiers;
  }

  /**
   * Calculate block density based on market conditions
   */
  static calculateBlockDensity(volatility, volume) {
    if (volatility.level === "extreme" || volume.isHighVolume) return "high";
    if (volatility.level === "high") return "medium";
    return "low";
  }

  /**
   * Calculate block stability (how connected blocks are)
   */
  static calculateBlockStability(trend, volatility) {
    if (trend.consistency > 0.7 && volatility.level === "low") return "high";
    if (volatility.level === "extreme") return "low";
    return "medium";
  }

  /**
   * Calculate enemy speed based on market condition
   */
  static calculateEnemySpeed(marketCondition) {
    const speedMap = {
      volatile: 1.5,
      strong_bull: 1.3,
      strong_bear: 0.7,
      bull: 1.1,
      bear: 0.9,
      sideways: 1.0,
    };
    return speedMap[marketCondition] || 1.0;
  }

  /**
   * Calculate enemy aggression level
   */
  static calculateEnemyAggression(volatility, trend) {
    if (volatility.level === "extreme") return "high";
    if (trend.strength > 0.05) return "medium";
    return "low";
  }

  /**
   * Generate educational tips based on market analysis
   */
  static generateEducationalTips(analysis) {
    const tips = [];
    const { trend, volatility, volume, marketCondition } = analysis;

    if (volatility.isHighVolatility) {
      tips.push("High volatility creates opportunities for chain reactions!");
    }

    if (trend.direction === "bullish" && trend.consistency > 0.6) {
      tips.push("Strong bull trend - decisive action often pays off!");
    }

    if (trend.direction === "bearish" && volatility.level === "low") {
      tips.push("Bear market with low volatility - precision is key!");
    }

    if (volume.isHighVolume) {
      tips.push("High volume indicates strong institutional interest!");
    }

    if (marketCondition === "sideways") {
      tips.push("Sideways market - look for breakout opportunities!");
    }

    return tips;
  }
}
