const posts = document.getElementsByClassName('js-post');
if (posts) {
    Array.from(posts).forEach(post => {
        post.setAttribute('hidden', 'true');
    })
}
