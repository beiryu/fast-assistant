const path = require('path');

module.exports = {
  appId: 'com.fastassistant.app',
  productName: 'QuickTranslate',
  // Override package.json main field for the built app's package.json
  extraMetadata: {
    main: 'electron/main.js',
  },
  directories: {
    output: 'dist-electron',
    buildResources: 'build',
  },
  // Only include what's needed - exclude source files and Expo dependencies
  files: [
    'electron/**/*',
    'dist/**/*',
    // Include electron-store and its dependencies
    // Note: electron-builder auto-detects dependencies from package.json,
    // but we explicitly include what we need for Electron
    {
      from: 'node_modules/electron-store',
      to: 'node_modules/electron-store',
      filter: ['**/*'],
    },
    {
      from: 'node_modules/conf',
      to: 'node_modules/conf',
      filter: ['**/*'],
    },
    // Exclude everything else - but do this more carefully
    // Don't exclude all node_modules, just exclude specific unwanted ones
    '!node_modules/@expo/**/*',
    '!node_modules/expo/**/*',
    '!node_modules/@react-native/**/*',
    '!node_modules/react-native/**/*',
    '!node_modules/react/**/*',
    '!node_modules/react-dom/**/*',
    '!node_modules/metro/**/*',
    '!node_modules/@tanstack/**/*',
    '!node_modules/@supabase/**/*',
    '!node_modules/@react-navigation/**/*',
    '!node_modules/zustand/**/*',
    '!node_modules/nativewind/**/*',
    // Exclude source files
    '!app/**/*',
    '!components/**/*',
    '!lib/**/*',
    '!stores/**/*',
    '!hooks/**/*',
    '!constants/**/*',
    '!types/**/*',
    '!assets/**/*',
    '!documents/**/*',
    '!supabase/**/*',
    '!scripts/**/*',
    // Exclude development files
    '!**/*.{map,log,md}',
    '!*.config.js',
    '!*.config.ts',
    '!tsconfig.json',
    '!eslint.config.js',
    '!tailwind.config.js',
    '!global.css',
    '!.env*',
    '!.git/**/*',
  ],
  // Hook to fix package.json in the built app
  afterPack: async (context) => {
    const fs = require('fs');
    const packageJsonPath = path.join(context.appOutDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.main = 'electron/main.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  },
  mac: {
    category: 'public.app-category.productivity',
    target: 'dmg',
    icon: 'assets/images/icon.png',
  },
  win: {
    target: 'nsis',
    icon: 'assets/images/icon.png',
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/images/icon.png',
  },
};
