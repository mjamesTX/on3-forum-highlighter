import { DEFAULT_ENABLED, MODERATORS, DEFAULT_MIN_REACTIONS, DEFAULT_MODE } from './constants.js';

const HIDDEN_ATTRIBUTE = 'hidden';
const STYLE_ATTRIBUTE = 'style'

function hide(post) {
    post.setAttribute(HIDDEN_ATTRIBUTE, 'true');
}
function unhide(post) {
    post.removeAttribute(HIDDEN_ATTRIBUTE);
}
function dim(post) {
    post.setAttribute(STYLE_ATTRIBUTE, 'opacity: 0.2');
}
function unstyle(post) {
    post.removeAttribute(STYLE_ATTRIBUTE);
}
function highlight(post) {
    post.setAttribute(STYLE_ATTRIBUTE, 'background-color: rgba(38, 255, 19, 0.3)');
}

const MODIFIERS = {
    Hide: { hide: hide, highlight: unhide, reset: unhide },
    Dim: { hide: dim, highlight: unstyle, reset: unstyle },
    Highlight: { hide: unstyle, highlight: highlight, reset: unstyle }
}
export { MODIFIERS };

export function main() {
    let config = {};

    chrome.storage.local.get('enabled', ({enabled = DEFAULT_ENABLED}) => {
        config.enabled = enabled;
        if (config.enabled && !config.whitelist === undefined) {
            run();
        }
    });

    chrome.storage.sync.get(null, ({mode = DEFAULT_MODE, whitelist = MODERATORS, minReactions = DEFAULT_MIN_REACTIONS}) => {
        config.mode = mode;
        config.whitelist = new Set(whitelist);
        config.minReactions = minReactions;
        if (config.enabled) {
            run();
        }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.enabled) {
            config.enabled = changes.enabled.newValue;
            run();
        }
        if (namespace === 'sync') {
            let configChanged = false;
            if (changes.mode) {
                configChanged = true;
                if (config.enabled) { // reset current highlighting mode
                    config.enabled = false;
                    run();
                    config.enabled = true;
                }
                config.mode = changes.mode.newValue;
            }
            if (changes.whitelist) {
                configChanged = true;
                config.whitelist = new Set(changes.whitelist.newValue);
            }
            if (changes.minReactions) {
                configChanged = true;
                config.minReactions = changes.minReactions.newValue;
            }
            if (config.enabled && configChanged) {
                run();
            }
        }
    });

    function run() {
        const posts = document.getElementsByClassName('js-post');
        if (posts) {
            const modifier = MODIFIERS[config.mode];
            Array.from(posts).forEach(post => {
                if (config.enabled) {
                    if (shouldHide(post)) {
                        modifier.hide(post);
                    } else {
                        modifier.highlight(post);
                    }
                } else {
                    modifier.reset(post);
                }
            })
        }
    }

    function shouldHide(post) {
        return getReactionsCount(post) < config.minReactions
            && !config.whitelist.has(getAuthor(post));
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
}
