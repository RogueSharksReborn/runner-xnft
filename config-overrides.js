const { override } = require('customize-cra');

module.exports = override(
  // Provide fallbacks for node libraries:
  config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "path": require.resolve("path-browserify")
    };
    return config;
  },
);
