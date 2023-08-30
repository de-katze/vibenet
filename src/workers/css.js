self.addEventListener('message', (event) => {
    const { host } = event.data;

    switch (host) {
        default:
            const cssCode = 'html, head, body {background-color: transparent !important}';
            postMessage({ cssCode });
            break;
    }
})