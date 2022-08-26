setTimeout(() => {
    const enabledCheckbox = document.getElementById('enabledCheckbox');
    enabledCheckbox.addEventListener('click', () => {
        chrome.storage.local.set({ enabled: enabledCheckbox.checked });
    })
}, 10);

chrome.storage.local.get('enabled', ({ enabled }) => {
    document.getElementById('enabledCheckbox').checked = enabled;
})
