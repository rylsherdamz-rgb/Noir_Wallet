module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // babel-preset-expo (SDK 54+) automatically injects the
    // react-native-worklets/reanimated plugin when reanimated is installed.
  }
}
