// These are copy/pasted between content-script.js and here because content scripts are
// not type="module" so imports don't work. Seems to be a pain to work around, so I'm
// just taking the disgusting approach of copy/paste these constants in both places
const DEFAULT_ENABLED = true;
const MODERATORS = [
    'EricNahlin',
    'Gerry Hamilton',
    'IanBoyd',
    'JoeCook',
    'Justin Wells',
    'Paul Wadlington',
    'Tommy Yarrish'
];
const DEFAULT_MIN_REACTIONS = 10;

const whitelistElement = document.getElementById('whitelist');
const enabledCheckbox = document.getElementById('enabledCheckbox');
const reactionsInput = document.getElementById('reactionsInput');

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

    chrome.storage.sync.get(null, ({whitelist = MODERATORS, minReactions = DEFAULT_MIN_REACTIONS}) => {
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