// DOM Elements
const uploadBox = document.getElementById('upload-box');
const selectFileBtn = document.getElementById('select-file-btn');
const videoFileInput = document.getElementById('video-file');
const videoPreview = document.getElementById('video-preview');
const previewVideo = document.getElementById('preview-video');
const videoDetails = document.getElementById('video-details');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const uploadSuccess = document.getElementById('upload-success');
const viewShortBtn = document.getElementById('view-short-btn');
const publishBtn = document.getElementById('publish-btn');
const thumbnailInput = document.getElementById('video-thumbnail');
const thumbnailPreview = document.getElementById('thumbnail-preview');

let selectedFile = null;
let videoDuration = 0;
let videoUrl = '';
let thumbnailUrl = '';

// Drag and drop functionality
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

// File selection
selectFileBtn.addEventListener('click', () => {
    videoFileInput.click();
});

videoFileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

// Handle selected file
function handleFileSelect(file) {
    // Check file type
    if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
    }
    
    selectedFile = file;
    
    // Create preview
    const videoURL = URL.createObjectURL(file);
    previewVideo.src = videoURL;
    
    // Show preview
    uploadBox.style.display = 'none';
    videoPreview.style.display = 'block';
    videoDetails.style.display = 'block';
    
    // Get video duration
    previewVideo.onloadedmetadata = () => {
        videoDuration = previewVideo.duration;
        
        // Check duration (max 60 seconds)
        if (videoDuration > 60) {
            alert('Video exceeds 60 second limit. Please trim it before uploading.');
        }
    };
}

// Thumbnail selection
thumbnailInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            thumbnailPreview.innerHTML = `<img src="${event.target.result}" alt="Thumbnail">`;
        };
        
        reader.readAsDataURL(file);
    }
});

// Publish short
publishBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to upload shorts');
        return;
    }
    
    const title = document.getElementById('video-title').value.trim();
    const description = document.getElementById('video-description').value.trim();
    
    if (!title) {
        alert('Please enter a title for your short');
        return;
    }
    
    if (!selectedFile) {
        alert('Please select a video file');
        return;
    }
    
    // Show progress
    videoDetails.style.display = 'none';
    uploadProgress.style.display = 'block';
    
    // Upload video to Firebase Storage
    const storageRef = storage.ref();
    const videoRef = storageRef.child(`shorts/${user.uid}/${Date.now()}_${selectedFile.name}`);
    const uploadTask = videoRef.put(selectedFile);
    
    uploadTask.on('state_changed',
        (snapshot) => {
            // Progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        },
        (error) => {
            // Error
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
            videoDetails.style.display = 'block';
            uploadProgress.style.display = 'none';
        },
        () => {
            // Complete
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                videoUrl = downloadURL;
                
                // Upload thumbnail if selected
                if (thumbnailInput.files.length) {
                    const thumbnailFile = thumbnailInput.files[0];
                    const thumbnailRef = storageRef.child(`thumbnails/${user.uid}/${Date.now()}_${thumbnailFile.name}`);
                    
                    thumbnailRef.put(thumbnailFile).then((snapshot) => {
                        return snapshot.ref.getDownloadURL();
                    }).then((url) => {
                        thumbnailUrl = url;
                        saveShortToFirestore(title, description);
                    });
                } else {
                    // Use a frame from the video as thumbnail
                    thumbnailUrl = ''; // In a real app, you'd capture a frame
                    saveShortToFirestore(title, description);
                }
            });
        }
    );
});

// Save short to Firestore
function saveShortToFirestore(title, description) {
    const user = auth.currentUser;
    
    db.collection('shorts').add({
        title: title,
        description: description,
        videoUrl: videoUrl,
        thumbnail: thumbnailUrl || 'https://via.placeholder.com/300x500',
        creator: user.displayName || 'Anonymous',
        creatorId: user.uid,
        likes: 0,
        views: 0,
        comments: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then((docRef) => {
        // Show success
        uploadProgress.style.display = 'none';
        uploadSuccess.style.display = 'block';
        
        // Set view short button
        viewShortBtn.href = `../../watch/shorts.html?id=${docRef.id}`;
    }).catch((error) => {
        console.error('Error adding document:', error);
        alert('Failed to publish short. Please try again.');
        videoDetails.style.display = 'block';
        uploadProgress.style.display = 'none';
    });
}