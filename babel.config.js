module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [
      // Reanimated 4 split its babel plugin into `react-native-worklets`.
      // This plugin must be listed LAST.
      'react-native-worklets/plugin',
    ],
  };
};
