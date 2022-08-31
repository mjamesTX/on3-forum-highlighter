(async () => {
    const src = chrome.runtime.getURL('src/content-script-main.js');
    const contentScript = await import(src);
    contentScript.main();
})();
