const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
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
  // Get saved window position or use default
  const savedPosition = store.get('windowPosition');
  
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    x: savedPosition?.x,
    y: savedPosition?.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    // In development, load from Expo dev server
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built static files
    // This will need to be configured when we set up the build process
    mainWindow.loadURL('http://localhost:8081');
  }
};

const registerGlobalHotkey = () => {
  const hotkey = store.get('hotkey');
  
  const ret = globalShortcut.register(hotkey, () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
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

