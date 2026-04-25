const nextConfig = {
  env: {
    NEXT_PUBLIC_AI_ENABLED: process.env.ANTHROPIC_API_KEY ? "true" : "",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      kerberos: false,
      snappy: false,
      "aws-crt": false,
      "mongodb-client-encryption": false,
    };
    return config;
  },
  serverExternalPackages: ["cassandra-driver", "neo4j-driver"],
};

module.exports = nextConfig;
