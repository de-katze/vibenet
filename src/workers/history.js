const history = [];

self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    if (type === 'getHistory') {
        postMessage({history})
    } else if (type === 'addToHistory') {
        const { url, title } = data;
        const timestamp = Date.now();
        history.push({ url, title, timestamp });
    } else if (type === 'removeFromHistory') {
        const { index } = data;
        if (confirm("Are you sure you want to remove this from your history?") && index >= 0 && index < history.length) {
            history.splice(index, 1);
        }
    } else if (type === 'clearHistory') {
        if (confirm("Are you sure you want to clear your history?")) {
            history.length = 0;
        }
    }
});
