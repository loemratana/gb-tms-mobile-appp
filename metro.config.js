const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// Metro's package-exports resolution mis-resolves relative imports inside
// some packages (e.g. @tanstack/query-core's build/modern/index.js failing
// to find ./queryClient.js). Fall back to main/module fields instead.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' })