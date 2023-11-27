const { ipcRenderer } = require('electron');

ipcRenderer.send('webview-Setup');

window.prompt = (title, val) => ipcRenderer.sendSync('prompt', {title, val})