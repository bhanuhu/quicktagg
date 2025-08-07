const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
// Get default Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Your custom Metro configuration
const customConfig = {};

// Merge with default config
const mergedConfig = mergeConfig(defaultConfig, customConfig);

// Wrap with Reanimated config
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
