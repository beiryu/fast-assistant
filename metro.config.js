// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude electron directory from Metro bundler
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /electron\/.*/,
];

// Also exclude electron modules from being resolved
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

// Watch only specific directories
config.watchFolders = [__dirname];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'jsx', 'js', 'ts', 'tsx'];

// Handle WASM files for expo-sqlite
// Keep WASM as an asset extension so Metro treats it correctly
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;

