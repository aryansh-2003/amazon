// Check admin status on page load
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = '../admin-login.html';
    } else {
        // Verify admin status
        db.collection('admins').doc(user.uid).get()
            .then(doc => {
                if (!doc.exists) {
                    auth.signOut();
                    window.location.href = 'admin-login.html';
                } else {
                    // User is admin, load dashboard data
                    loadDashboardData();
                }
            });
    }
});

// Logout functionality
document.getElementById('admin-logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'admin-login.html';
    });
});

// Load dashboard statistics
function loadDashboardData() {
    // Total Users
    db.collection('users').get().then(snapshot => {
        document.getElementById('total-users').textContent = snapshot.size;
    });

    // Total Shorts
    db.collection('shorts').get().then(snapshot => {
        document.getElementById('total-shorts').textContent = snapshot.size;
    });

    // Total Series
    db.collection('series').get().then(snapshot => {
        document.getElementById('total-series').textContent = snapshot.size;
    });

    // Total Views (sum of all views)
    db.collection('shorts').get().then(shortsSnapshot => {
        let totalViews = 0;
        shortsSnapshot.forEach(doc => {
            totalViews += doc.data().views || 0;
        });
        
        db.collection('episodes').get().then(episodesSnapshot => {
            episodesSnapshot.forEach(doc => {
                totalViews += doc.data().views || 0;
            });
            document.getElementById('total-views').textContent = totalViews;
        });
    });

    // Recent Activity
    db.collection('activity')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
        .then(snapshot => {
            const activityList = document.getElementById('activity-list');
            activityList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const activity = doc.data();
                activityList.innerHTML += `
                    <div class="activity-item">
                        <i class="fas ${getActivityIcon(activity.type)}"></i>
                        <div>
                            <p>${activity.message}</p>
                            <small>${new Date(activity.timestamp.toDate()).toLocaleString()}</small>
                        </div>
                    </div>
                `;
            });
        });
}

function getActivityIcon(type) {
    const icons = {
        'upload': 'fa-upload',
        'delete': 'fa-trash',
        'update': 'fa-edit',
        'user': 'fa-user',
        'login': 'fa-sign-in-alt'
    };
    return icons[type] || 'fa-info-circle';
}

// Add activity log
function logActivity(message, type = 'info') {
    db.collection('activity').add({
        message: message,
        type: type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}