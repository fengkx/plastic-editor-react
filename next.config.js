const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer({
  experimental: {
    esmExternals: true,
    webpackBuildWorker: true,
  },
});
