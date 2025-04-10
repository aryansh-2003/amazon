// Initialize Firebase Authentication
const auth = firebase.auth();

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'index2.html';
        })
        .catch((error) => {
            let errorMessage = error.message;
            
            // User-friendly error messages
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            }
            
            alert(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = 'Sign in';
        });
});

// Forgot Password Functionality
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const closeModal = document.querySelector('.close-modal');
const resetPasswordForm = document.getElementById('reset-password-form');
const resetMessage = document.getElementById('reset-message');

// Show modal when Forgot Password link is clicked
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = 'block';
});

// Close modal when X is clicked
closeModal.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'none';
    resetMessage.textContent = '';
    resetPasswordForm.reset();
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
        resetMessage.textContent = '';
        resetPasswordForm.reset();
    }
});

// Handle password reset form submission
resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    
    // Show loading state
    const submitButton = resetPasswordForm.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    resetMessage.textContent = '';
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            resetMessage.textContent = 'Password reset email sent! Please check your inbox (and spam folder).';
            resetMessage.style.color = '#4CAF50';
            resetPasswordForm.reset();
            
            // Close modal after 5 seconds
            setTimeout(() => {
                forgotPasswordModal.style.display = 'none';
                resetMessage.textContent = '';
                submitButton.disabled = false;
                submitButton.textContent = 'Send Reset Link';
            }, 5000);
        })
        .catch((error) => {
            let errorMessage = error.message;
            
            // More user-friendly error messages
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later.';
            }
            
            resetMessage.textContent = errorMessage;
            resetMessage.style.color = '#f44336';
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        });
});