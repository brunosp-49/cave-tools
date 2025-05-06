// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Other plugins if you have any
      "react-native-reanimated/plugin",
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ],
  };
};
