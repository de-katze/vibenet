const history = [];

const title = document.getElementById("title");
const tabGroup = document.querySelector("tab-group");

tabGroup.setDefaultTab({ title: "New Tab", src: "newtab/index.html", active: true })

tabGroup.on("tab-added", (tab, tabGroup) => {
    tab.on("webview-dom-ready", (tab) => {
        title.innerText = `${tab.webview.getTitle()} ―― VibeNet`
        tab.setTitle(tab.webview.getTitle())
        tab.setIcon(`https://icon.horse/icon/${new URL(tab.webview.getURL()).host}`)

        document.getElementById("searchbar").value = tab.webview.getURL()

        addToHistory(tab.webview.getURL(), tab.webview.getTitle())
    });

    tab.on("active", (tab) => {
        document.getElementById("searchbar").value = tab.webview.getURL()
    });
});

tabGroup.addTab()

// Function to replace the 4th child with your element
function replaceFourthChild() {
    const menubar = document.getElementsByClassName("cet-menubar")[0];

    // Check if there are at least 4 children
    if (menubar && menubar.children.length >= 5) {
        menubar.children[0].addEventListener("click", (() => tabGroup.getActiveTab().webview.goBack()))
        menubar.children[1].addEventListener("click", (() => tabGroup.getActiveTab().webview.reload()))
        menubar.children[2].addEventListener("click", (() => tabGroup.getActiveTab().webview.goForward()))

        const sb = document.createElement("input")
        sb.type = "text"
        sb.classList.add("searchbar")
        sb.classList.add("cet-menubar-menu-button")
        sb.id = "searchbar"
        sb.placeholder = "Search"

        menubar.children[3].replaceWith(sb);

        searchBar()

        observer.disconnect()
    }
}

// Set up a MutationObserver to detect changes in the DOM
const observer = new MutationObserver(replaceFourthChild);

// Start observing changes in the DOM
observer.observe(document.body, { childList: true, subtree: true });

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
    const httpHttpsRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;

    if (httpHttpsRegex.test(input)) {
        return 1;
    } else if (input.startsWith("newtab://")) {
        return 1;
    } else if (input.match(/\./g)?.length === 1 && !input.includes(" ")) {
        return 2;
    } else {
        return 3;
    }
}

function addToHistory(url, title) {
    const timestamp = new Date();
    history.push({ url, title, timestamp });
}

function removeFromHistory(index) {
    if (confirm("Are you sure you want remove this from your history?") && index >= 0 && index < history.length) {
        history.splice(index, 1);
    }
}

function clearHistory() {
    if (confirm("Are you sure you want to clear your history?")) {
        history.length = 0;
    }
}