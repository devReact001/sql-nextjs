const nextConfig = {
  env: {
    NEXT_PUBLIC_AI_ENABLED: process.env.ANTHROPIC_API_KEY ? "true" : "",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      kerberos: false,
      snappy: false,
    };
    return config;
  },
};

module.exports = nextConfig;
