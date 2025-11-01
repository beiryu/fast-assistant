module.exports = {
  appId: 'com.fastassistant.app',
  productName: 'QuickTranslate',
  main: 'electron/main.js',
  directories: {
    output: 'dist-electron',
  },
  files: [
    'electron/**/*',
    'app/**/*',
    'components/**/*',
    'lib/**/*',
    'stores/**/*',
    'assets/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  mac: {
    category: 'public.app-category.productivity',
    target: 'dmg',
  },
  win: {
    target: 'nsis',
  },
  linux: {
    target: 'AppImage',
  },
};

