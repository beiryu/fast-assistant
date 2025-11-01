const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  platform: process.platform,
  // Window control methods
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  onWindowVisibilityChange: (callback) => {
    ipcRenderer.on('window-visibility-changed', (_, isVisible) => {
      callback(isVisible);
    });
  },
});

