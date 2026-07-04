const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Resolve wa-sqlite.wasm issue on web by providing an empty module
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes("wa-sqlite") && platform === "web") {
    return {
      filePath: path.resolve(__dirname, "shims/empty.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
