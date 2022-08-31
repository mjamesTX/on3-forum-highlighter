import { DEFAULT_ENABLED, MODERATORS, DEFAULT_MIN_REACTIONS, DEFAULT_MODE } from './constants.js';
import { MODIFIERS } from './content-script-main.js';

const modeSelect = document.getElementById('modeSelect');
const whitelistElement = document.getElementById('whitelist');
const enabledCheckbox = document.getElementById('enabledCheckbox');
const reactionsInput = document.getElementById('reactionsInput');

modeSelect.addEventListener('change', () => {
    const mode = modeSelect.options[modeSelect.selectedIndex].value;
    chrome.storage.sync.set({mode});
})
enabledCheckbox.addEventListener('click', () => {
    chrome.storage.local.set({enabled: enabledCheckbox.checked});
})

document.getElementById('whitelistSave').addEventListener('click', () => {
    const whitelist = Array.from(whitelistElement.getElementsByTagName('li'))
        .map(li => li.textContent)
        .filter(user => !!user);
    chrome.storage.sync.set({whitelist});
    loadOptions();
})

document.getElementById('whitelistClear').addEventListener('click', () => {
    chrome.storage.sync.set({whitelist: ['']});
    loadOptions();
})

document.getElementById('whitelistDefault').addEventListener('click', () => {
    chrome.storage.sync.remove('whitelist');
    loadOptions();
})

reactionsInput.addEventListener('input', () => {
    chrome.storage.sync.set({ minReactions: reactionsInput.value })
})

loadOptions();

function loadOptions() {
    chrome.storage.local.get(null, ({enabled = DEFAULT_ENABLED}) => {
        enabledCheckbox.checked = enabled;
    });

    chrome.storage.sync.get(null, ({mode = DEFAULT_MODE, whitelist = MODERATORS, minReactions = DEFAULT_MIN_REACTIONS}) => {
        Object.keys(MODIFIERS).forEach(modeOption => {
            const option = document.createElement('option');
            option.value = modeOption;
            option.innerHTML = modeOption;
            if (mode === modeOption) {
                option.selected = true;
            }
            modeSelect.appendChild(option);
        });

        Array.from(whitelistElement.getElementsByTagName('li')).forEach(li => {
            whitelistElement.removeChild(li);
        })
        whitelist.forEach(user => {
            const li = document.createElement('li');
            li.append(user);
            whitelistElement.appendChild(li);
        })

        reactionsInput.value = minReactions;
    })
}