const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('anukritiDesktop', Object.freeze({
  platform: () => ipcRenderer.invoke('anukriti:platform'),
  openBingResearch: query => ipcRenderer.invoke('anukriti:open-bing-research', query)
}));
