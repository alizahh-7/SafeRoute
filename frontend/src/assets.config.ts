// frontend/src/assets.config.ts

import umaima from "./images/umaima.png";
import alizah from "./images/alizah.png";
import zunairah from "./images/zunairah.png";
import shazia from "./images/shazia.png";

export const ASSETS = {
  // 3D Scene Configs
  hero3D: {
    enabled: true,
  },

  // Placeholders for future Gemini generated media
  images: {
    problemSection:
      "https://images.unsplash.com/photo-1549399434-2e21b8c26f09?auto=format&fit=crop&q=80&w=800",

    historicalData:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400",

    weatherTraffic:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400",

    aiVision:
      "https://images.unsplash.com/photo-1518174542385-b9f0ed23fb39?auto=format&fit=crop&q=80&w=400",

    newsAdvisory:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400",
  },

  // Team Photos
  team: {
    umaima,
    alizah,
    zunairah,
    shazia,
  },
};