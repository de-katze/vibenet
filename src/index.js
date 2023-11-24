const workers = {
    css: new Worker("workers/css.js"),
    history: new Worker("workers/history.js")
}

const title = document.getElementById("title");
/*
const tabGroup = document.querySelector("tab-group");

tabGroup.setDefaultTab({ title: "New Tab", src: "newtab/index.html", active: true, webviewAttributes: { preload: "tabPreload.js", plugins: true, nodeintegration: true } })

tabGroup.on("tab-added", (tab, tabGroup) => {
    tab.on("webview-dom-ready", (tab) => {
        const { host } = new URL(tab.webview.getURL())
        title.innerText = `${tab.webview.getTitle()} ―― VibeNet`
        tab.setTitle(tab.webview.getTitle())
        tab.setIcon(`https://icon.horse/icon/${host || tab.webview.getTitle()}`)

        document.getElementById("searchbar").value = tab.webview.getURL()

        addToHistory(tab.webview.getURL(), tab.webview.getTitle())

        workers.css.postMessage({ host });
        workers.css.onmessage = function(event) {
            const { cssCode } = event.data;
        
            tab.webview.insertCSS(cssCode);
        };        
    });

    tab.on("active", (tab) => {
        document.getElementById("searchbar").value = tab.webview.getURL()
    });
});

tabGroup.addTab()
*/

function searchBar() {
    const searchbar = document.getElementById("searchbar")

    searchbar.addEventListener("focus", (e) => { e.target.select() })

    searchbar.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault()
            const query = searchbar.value.trim();

            switch (determineType(query)) {
                case 1:
                    tabGroup.getActiveTab().webview.loadURL(query)
                    break
                case 2:
                    tabGroup.getActiveTab().webview.loadURL(`https://${query}`)
                    break
                case 3:
                    tabGroup.getActiveTab().webview.loadURL(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`)
                    break
                default:
                    break
            }
        }
    });
}

function determineType(input) {
    if (/^(https?):\/\/[^\s/$.?#].[^\s]*$/i.test(input)) {
        return 1;
    } else if (input.startsWith("newtab://")) {
        return 1;
    } else if (input.match(/\./g)?.length === 1 && !input.includes(" ")) {
        return 2;
    } else {
        return 3;
    }
}

const setFavicon = (host) => document.getElementById("searchbar").style.setProperty("--icon", `url("https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${host}&size=28")`);

function addToHistory(url, title) {
    workers.history.postMessage({ type: 'addToHistory', data: { url, title } });
}

// Function to remove from history
function removeFromHistory(index) {
    workers.history.postMessage({ type: 'removeFromHistory', data: { index } });
}

// Function to clear history
function clearHistory() {
    workers.history.postMessage({ type: 'clearHistory' });
}

workers.css.onmessage = function(event) {
    const { history } = event.data;

    // show history window
};