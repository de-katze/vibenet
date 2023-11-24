const { ipcRenderer } = require('electron')

const params = new URLSearchParams(location.search)
const title = params.get("title") || "VibeNet Prompt"
const value = params.get("value") || ""

document.title = title;
document.getElementById("title").innerText = title;
document.getElementById("input").value = value

if (params.get("title") !== null) {
    ipcRenderer.invoke('prompt-ready');
}

window.submit = () => {
    ipcRenderer.send('prompt-response', document.getElementById('input').value);
    window.close()
}