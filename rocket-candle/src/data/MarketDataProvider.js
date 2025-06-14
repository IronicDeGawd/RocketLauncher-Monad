/**
 * MarketDataProvider - Provides candlestick market data for game levels
 * Supports both static (fake) data and live market data integration
 */
export class MarketDataProvider {
  /**
   * Static configuration for game levels
   */
  static LEVEL_CONFIGURATIONS = [
    {
      name: "Bull Market Basics",
      difficulty: "Easy",
      candleCount: 8,
      marketParams: { trend: "up", volatility: "low" },
    },
    {
      name: "Bear Market Challenge",
      difficulty: "Easy",
      candleCount: 9,
      marketParams: { trend: "down", volatility: "low" },
    },
    {
      name: "Sideways Consolidation",
      difficulty: "Medium",
      candleCount: 10,
      marketParams: { trend: "sideways", volatility: "medium" },
    },
    {
      name: "Volatile Bull Run",
      difficulty: "Medium",
      candleCount: 11,
      marketParams: { trend: "up", volatility: "high" },
    },
    {
      name: "Crash and Burn",
      difficulty: "Hard",
      candleCount: 11,
      marketParams: { trend: "down", volatility: "high" },
    },
    {
      name: "Market Chaos",
      difficulty: "Hard",
      candleCount: 11,
      marketParams: { trend: "mixed", volatility: "high" },
    },
    {
      name: "Trading Apocalypse",
      difficulty: "Extreme",
      candleCount: 11,
      marketParams: { trend: "mixed", volatility: "extreme" },
    },
  ];

  /**
   * Generate all game levels with candlestick data
   * @param {boolean} useLiveData - Whether to use live market data (future feature)
   * @returns {Array} Array of level objects with candlestick data
   */
  static generateGameLevels(useLiveData = false) {
    console.log(
      `📊 Generating ${this.LEVEL_CONFIGURATIONS.length} game levels`
    );

    return this.LEVEL_CONFIGURATIONS.map((config, index) => ({
      ...config,
      levelIndex: index,
      candlesticks: useLiveData
        ? this.fetchLiveMarketData(config) // Future implementation
        : this.generateStaticOHLCData(config.candleCount, config.marketParams),
    }));
  }

  /**
   * Generate static OHLC candlestick data for a level
   * @param {number} count - Number of candlesticks to generate
   * @param {object} params - Market parameters (trend, volatility)
   * @returns {Array} Array of OHLC candlestick objects
   */
  static generateStaticOHLCData(count, params) {
    const candlesticks = [];
    let basePrice = 100; // Starting price
    const { trend, volatility } = params;

    // Set volatility multipliers
    const volatilityMultiplier =
      {
        low: 0.5,
        medium: 1.0,
        high: 1.8,
        extreme: 2.5,
      }[volatility] || 1.0;

    // Set trend direction
    const trendMultiplier =
      {
        up: 0.3,
        down: -0.3,
        sideways: 0,
        mixed: 0,
      }[trend] || 0;

    for (let i = 0; i < count; i++) {
      // Calculate trend influence
      const trendInfluence =
        trend === "mixed"
          ? Math.sin(i * 0.5) * 0.4 // Sinusoidal for mixed
          : trendMultiplier;

      // Generate random price movement
      const priceChange =
        (Math.random() - 0.5) * 8 * volatilityMultiplier + trendInfluence;

      basePrice = Math.max(20, basePrice + priceChange); // Prevent prices below 20

      // Generate OHLC values
      const open = basePrice;
      const volatilityRange = Math.random() * 5 * volatilityMultiplier + 1;

      // Determine if candle is bullish or bearish
      const isBullish = Math.random() > 0.5;
      const direction = isBullish ? 1 : -1;

      const close = open + Math.random() * 4 * direction * volatilityMultiplier;
      const high = Math.max(open, close) + Math.random() * volatilityRange;
      const low = Math.min(open, close) - Math.random() * volatilityRange;

      candlesticks.push({
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        isBullish: close > open,
        volume: Math.floor(Math.random() * 1000000) + 100000, // Fake volume
      });

      basePrice = close; // Next candle starts where this one ended
    }

    return candlesticks;
  }

  /**
   * Get level configuration by index
   * @param {number} levelIndex - Index of the level (0-based)
   * @returns {object} Level configuration object
   */
  static getLevelConfig(levelIndex) {
    if (levelIndex < 0 || levelIndex >= this.LEVEL_CONFIGURATIONS.length) {
      console.warn(`⚠️ Invalid level index: ${levelIndex}`);
      return this.LEVEL_CONFIGURATIONS[0]; // Return first level as fallback
    }
    return this.LEVEL_CONFIGURATIONS[levelIndex];
  }

  /**
   * Get total number of available levels
   * @returns {number} Total number of levels
   */
  static getTotalLevels() {
    return this.LEVEL_CONFIGURATIONS.length;
  }

  /**
   * Generate candlestick data for a specific level
   * @param {number} levelIndex - Index of the level
   * @param {boolean} useLiveData - Whether to use live data
   * @returns {Array} Candlestick data for the level
   */
  static generateLevelData(levelIndex, useLiveData = false) {
    const config = this.getLevelConfig(levelIndex);

    if (useLiveData) {
      return this.fetchLiveMarketData(config);
    } else {
      return this.generateStaticOHLCData(
        config.candleCount,
        config.marketParams
      );
    }
  }

  /**
   * Fetch live market data (Future implementation)
   * This method will be implemented when integrating with real market APIs
   * @param {object} config - Level configuration
   * @returns {Promise<Array>} Promise resolving to candlestick data
   */
  static async fetchLiveMarketData(config) {
    console.log(`🔄 Live market data not implemented yet for ${config.name}`);

    // For now, return static data as fallback
    return this.generateStaticOHLCData(config.candleCount, config.marketParams);

    // Future implementation will look like:
    /*
    try {
      const response = await fetch(`/api/market-data?timeframe=15m&count=${config.candleCount}`);
      const data = await response.json();
      return this.normalizeMarketData(data, config);
    } catch (error) {
      console.error('Failed to fetch live market data:', error);
      // Fallback to static data
      return this.generateStaticOHLCData(config.candleCount, config.marketParams);
    }
    */
  }

  /**
   * Normalize live market data to game format (Future implementation)
   * @param {Array} rawData - Raw market data from API
   * @param {object} config - Level configuration
   * @returns {Array} Normalized candlestick data
   */
  static normalizeMarketData(rawData, config) {
    // Future implementation for converting real market data
    // to game-compatible OHLC format
    console.log(`🔄 Market data normalization not implemented yet`);
    return rawData;
  }

  /**
   * Validate candlestick data format
   * @param {Array} candlesticks - Array of candlestick objects
   * @returns {boolean} Whether data is valid
   */
  static validateCandlestickData(candlesticks) {
    if (!Array.isArray(candlesticks) || candlesticks.length === 0) {
      return false;
    }

    return candlesticks.every(
      (candle) =>
        candle.hasOwnProperty("open") &&
        candle.hasOwnProperty("high") &&
        candle.hasOwnProperty("low") &&
        candle.hasOwnProperty("close") &&
        typeof candle.open === "number" &&
        typeof candle.high === "number" &&
        typeof candle.low === "number" &&
        typeof candle.close === "number" &&
        candle.high >= Math.max(candle.open, candle.close) &&
        candle.low <= Math.min(candle.open, candle.close)
    );
  }

  /**
   * Get market analysis for educational purposes
   * @param {Array} candlesticks - Candlestick data
   * @returns {object} Market analysis object
   */
  static getMarketAnalysis(candlesticks) {
    if (!this.validateCandlestickData(candlesticks)) {
      return null;
    }

    const first = candlesticks[0];
    const last = candlesticks[candlesticks.length - 1];
    const priceChange = ((last.close - first.open) / first.open) * 100;

    let trend = "sideways";
    if (priceChange > 2) trend = "bullish";
    else if (priceChange < -2) trend = "bearish";

    // Calculate average volatility
    const avgVolatility =
      candlesticks.reduce((sum, candle) => {
        return sum + (candle.high - candle.low) / candle.close;
      }, 0) / candlesticks.length;

    let volatilityLevel = "low";
    if (avgVolatility > 0.05) volatilityLevel = "extreme";
    else if (avgVolatility > 0.03) volatilityLevel = "high";
    else if (avgVolatility > 0.015) volatilityLevel = "medium";

    return {
      trend,
      priceChange: Math.round(priceChange * 100) / 100,
      volatilityLevel,
      avgVolatility: Math.round(avgVolatility * 10000) / 100, // Convert to percentage
      candleCount: candlesticks.length,
    };
  }
}
