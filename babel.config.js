module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Use the standard reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};
