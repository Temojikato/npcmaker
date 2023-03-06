module.exports = {
	webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
	transpilePackages: ["openai"],
	distDir: "nextjs",
	env: {
		FIREBASE_PROJECT_ID: "npcmaker-62152",
	},
	experimental: {
		sprFlushToDisk: false,
	},
};
