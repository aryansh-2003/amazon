// DOM Elements
const shortVideo = document.getElementById('short-video');
const videoTitle = document.getElementById('video-title');
const videoCreator = document.getElementById('video-creator');
const videoDescription = document.getElementById('video-description');
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');
const commentBtn = document.getElementById('comment-btn');
const shareBtn = document.getElementById('share-btn');
const commentText = document.getElementById('comment-text');
const postCommentBtn = document.getElementById('post-comment');
const commentsList = document.getElementById('comments-list');
const moreShortsContainer = document.getElementById('more-shorts');

let currentShortId = null;
let currentShortData = null;
let liked = false;

// Get short ID from URL
const urlParams = new URLSearchParams(window.location.search);
currentShortId = urlParams.get('id');

// Load short data
function loadShortData(shortId) {
    db.collection('shorts').doc(shortId).get()
        .then(doc => {
            if (doc.exists) {
                currentShortData = doc.data();
                displayShort(doc.data());
                
                // Increment view count
                db.collection('shorts').doc(shortId).update({
                    views: firebase.firestore.FieldValue.increment(1)
                });
                
                // Check if user liked this short
                checkIfLiked();
                
                // Load comments
                loadComments();
            } else {
                console.error("No such document!");
            }
        })
        .catch(error => {
            console.error("Error getting document:", error);
        });
}

// Display short
function displayShort(short) {
    shortVideo.src = short.videoUrl;
    videoTitle.textContent = short.title;
    videoCreator.textContent = `By ${short.creator}`;
    videoDescription.textContent = short.description;
    likeCount.textContent = short.likes || 0;
    
    // Auto play video
    shortVideo.play().catch(error => {
        console.error("Autoplay prevented:", error);
    });
}

// Check if current user liked this short
function checkIfLiked() {
    const user = auth.currentUser;
    if (user) {
        db.collection('likes').where('userId', '==', user.uid)
            .where('shortId', '==', currentShortId).get()
            .then(querySnapshot => {
                liked = !querySnapshot.empty;
                updateLikeButton();
            });
    }
}

function updateLikeButton() {
    likeBtn.innerHTML = liked
        ? `<i class="fas fa-heart" style="color:red"></i> ${likeCount.textContent}`
        : `<i class="fas fa-heart"></i> ${likeCount.textContent}`;

    likeBtn.classList.add('like-animate');
    setTimeout(() => likeBtn.classList.remove('like-animate'), 400);
}


// Like/unlike functionality
likeBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to like shorts');
        return;
    }
    
    if (liked) {
        // Unlike
        db.collection('likes').where('userId', '==', user.uid)
            .where('shortId', '==', currentShortId).get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });
                
                // Update short likes count
                db.collection('shorts').doc(currentShortId).update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
                
                liked = false;
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
                updateLikeButton();
            });
    } else {
        // Like
        db.collection('likes').add({
            userId: user.uid,
            shortId: currentShortId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update short likes count
        db.collection('shorts').doc(currentShortId).update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        
        liked = true;
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
        updateLikeButton();
    }
});

// Load comments
function loadComments() {
    db.collection('comments').where('shortId', '==', currentShortId)
        .orderBy('timestamp', 'desc').get()
        .then(querySnapshot => {
            commentsList.innerHTML = '';
            querySnapshot.forEach(doc => {
                const comment = doc.data();
                commentsList.innerHTML += `
                    <div class="comment">
                        <div class="comment-user">${comment.userName}</div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-time">${new Date(comment.timestamp?.toDate()).toLocaleString()}</div>
                    </div>
                `;
            });
        });
}

// Post comment
postCommentBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to comment');
        return;
    }
    
    const text = commentText.value.trim();
    if (!text) return;
    
    db.collection('comments').add({
        shortId: currentShortId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        commentText.value = '';
        loadComments();
    });
});

// Share button
shareBtn.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: currentShortData.title,
            text: currentShortData.description,
            url: window.location.href
        }).catch(error => {
            console.error('Error sharing:', error);
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `${window.location.origin}/watch/shorts.html?id=${currentShortId}`;
        prompt('Copy this link to share:', shareUrl);
    }
});

// Load more shorts
function loadMoreShorts() {
    db.collection('shorts').orderBy('timestamp', 'desc').limit(10).get()
        .then(querySnapshot => {
            moreShortsContainer.innerHTML = '';
            querySnapshot.forEach(doc => {
                if (doc.id !== currentShortId) {
                    const short = doc.data();
                    moreShortsContainer.innerHTML += `
                        <div class="short-preview" onclick="location.href='shorts.html?id=${doc.id}'">
                            <img src="${short.thumbnail}" alt="${short.title}">
                            <div class="short-preview-info">
                                <h4>${short.title}</h4>
                                <p>${short.creator}</p>
                            </div>
                        </div>
                    `;
                }
            });
        });
}

shortVideo.addEventListener('ended', () => {
    db.collection('shorts').orderBy('views', 'desc').limit(5).get()
        .then(querySnapshot => {
            const shorts = querySnapshot.docs.filter(doc => doc.id !== currentShortId);
            if (shorts.length > 0) {
                const random = Math.floor(Math.random() * shorts.length);
                window.location.href = `shorts.html?id=${shorts[random].id}`;
            }
        });
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (currentShortId) {
        loadShortData(currentShortId);
        loadMoreShorts();
    } else {
        // No short ID provided, redirect to a random short
        db.collection('shorts').orderBy('views', 'desc').limit(1).get()
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const firstShortId = querySnapshot.docs[0].id;
                    window.location.href = `shorts.html?id=${firstShortId}`;
                } else {
                    // No shorts available
                    shortVideoContainer.innerHTML = '<p>No shorts available yet.</p>';
                }
            });
    }
});
const toggleCommentsBtn = document.getElementById('toggle-comments-btn');
const commentsSection = document.getElementById('comments-section');

toggleCommentsBtn.addEventListener('click', () => {
    commentsSection.classList.toggle('show');
});
const nextBtn = document.getElementById('next-btn');

nextBtn.addEventListener('click', () => {
    db.collection('shorts').orderBy('views', 'desc').limit(5).get()
        .then(querySnapshot => {
            const shorts = querySnapshot.docs.filter(doc => doc.id !== currentShortId);
            if (shorts.length > 0) {
                const random = Math.floor(Math.random() * shorts.length);
                window.location.href = `shorts.html?id=${shorts[random].id}`;
            }
        });
});
