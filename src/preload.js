const { ipcRenderer } = require('electron')

window.vibenet = {
	fetch: async (url) => await ipcRenderer.invoke('fetch', url),
}

window.prompt = (title, val) => ipcRenderer.sendSync('prompt', {title, val})