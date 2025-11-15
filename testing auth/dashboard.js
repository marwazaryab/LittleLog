import { auth, db, signOut, onAuthStateChanged, doc, getDoc, findUserDocByUid } from './auth.js';

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');

    if (user) {
        // User is signed in, display user info
        loading.classList.add('hidden');
        content.classList.remove('hidden');

        // Populate user information
        document.getElementById('userEmail').textContent = user.email || 'N/A';
        document.getElementById('userId').textContent = user.uid;

        // Format dates
        const creationTime = user.metadata.creationTime
            ? new Date(user.metadata.creationTime).toLocaleString()
            : 'N/A';
        const lastSignInTime = user.metadata.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleString()
            : 'N/A';

        document.getElementById('userCreated').textContent = creationTime;
        document.getElementById('userLastSignIn').textContent = lastSignInTime;
        document.getElementById('emailVerified').textContent = user.emailVerified ? 'Yes' : 'No';

        console.log('User is signed in:', user);

        // Fetch and display profile data
        await loadUserProfile(user.uid);
    } else {
        // No user is signed in, redirect to login
        console.log('No user signed in, redirecting to login...');
        window.location.href = 'login.html';
    }
});

// Load user profile from Firestore
async function loadUserProfile(userId) {
    try {
        const userDoc = await findUserDocByUid(userId);

        if (userDoc && userDoc.exists()) {
            const profileData = userDoc.data();
            displayProfileData(profileData);
        } else {
            // Profile doesn't exist, show incomplete profile warning
            document.getElementById('profileIncomplete').classList.remove('hidden');
            console.log('No profile found for user');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Display profile data
function displayProfileData(data) {
    document.getElementById('profileInfo').classList.remove('hidden');

    document.getElementById('fullName').textContent =
        `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'N/A';

    document.getElementById('birthday').textContent =
        data.birthday ? new Date(data.birthday).toLocaleDateString() : 'N/A';

    document.getElementById('age').textContent = data.age || 'N/A';

    document.getElementById('gender').textContent =
        data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : 'N/A';

    document.getElementById('location').textContent = data.location || 'N/A';

    document.getElementById('preferredLanguage').textContent = data.preferredLanguage || 'N/A';

    document.getElementById('numberOfChildren').textContent =
        data.numberOfChildren !== undefined ? data.numberOfChildren : 'N/A';

    document.getElementById('firstTimeParent').textContent =
        data.firstTimeParent ? 'Yes' : 'No';

    document.getElementById('allergies').textContent =
        data.allergies && data.allergies.length > 0 ? data.allergies.join(', ') : 'None';

    document.getElementById('medications').textContent =
        data.medications && data.medications.length > 0 ? data.medications.join(', ') : 'None';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error signing out: ' + error.message);
    }
});
