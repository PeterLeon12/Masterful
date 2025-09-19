module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@/components': './components',
            '@/utils': './utils',
            '@/services': './services',
            '@/constants': './constants',
            '@/contexts': './contexts',
            '@/hooks': './hooks',
            '@/config': './config',
          },
        },
      ],
      // Note: react-native-reanimated plugin removed as package is not installed
      // 'react-native-reanimated/plugin',
    ],
  };
};
