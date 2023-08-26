const { app, BrowserWindow, Menu } = require('electron');
const vibe = require('@pyke/vibe');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const { ElectronBlocker } = require("@cliqz/adblocker-electron")

vibe.setup(app);
setupTitlebar();

// https://github.com/GooseMod/OpenAsar/blob/main/src/cmdSwitches.js :)
`--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays=single-fullscreen,single-on-top,underlay --enable-features=EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation --disable-features=Vulkan --force_high_performance_gpu`.split(" ").forEach(flag => {
    app.commandLine.appendSwitch(flag)
})

Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: '←' }, { label: '↻' }, { label: '→' }, { label: 'Search Bar' }]));

app.whenReady().then(async () => {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 600,
        minWidth: 430,
        center: true,
        frame: false,
        backgroundColor: '#00000000',
        show: false,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: true,
        webPreferences: {
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false,
            preload: `${__dirname}/src/preload.js`,
            webviewTag: true,
            devTools: true,
        },
        icon: `src/netvibe@256x256.png`,
    });

    attachTitlebarToWindow(mainWindow);

    mainWindow.loadFile('src/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.setBackgroundColor('#212121');
        mainWindow.show();
        mainWindow.setBackgroundColor('#00000000');
        vibe.applyEffect(mainWindow, 'unified-acrylic');

        mainWindow.webContents.openDevTools();
    });

    await ElectronBlocker.fromLists(fetch, [
        'https://easylist.to/easylist/easylist.txt',
        'https://easylist.to/easylist/easyprivacy.txt',
        'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
        'https://easylist.to/easylist/fanboy-social.txt',
        'https://secure.fanboy.co.nz/fanboy-annoyance.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-others.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-mobile.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt'
    ]).then(blocker => {
        blocker.enableBlockingInSession(mainWindow.webContents.session)
    })
});