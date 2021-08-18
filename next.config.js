const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  experimental: {
    reactRoot: true,
    reactMode: "conurrent",
    esmExternals: "true",
  },
});
