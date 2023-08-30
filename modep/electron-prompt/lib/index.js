const { join } = require('path');
const e = require('electron');
const { attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const v = require("@pyke/vibe")

const el = (id) => { if (e[id]) { return e[id]; }; let r = e.remote; if (r[id]) { return r[id]; } }

const a = el('app');
const bw = el('BrowserWindow');
const ipc = el('ipcMain');

v.setup(a)

module.exports = (options, parentWindow) => {
	return new Promise((resolve, reject) => {
		const id = `${Date.now()}-${Math.random()}`;

		const options_ = Object.assign(
			{
				title: 'Prompt',
				label: 'Please input a value:',
				value: null,
			},
			options || {},
		);

		let promptWindow = new bw({
			width: 400,
			height: 200,
			resizable: false,
			minimizable: false,
			fullscreenable: false,
			maximizable: false,
			parent: parentWindow,
			skipTaskbar: true,
			modal: true,
			title: options_.title,
			backgroundColor: '#00000000',
			show: false,
			center: true,
			autoHideMenuBar: true,
			titleBarStyle: 'hidden',
			titleBarOverlay: true,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: `${__dirname}/page/preload.js`,
			},
		});

		attachTitlebarToWindow(promptWindow)

		v.applyEffect(promptWindow, 'acrylic');

		promptWindow.setMenu(null);

		const getOptionsListener = event => {
			event.returnValue = JSON.stringify(options_);
		};

		const cleanup = () => {
			ipc.removeListener('prompt-get-options:' + id, getOptionsListener);
			ipc.removeListener('prompt-post-data:' + id, postDataListener);
			ipc.removeListener('prompt-error:' + id, errorListener);

			if (promptWindow) {
				promptWindow.destroy();
				promptWindow = null;
			}
		};

		const postDataListener = (event, value) => {
			resolve(value);
			event.returnValue = null;
			cleanup();
		};

		const unresponsiveListener = () => {
			reject(new Error('Window was unresponsive'));
			cleanup();
		};

		const errorListener = (event, message) => {
			reject(new Error(message));
			event.returnValue = null;
			cleanup();
		};

		ipc.on('prompt-get-options:' + id, getOptionsListener);
		ipc.on('prompt-post-data:' + id, postDataListener);
		ipc.on('prompt-error:' + id, errorListener);
		promptWindow.on('unresponsive', unresponsiveListener);

		promptWindow.on('closed', () => {
			promptWindow = null;
			cleanup();
			resolve(null);
		});

		promptWindow.loadFile(
			join(__dirname, 'page', 'prompt.html'),
			{ hash: id, search: `title=${options_.title}` },
		);

		promptWindow.once('ready-to-show', () => {
			promptWindow.setBackgroundColor('#00000000');
			promptWindow.show();
			v.applyEffect(promptWindow, 'unified-acrylic');
		});
	});
}