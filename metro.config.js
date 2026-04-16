// Default Expo Metro config. Exposed so we can add custom asset/source
// extensions later (e.g. if we ship Lottie/JSON animations for empty states).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
