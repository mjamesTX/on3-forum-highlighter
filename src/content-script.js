// These are copy/pasted between options.js and here because content scripts are
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

const HIDDEN_ATTRIBUTE = 'hidden';
const TOUCHED_ATTRIBUTE = 'on3-forum-highlighter';

enabled = false;
whitelist = [];
minReactions = 0;

chrome.storage.local.get('enabled', ({ enabled = DEFAULT_ENABLED }) => {
    this.enabled = enabled;
    if (this.enabled && !this.whitelist === undefined) {
        run();
    }
});

chrome.storage.sync.get(null, ({whitelist = MODERATORS, minReactions = DEFAULT_MIN_REACTIONS}) => {
    this.whitelist = new Set(whitelist);
    this.minReactions = minReactions;
    if (this.enabled) {
        run();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
        this.enabled = changes.enabled.newValue;
        run();
    }
    if (namespace === 'sync') {
        if (changes.whitelist) {
            this.whitelist = new Set(changes.whitelist.newValue);
            run();
        }
        if (changes.minReactions) {
            this.minReactions = changes.minReactions.newValue;
            run();
        }
    }
});

function run() {
    const posts = document.getElementsByClassName('js-post');
    if (posts) {
        Array.from(posts).forEach(post => {
            if (this.enabled && shouldHide(post)) {
                if (isTouched(post) || !isHidden(post)) { // Otherwise hidden by someone else, leave alone
                    hide(post);
                }
            } else if (isTouched(post)) {
                unhide(post)
            }
        })
    }
}

function shouldHide(post) {
    return getReactionsCount(post) < this.minReactions
        && !this.whitelist.has(getAuthor(post));
}

function isTouched(post) {
    return post.getAttribute(TOUCHED_ATTRIBUTE);
}

function isHidden(post) {
    return post.getAttribute(HIDDEN_ATTRIBUTE);
}

function hide(post) {
    post.setAttribute(HIDDEN_ATTRIBUTE, 'true');
    post.setAttribute(TOUCHED_ATTRIBUTE, 'true');
}

function unhide(post) {
    post.removeAttribute(HIDDEN_ATTRIBUTE);
    post.removeAttribute(TOUCHED_ATTRIBUTE);
}

function getReactionsCount(post) {
    let count = 0;
    const reactions = post.getElementsByClassName('reactionsBar-link')[0];
    if (reactions) {
        count += reactions.getElementsByTagName('bdi').length;
        if (reactions.lastChild && reactions.lastChild.textContent.match(/ and \d+ others/)) {
            count += parseInt(reactions.lastChild.textContent.trim().split(' ')[1]);
        }
    }

    return count;
}

function getAuthor(post) {
    return post.getAttribute('data-author');
}
