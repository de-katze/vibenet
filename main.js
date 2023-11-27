require("v8-compile-cache");
const { app, BrowserWindow, ipcMain, webContents } = require("electron");
const { ElectronBlocker } = require("@cliqz/adblocker-electron")
const { execSync } = require("child_process");
const contextMenu = require("electron-context-menu");

const getPrefType = () => {
    const status = execSync("WMIC Path Win32_Battery Get BatteryStatus").toString()
    const isBattery = status.includes("1") || status.includes("4") || status.includes("5")
    return isBattery ? "battery" : "perf";
}

const presets = {
    "perf": `--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays=single-fullscreen,single-on-top,underlay --enable-features=EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation --disable-features=Vulkan --force_high_performance_gpu`, // Performance
    "battery": "--enable-features=TurnOffStreamingMediaCachingOnBattery --force_low_power_gpu" // Known to have better battery life for Chromium?
};

let c = {};
for (const x of (getPrefType()).split(",").reduce((a, x) => a.concat(presets[x]?.split(" ")).split(" "))) {
    if (!x) continue;
    const [k, v] = x.split("=");

    (c[k] = c[k] || []).push(v);
}

for (const k in c) {
    app.commandLine.appendSwitch(k.replace("--", ""), c[k].join(","));
}

app.whenReady().then(async () => {
    const mainWindow = new BrowserWindow({
        center: true,
        frame: true,
        show: false,
        autoHideMenuBar: true,
        transparent: true,
        backgroundMaterial: "acrylic",
        webPreferences: {
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false,
            preload: `${__dirname}/src/preload.js`,
            webviewTag: true,
            devTools: true,
            spellcheck: true
        },
        icon: `src/netvibe@256x256.png`
    });

    await ElectronBlocker.fromLists(fetch, ["https://easylist.to/easylist/easylist.txt", "https://easylist.to/easylist/easyprivacy.txt", "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt", "https://easylist.to/easylist/fanboy-social.txt", "https://secure.fanboy.co.nz/fanboy-annoyance.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-others.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-mobile.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt", "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt"]).then(blocker => {
        blocker.enableBlockingInSession(mainWindow.webContents.session)
    })

    mainWindow.loadFile("src/index.html");

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();

        mainWindow.webContents.openDevTools();
    });

    var promptResponse, promptWindow;
    ipcMain.on("prompt", function (eventRet, arg) {
        promptResponse = null
        promptWindow = new BrowserWindow({
            width: 500,
            height: 300,
            show: false,
            resizable: false,
            movable: false,
            alwaysOnTop: true,
            frame: false,
            webPreferences: { sandbox: false, nodeIntegration: true, contextIsolation: false, spellcheck: true, devTools: false }
        })

        promptWindow.loadFile("src/prompt/index.html")
        promptWindow.webContents.executeJavaScript(`location.href = \`\${location.href}?title=${arg.title || ""}&value=${arg.val || ""}\``)

        promptWindow.on("closed", function () {
            eventRet.returnValue = promptResponse
            promptWindow = null
        })
    })

    ipcMain.on("prompt-response", function (event, arg) {
        if (arg === "") { arg = null }
        promptResponse = arg
    })

    ipcMain.handle("prompt-ready", async () => {
        return promptWindow.show()
    })

    ipcMain.on('webview-Setup', (event) => {
        contextMenu({ window: webContents.fromFrame(event.senderFrame) });
    });
});