setTimeout(() => {
    const enabledCheckbox = document.getElementById('enabledCheckbox');
    enabledCheckbox.addEventListener('click', async () => {
        chrome.storage.sync.set({enabled: enabledCheckbox.checked});
    })
}, 10);

chrome.storage.sync.get('enabled', ({ enabled }) => {
    document.getElementById('enabledCheckbox').checked = enabled;
})
