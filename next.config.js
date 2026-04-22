const nextConfig = {
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
