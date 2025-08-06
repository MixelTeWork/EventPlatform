import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  rewrites: async () => [{
    source: "/api/:path*",
    destination: "http://localhost:5000/api/:path*"
  }],
  webpack: (config, options) =>
  {
    const { isServer } = options;
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve("url-loader"),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve("file-loader"),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });

    return config;
  },
  turbopack: {
    rules: {
      "*.mp3": {
        loaders: [require.resolve("url-loader")],
        as: "*.js"
      }
    }
  },
};

export default nextConfig;
