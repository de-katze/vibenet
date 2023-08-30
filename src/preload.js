const { CustomTitlebar, TitlebarColor } = require('custom-electron-titlebar')
const path = require('path')
const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
	new CustomTitlebar({
		backgroundColor: TitlebarColor.fromHex('#00000000'),
		menuTransparency: 0.4,
		icon: path.resolve('src', 'netvibe.svg'),
	})
})

contextBridge.exposeInMainWorld('vibenet', {
	prompt: async (title, value = "") => await ipcRenderer.invoke('prompt', title, value) || null,
	fetch: async (url) => await ipcRenderer.invoke('fetch', url),
	ipc: {
		newtab: (cb) => ipcRenderer.on("newtab", cb)
	}
})