document.addEventListener('DOMContentLoaded', function() {
    const outerBox = document.querySelector('.outer-box');
    const videos = document.querySelectorAll('video');
    const likeButtons = document.querySelectorAll('.like');
    const commentButtons = document.querySelectorAll('.comment');
    const shareButtons = document.querySelectorAll('.share');
    const commentModal = document.getElementById('commentModal');
    const shareModal = document.getElementById('shareModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const postCommentButtons = document.querySelectorAll('.post-comment');
    
    // Sample comments data
    const sampleComments = [
        {
            username: "@user123",
            avatar: "https://randomuser.me/api/portraits/women/33.jpg",
            text: "This is amazing! 😍"
        },
        {
            username: "@coolguy",
            avatar: "https://randomuser.me/api/portraits/men/45.jpg",
            text: "Nice moves!"
        },
        {
            username: "@musiclover",
            avatar: "https://randomuser.me/api/portraits/women/22.jpg",
            text: "What song is this?"
        }
    ];

    // Initialize Intersection Observer for video playback control
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (entry.isIntersecting) {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.7 });
    
    // Observe each reel container
    document.querySelectorAll('.reel').forEach(container => {
        observer.observe(container);
    });
    
    // Like button functionality
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const likeCount = this.querySelector('.count');
            const icon = this.querySelector('i');
            
            if (this.classList.contains('active')) {
                // Unlike
                let count = parseFloat(likeCount.textContent);
                if (count > 0) count--;
                likeCount.textContent = formatCount(count);
                this.classList.remove('active');
                icon.style.color = '#fff';
            } else {
                // Like
                let count = parseFloat(likeCount.textContent) + 1;
                likeCount.textContent = formatCount(count);
                this.classList.add('active');
                icon.style.color = '#ff0000';
            }
        });
    });
    
    // Comment button functionality
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Load sample comments
            const commentList = commentModal.querySelector('.comment-list');
            commentList.innerHTML = '';
            
            sampleComments.forEach(comment => {
                const commentItem = document.createElement('div');
                commentItem.className = 'comment-item';
                commentItem.innerHTML = `
                    <div class="comment-avatar">
                        <img src="${comment.avatar}" alt="${comment.username}">
                    </div>
                    <div class="comment-text">
                        <p class="comment-user">${comment.username}</p>
                        <p>${comment.text}</p>
                    </div>
                `;
                commentList.appendChild(commentItem);
            });
            
            commentModal.style.display = 'block';
        });
    });
    
    // Share button functionality
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            shareModal.style.display = 'block';
        });
    });
    
    // Close modal functionality
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            commentModal.style.display = 'none';
            shareModal.style.display = 'none';
        });
    });
    
    // Post comment functionality
    postCommentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentInput = this.parentElement.querySelector('input');
            if (commentInput.value.trim() !== '') {
                const commentList = commentModal.querySelector('.comment-list');
                const newComment = document.createElement('div');
                newComment.className = 'comment-item';
                newComment.innerHTML = `
                    <div class="comment-avatar">
                        <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="You">
                    </div>
                    <div class="comment-text">
                        <p class="comment-user">You</p>
                        <p>${commentInput.value}</p>
                    </div>
                `;
                commentList.appendChild(newComment);
                commentInput.value = '';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === commentModal) {
            commentModal.style.display = 'none';
        }
        if (event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });
    
    // Format count to display with 'k' for thousands
    function formatCount(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    }
    
    // Ensure videos are muted (some browsers require this for autoplay)
    videos.forEach(video => {
        video.muted = true;
        
        // Add click to play/pause
        video.addEventListener('click', function() {
            if (this.paused) {
                this.play().catch(e => console.log("Play prevented:", e));
            } else {
                this.pause();
            }
        });
    });
});
// Autoload (infinite scroll)
window.addEventListener('scroll', function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreReels(); // Load more when near bottom
    }
});

function loadMoreReels() {
    for (let i = 0; i < 20; i++) {
        const newReel = document.createElement('div');
        newReel.className = 'reel';
        newReel.innerHTML = `
            <video src="sample${Math.floor(Math.random() * 5) + 1}.mp4" loop></video>
            <div class="actions">
                <button class="like"><i class="fa fa-heart"></i><span class="count">0</span></button>
                <button class="comment"><i class="fa fa-comment"></i></button>
                <button class="share"><i class="fa fa-share"></i></button>
            </div>
        `;
        outerBox.appendChild(newReel);
        observer.observe(newReel);

        // Reattach event listeners for new buttons
        attachActionListeners(newReel);
    }
}

function attachActionListeners(container) {
    const like = container.querySelector('.like');
    const comment = container.querySelector('.comment');
    const share = container.querySelector('.share');

    like.addEventListener('click', function () {
        const likeCount = this.querySelector('.count');
        const icon = this.querySelector('i');

        if (this.classList.contains('active')) {
            let count = parseFloat(likeCount.textContent);
            if (count > 0) count--;
            likeCount.textContent = formatCount(count);
            this.classList.remove('active');
            icon.style.color = '#fff';
        } else {
            let count = parseFloat(likeCount.textContent) + 1;
            likeCount.textContent = formatCount(count);
            this.classList.add('active');
            icon.style.color = '#ff0000';
        }
    });

    comment.addEventListener('click', function () {
        // Reuse existing modal
        commentModal.style.display = 'block';
    });

    share.addEventListener('click', function () {
        shareModal.style.display = 'block';
    });
}
const uploadBtn = document.getElementById('uploadBtn');
const uploadInput = document.getElementById('uploadInput');

uploadBtn.addEventListener('click', () => {
    uploadInput.click();
});

uploadInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file && file.type.startsWith('video/')) {
        const videoURL = URL.createObjectURL(file);

        const newReel = document.createElement('div');
        newReel.className = 'reel';
        newReel.innerHTML = `
            <video src="${videoURL}" loop></video>
            <div class="actions">
                <button class="like"><i class="fa fa-heart"></i><span class="count">0</span></button>
                <button class="comment"><i class="fa fa-comment"></i></button>
                <button class="share"><i class="fa fa-share"></i></button>
            </div>
        `;
        outerBox.prepend(newReel);
        observer.observe(newReel);
        attachActionListeners(newReel);
    }
});
