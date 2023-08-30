const { ipcRenderer } = require('electron');

let pid = null;
let po = null;

const e = (error) => {
    if (pid) {
        const errorMessage = error instanceof Error ? error.message : error;
        ipcRenderer.sendSync('prompt-error:' + pid, errorMessage);
    }
};

const c = () => {
    ipcRenderer.sendSync('prompt-post-data:' + pid, null);
};

const s = () => {
    const dataElement = document.querySelector('#data');
    const data = dataElement.value;
    ipcRenderer.sendSync('prompt-post-data:' + pid, data);
};

document.addEventListener('DOMContentLoaded', () => {
    pid = document.location.hash.replace('#', '');

    try {
        po = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + pid));
    } catch (error) {
        return e(error);
    }

    document.querySelector('#form').addEventListener('submit', s);
    document.querySelector('#cancel').addEventListener('click', c);

	document.getElementById("label").innerText = po.label
    
	const dataElement = document.createElement('input');
    dataElement.setAttribute('type', 'text')
	dataElement.setAttribute('id', 'data');

    dataElement.value = po.value;

    dataElement.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            c();
        }
    });

    dataElement.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('#ok').click();
        }
    });

    document.getElementById("input").append(dataElement);
    dataElement.focus();
    dataElement.select();
});

window.addEventListener('error', e);
document.getElementById('title').innerText = new URLSearchParams(location.search).get('title');