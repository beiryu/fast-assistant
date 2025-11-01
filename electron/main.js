const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    hotkey: 'CommandOrControl+Shift+T',
    windowPosition: { x: undefined, y: undefined },
  },
});

let mainWindow = null;

const createWindow = () => {
  // Get saved window position or use default (bottom center)
  const savedPosition = store.get('windowPosition');
  
  // Calculate bottom center position if no saved position
  let windowX, windowY;
  if (savedPosition?.x !== undefined && savedPosition?.y !== undefined) {
    windowX = savedPosition.x;
    windowY = savedPosition.y;
  } else {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const windowWidth = 500;
    const windowHeight = 600;
    windowX = Math.round((screenWidth - windowWidth) / 2); // Center horizontally
    windowY = Math.round(screenHeight - windowHeight - 40); // Bottom with 40px margin
  }
  
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    x: windowX,
    y: windowY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false, // Don't show until ready (for faster appearance)
    backgroundColor: '#00000000', // Transparent background
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Optimize for performance
      enableRemoteModule: false,
      sandbox: false, // Needed for preload script
      backgroundThrottling: false, // Keep running when backgrounded
    },
  });

  // Save window position on move
  mainWindow.on('moved', () => {
    const position = mainWindow.getPosition();
    store.set('windowPosition', { x: position[0], y: position[1] });
  });

  // Hide window on blur (optional - can be removed if needed)
  mainWindow.on('blur', () => {
    // Uncomment if you want auto-hide on blur
    // mainWindow.hide();
  });

  // Optimize window show performance
  mainWindow.once('ready-to-show', () => {
    // Window is ready, but we'll show it on demand via hotkey
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    // In development, load from Expo dev server
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built static files
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }
};

const registerGlobalHotkey = () => {
  const hotkey = store.get('hotkey');
  
  const ret = globalShortcut.register(hotkey, () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        // Notify renderer
        mainWindow.webContents.send('window-visibility-changed', false);
      } else {
        // Optimize show performance - use showInactive then focus for faster appearance
        mainWindow.showInactive();
        // Focus immediately for <200ms target
        setTimeout(() => {
          mainWindow.focus();
          // Notify renderer
          mainWindow.webContents.send('window-visibility-changed', true);
        }, 0);
      }
    } else {
      createWindow();
    }
  });

  if (!ret) {
    console.error('Hotkey registration failed:', hotkey);
  } else {
    console.log('Global hotkey registered:', hotkey);
  }
};

app.whenReady().then(() => {
  createWindow();
  registerGlobalHotkey();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on macOS - keep app running
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers for settings
ipcMain.handle('get-setting', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  
  // If hotkey changed, re-register
  if (key === 'hotkey') {
    globalShortcut.unregisterAll();
    registerGlobalHotkey();
  }
});

ipcMain.handle('get-all-settings', () => {
  return store.store;
});

// IPC handler for window control
ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.webContents.send('window-visibility-changed', false);
  }
});

