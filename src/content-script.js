const HIDDEN_ATTRIBUTE = 'hidden';
const TOUCHED_ATTRIBUTE = 'on3-forum-highlighter';

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
                if (!post.getAttribute(HIDDEN_ATTRIBUTE)) {
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

