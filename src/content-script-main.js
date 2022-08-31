import { DEFAULT_ENABLED, MODERATORS, DEFAULT_MIN_REACTIONS } from './constants.js';

const HIDDEN_ATTRIBUTE = 'hidden';
const TOUCHED_ATTRIBUTE = 'on3-forum-highlighter';

export function main() {
    let config = {};

    chrome.storage.local.get('enabled', ({ enabled = DEFAULT_ENABLED }) => {
        config.enabled = enabled;
        if (config.enabled && !config.whitelist === undefined) {
            run();
        }
    });

    chrome.storage.sync.get(null, ({ whitelist = MODERATORS, minReactions = DEFAULT_MIN_REACTIONS }) => {
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
            if (changes.whitelist) {
                config.whitelist = new Set(changes.whitelist.newValue);
                run();
            }
            if (changes.minReactions) {
                config.minReactions = changes.minReactions.newValue;
                run();
            }
        }
    });

    function run() {
        const posts = document.getElementsByClassName('js-post');
        if (posts) {
            Array.from(posts).forEach(post => {
                if (config.enabled && shouldHide(post)) {
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
        return getReactionsCount(post) < config.minReactions
            && !config.whitelist.has(getAuthor(post));
    }

    function isTouched(post) {
        return post.getAttribute(TOUCHED_ATTRIBUTE);
    }

    function isHidden(post) {
        return post.getAttribute(HIDDEN_ATTRIBUTE);
    }

    function hide(post) {
        post.setAttribute(HIDDEN_ATTRIBUTE, 'true');
        // post.setAttribute('style', 'opacity: 0.1');
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
}
