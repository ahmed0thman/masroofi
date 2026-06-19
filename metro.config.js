// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer'),
};

// whisper.rn@0.6.0 has a broken "exports" map: the "./*" subpath pattern is
// too greedy and redirects ALL subpaths (including internal ones like
// lib/commonjs/...) through itself.
// Additionally, the "react-native" condition maps index.js to src/index.js
// but the actual file is src/index.ts — Metro's exports resolution doesn't
// rewrite extensions, so it falls through to the old "lib/module/" build
// which uses a deprecated native module API that no longer exists.
//
// We intercept all whisper.rn/* imports and resolve them directly to the
// src/ directory (the modern JSI-based build).
const whisperRtDir = path.join(__dirname, 'node_modules', 'whisper.rn');

const resolveWhisperSubpath = (moduleName) => {
  // e.g. "whisper.rn/realtime-transcription/index.js" -> "realtime-transcription/index"
  // e.g. "whisper.rn/index.js" -> "index"
  const subpath = moduleName.slice('whisper.rn/'.length).replace(/\.js$/, '');

  // Try src/<subpath>.ts, then src/<subpath>.tsx, then src/<subpath>/index.ts
  const candidates = [
    path.join(whisperRtDir, 'src', subpath + '.ts'),
    path.join(whisperRtDir, 'src', subpath + '.tsx'),
    path.join(whisperRtDir, 'src', subpath, 'index.ts'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('whisper.rn/')) {
    const filePath = resolveWhisperSubpath(moduleName);
    if (filePath) {
      return { filePath, type: 'sourceFile' };
    }
  }
  if (typeof resolveRequest === 'function') {
    return resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config);
