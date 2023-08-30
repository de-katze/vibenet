{
    if (process.platform !== 'win32' || require("os").release().split(".")[2] > 17762) {
        throw new Error(`You must be on Windows 10 1809 [17763] or later to use NetVibe.`)
    }
}

require('v8-compile-cache');
const { app, BrowserWindow, Menu, ipcMain, components } = require('electron');
const vibe = require('@pyke/vibe');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const prompt = require('./modep/electron-prompt');
const package = require("./package.json")

vibe.setup(app);
setupTitlebar();

/* https://github.com/GooseMod/OpenAsar/blob/main/src/cmdSwitches.js#L5
`--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays=single-fullscreen,single-on-top,underlay --enable-features=EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation --disable-features=Vulkan --force_high_performance_gpu`.split(" ").forEach(flag => {
    app.commandLine.appendSwitch(flag)
})
*/

Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "⚷" }, { label: '←' }, { label: '↻' }, { label: '→' }, { label: 'Search Bar' }]));

app.whenReady().then(async () => {
    await components.whenReady();
    let cs = components.status()
    Object.keys(cs).forEach(component => {
        console.log(`Component Ready: ${cs[component].name} @ ${cs[component].version} | ${cs[component].status}`)
    })

    const mainWindow = await createWindow()

    await (require("@cliqz/adblocker-electron").ElectronBlocker).fromLists(fetch, ['https://easylist.to/easylist/easylist.txt', 'https://easylist.to/easylist/easyprivacy.txt', 'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt', 'https://easylist.to/easylist/fanboy-social.txt', 'https://secure.fanboy.co.nz/fanboy-annoyance.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-others.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-mobile.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt', 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt']).then(blocker => {
        blocker.enableBlockingInSession(mainWindow.webContents.session)
        console.log(`Component Ready: Adblocker @ ${package.dependencies['@cliqz/adblocker-electron']} | enabled`)
    })

    attachTitlebarToWindow(mainWindow);
    mainWindow.loadFile('src/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.setBackgroundColor('#00000000');
        mainWindow.show();
        vibe.applyEffect(mainWindow, 'unified-acrylic');

        mainWindow.webContents.openDevTools();
    });

    ipcMain.handle('prompt', async (event, label = "Please input a value:", value = "") => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        return await prompt({
            title: new URL(webContents.getURL()).host || "Prompt",
            label,
            value,
        }, win)
    })

    ipcMain.handle('fetch', async (e, url) => {
        const data = await fetch(url)
        const text = await data.text()
        return text
    })
});

async function createWindow() {
    return new BrowserWindow({ width: 600, height: 600, minWidth: 430, center: true, frame: false, backgroundColor: '#00000000', show: false, autoHideMenuBar: true, titleBarStyle: 'hidden', titleBarOverlay: true, webPreferences: { sandbox: false, nodeIntegration: true, contextIsolation: true, preload: `${__dirname}/src/preload.js`, webviewTag: true, devTools: true, spellcheck: true }, icon: `src/netvibe@256x256.png` });
}