const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const { bingSearchUrl } = require('./security.cjs');

app.setName('Chayya');

function createWindow() {
  const window = new BrowserWindow({
    width: 1440, height: 940, minWidth: 1000, minHeight: 700,
    title: 'Chayya — The Shadow of Your Best Work',
    backgroundColor: '#f7f6f1',
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.cjs') }
  });
  window.loadURL(process.env.ANUKRITI_UI_URL || 'http://localhost:5173');
  window.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}
ipcMain.handle('anukriti:platform', () => process.platform);
ipcMain.handle('anukriti:open-bing-research', async (_, query) => {
  const url = bingSearchUrl(query);
  await shell.openExternal(url);
  return { opened: true };
});
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
