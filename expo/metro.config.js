const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle web platform issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle Stripe web compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Exclude problematic modules for web
config.resolver.blockList = [
  // Block Stripe native modules on web
  /node_modules\/@stripe\/stripe-react-native\/.*\/Native.*\.js$/,
];

module.exports = config;
