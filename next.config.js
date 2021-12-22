const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  experimental: {
    reactRoot: true,
    esmExternals: "true",
    concurrentFeatures: true,
  },
});
