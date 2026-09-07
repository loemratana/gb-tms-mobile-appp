// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // react-hooks/immutability (React Compiler rule) doesn't recognize
    // react-native-reanimated's SharedValue as an intentionally-mutable type -
    // assigning `.value` is the documented, correct way to drive animations on
    // the UI thread, not a violation of React's immutability model.
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);
