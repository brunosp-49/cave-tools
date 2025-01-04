// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Other plugins if you have any
      "react-native-reanimated/plugin",
    ],
  };
};
