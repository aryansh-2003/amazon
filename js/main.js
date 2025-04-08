        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyBS3dxYFq28ODSBJOkQyQ-JvStbVJ0J484",
            authDomain: "mini-tv-clone.firebaseapp.com",
            projectId: "mini-tv-clone",
            storageBucket: "mini-tv-clone.appspot.com",
            messagingSenderId: "606463078554",
            appId: "1:606463078554:web:5a3116d62136f6d520ef23",
            measurementId: "G-7M4TLSVBC2"
        };
        
        firebase.initializeApp(firebaseConfig);
        
        // Auth state management
        const auth = firebase.auth();
        const userInfoDiv = document.getElementById('user-info');
        const authButtonsDiv = document.getElementById('auth-buttons');
        
        auth.onAuthStateChanged(user => {
            if (user) {
                const username = user.displayName || user.email;
                
                // Update top right auth buttons
                authButtonsDiv.innerHTML = `
                    <span style="color:white;">Welcome, <b>${username}</b></span>
                    <button class="logout-btn" style="margin-left: 10px;">Logout</button>
                `;
                
                // Update main content user info
                userInfoDiv.innerHTML = `
                    Welcome, <strong>${username}</strong> |
                    <button id="logout-btn">Logout</button>
                `;
                
                // Add event listeners to both logout buttons
                document.querySelectorAll('.logout-btn, #logout-btn').forEach(btn => {
                    btn.addEventListener('click', () => auth.signOut());
                });
            } else {
                // Not logged in
                authButtonsDiv.innerHTML = `
                    <a href="login.html" class="login-btn">Login</a>
                    <a href="register.html" class="register-btn">Register</a>
                `;
                
                userInfoDiv.innerHTML = `
                    <a href="login.html">Login</a> |
                    <a href="register.html">Register</a>
                `;
            }
        });
        
        // Carousel functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Generate sample content for carousels
            const carousels = [
                'other-genres-carousel',
                'turkish-shows-carousel',
                'light-hearted-carousel'
            ];
            
            carousels.forEach(carouselId => {
                const carousel = document.getElementById(carouselId);
                
                // Generate 20 sample cards
                for (let i = 1; i <= 20; i++) {
                    carousel.innerHTML += `
                        <div class="content-card">
                            <img src="https://via.placeholder.com/150x200?text=Show+${i}" class="card-image">
                            <div class="card-info">
                                <h3 class="card-title">Show Title ${i}</h3>
                                <p class="card-meta">Genre • Year</p>
                            </div>
                        </div>
                    `;
                }
            });
            
            // Add horizontal scrolling with mouse drag
            const carouselElements = document.querySelectorAll('.content-carousel');
            
            carouselElements.forEach(carousel => {
                let isDown = false;
                let startX;
                let scrollLeft;
                
                carousel.addEventListener('mousedown', (e) => {
                    isDown = true;
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                    carousel.style.cursor = 'grabbing';
                });
                
                carousel.addEventListener('mouseleave', () => {
                    isDown = false;
                    carousel.style.cursor = 'grab';
                });
                
                carousel.addEventListener('mouseup', () => {
                    isDown = false;
                    carousel.style.cursor = 'grab';
                });
                
                carousel.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 2;
                    carousel.scrollLeft = scrollLeft - walk;
                });
            });
            
            // Infinite scroll detection
            window.addEventListener('scroll', function() {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                    // Load more content when near bottom
                    console.log('Load more content...');
                    // In a real app, you would fetch more data here
                }
            });
        });