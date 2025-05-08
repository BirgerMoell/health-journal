const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // For local file system access
  saveToFileSystem: (content) => ipcRenderer.invoke('save-to-file-system', content),
  loadFromFileSystem: () => ipcRenderer.invoke('load-from-file-system'),
  
  // For local model operations (if needed)
  loadLocalModel: (modelPath) => ipcRenderer.invoke('load-local-model', modelPath),
  
  // For API key storage in a secure way
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  
  // For app version info
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});