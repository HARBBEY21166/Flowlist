/**
 * Babel configuration for Expo + react-native-reanimated
 *
 * The Reanimated plugin must be listed last in the plugins array.
 */
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Add other plugins here if needed. 'react-native-reanimated/plugin' must be last.
    'react-native-reanimated/plugin'
  ],
};
