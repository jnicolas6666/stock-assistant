/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // yahoo-finance2 includes test files that reference Deno/std packages
    // which don't exist in Node. Exclude them from the bundle.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@std/testing/mock": false,
      "@std/testing/bdd": false,
      "@gadicc/fetch-mock-cache/runtimes/deno.ts": false,
      "@gadicc/fetch-mock-cache/stores/fs.ts": false,
    };
    return config;
  },
};
module.exports = nextConfig;
