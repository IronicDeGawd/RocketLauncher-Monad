import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";

// Monad Testnet Chain Configuration
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com/",
    },
  },
  iconUrl: "/monad-icon.png", // Add monad icon to public folder
  iconBackground: "#000",
};

// Wagmi Configuration
export const config = getDefaultConfig({
  appName: "Rocket Candle",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from walletconnect.com
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz/"),
  },
  ssr: false, // We're using vanilla JS, not SSR
});

// Contract Addresses (deployed on Monad Testnet)
export const CONTRACTS = {
  ROCKET_CANDLE: "0x7e045E5591Cfd42208a08D0cd89218218cD4c8C5",
  ROCKET_FUEL: "0x7c1EeBF05f80D74B002dC8a8BDD72c44143c798f",
  ROCKET_CANDLE_SCORES: "0xB6D82716996DA655ab62A1D78859Ac86f318a132",
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:4000/api",
  ENDPOINTS: {
    SUBMIT_SCORE: "/submit-score",
    REWARD_FUEL: "/reward-fuel",
    PLAYER_SCORES: "/player-scores",
    LEADERBOARD: "/leaderboard",
    FUEL_BALANCE: "/fuel-balance",
  },
};
