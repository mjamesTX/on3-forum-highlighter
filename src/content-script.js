const HIDDEN_ATTRIBUTE = 'hidden';
const TOUCHED_ATTRIBUTE = 'on3-forum-highlighter';
const MIN_REACTIONS = 10;

chrome.storage.sync.get('enabled', ({ enabled }) => { run(enabled); });

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.enabled) {
        run(changes.enabled.newValue);
    }
})

function run(enabled) {
    const posts = document.getElementsByClassName('js-post');
    if (posts) {
        Array.from(posts).forEach(post => {
            if (enabled) {
                if (shouldHide(post)) {
                    post.setAttribute(HIDDEN_ATTRIBUTE, 'true');
                    post.setAttribute(TOUCHED_ATTRIBUTE, 'true');
                }
            } else if (post.getAttribute(TOUCHED_ATTRIBUTE)) {
                post.removeAttribute(HIDDEN_ATTRIBUTE);
                post.removeAttribute(TOUCHED_ATTRIBUTE);
            }
        })
    }
}

function shouldHide(post) {
    if (post.getAttribute(HIDDEN_ATTRIBUTE)) {
        return false;
    }
    return getReactionsCount(post) < MIN_REACTIONS;
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
