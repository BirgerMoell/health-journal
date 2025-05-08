const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Define the service name for secure storage
// Note: We're not using keytar initially since it requires node-gyp which can be complex to set up
// We'll use a simple encryption method for now
const SERVICE = 'personal-health-record-ai';

// Simple encryption/decryption for API key storage
// In production, replace with proper encryption or keytar
function encrypt(text) {
  // This is a placeholder - use a proper encryption library in production
  return Buffer.from(text).toString('base64');
}

function decrypt(text) {
  // This is a placeholder - use a proper decryption library in production
  return Buffer.from(text, 'base64').toString('utf8');
}

function setupIPCHandlers(mainWindow) {
  // Handle file system operations
  ipcMain.handle('save-to-file-system', async (event, content) => {
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'journal-data.json');
      await fs.promises.writeFile(filePath, JSON.stringify(content));
      return true;
    } catch (error) {
      console.error('Error saving to file system:', error);
      return false;
    }
  });

  ipcMain.handle('load-from-file-system', async (event) => {
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'journal-data.json');
      
      if (fs.existsSync(filePath)) {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading from file system:', error);
      return null;
    }
  });

  // Handle API key storage (simplified version)
  ipcMain.handle('get-api-key', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, '.api-key');
      
      if (fs.existsSync(filePath)) {
        const encryptedKey = await fs.promises.readFile(filePath, 'utf8');
        return decrypt(encryptedKey);
      }
      return null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  });

  ipcMain.handle('set-api-key', async (event, key) => {
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, '.api-key');
      const encryptedKey = encrypt(key);
      
      await fs.promises.writeFile(filePath, encryptedKey);
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
}

module.exports = { setupIPCHandlers };