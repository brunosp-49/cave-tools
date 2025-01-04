// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

// Add the SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Add SVG to the list of asset extensions handled by the resolver
config.resolver.assetExts = [...config.resolver.assetExts, "svg"];

// Wrap the config with Reanimated's Metro config
module.exports = wrapWithReanimatedMetroConfig(config);
