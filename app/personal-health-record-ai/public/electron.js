const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

let isDev;

async function initializeIsDev() {
  const electronIsDev = await import('electron-is-dev');
  isDev = electronIsDev.default;
}

async function createWindow() {
  await initializeIsDev();

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Example of handling "server-side" operations
ipcMain.handle('perform-calculation', async (event, ...args) => {
  // Perform some CPU-intensive or system-level operation here
  return 'result';
});