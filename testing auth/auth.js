import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBASzMHJY-37iMzuwtZGKEcGctzj85YqOk",
    authDomain: "wiehackathon-db039.firebaseapp.com",
    projectId: "wiehackathon-db039",
    storageBucket: "wiehackathon-db039.firebasestorage.app",
    messagingSenderId: "103074057836",
    appId: "1:103074057836:web:4931c0ddb202afeacf1249",
    measurementId: "G-MT2P76W7P6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to generate a readable document ID from name
function generateReadableDocId(firstName, lastName, uid) {
    // Create base name: firstName_lastName (lowercase, spaces/special chars removed)
    const baseName = `${firstName}_${lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .replace(/\s+/g, '_');
    
    // Use base name with a short unique suffix from UID (first 8 chars)
    // This ensures uniqueness while keeping it readable
    const uniqueSuffix = uid.substring(0, 8);
    return `${baseName}_${uniqueSuffix}`;
}

// Helper function to find user document by UID
async function findUserDocByUid(uid) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('authUid', '==', uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Return the first matching document
            return querySnapshot.docs[0];
        }
        return null;
    } catch (error) {
        console.error('Error finding user by UID:', error);
        return null;
    }
}

// Export auth and db for use in other files
export { 
    auth, 
    db, 
    signOut, 
    onAuthStateChanged, 
    doc, 
    setDoc, 
    getDoc, 
    collection,
    query,
    where,
    getDocs,
    generateReadableDocId,
    findUserDocByUid
};

// Email/Password login (for login.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in:', userCredential.user);

            // Check if user has completed their profile
            const userDoc = await findUserDocByUid(userCredential.user.uid);
            if (!userDoc || !userDoc.exists()) {
                // No profile, redirect to profile setup
                window.location.href = 'profile-setup.html';
            } else {
                // Has profile, go to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error: ' + error.message);
        }
    });
}

// Email/Password registration (for signup.html)
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password should be at least 6 characters!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user);
            // Redirect to profile setup instead of dashboard
            window.location.href = 'profile-setup.html';
        } catch (error) {
            console.error('Signup error:', error);
            alert('Error: ' + error.message);
        }
    });
}

// Google OAuth sign-in
const googleSignInBtn = document.getElementById('googleSignIn');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
            'prompt': 'select_account'
        });

        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Logged in with Google:', result.user);

            // Check if user profile exists
            const userDoc = await findUserDocByUid(result.user.uid);
            if (!userDoc || !userDoc.exists()) {
                // New Google user, redirect to profile setup
                window.location.href = 'profile-setup.html';
            } else {
                // Existing user, go to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            alert('Error: ' + error.message);
        }
    });
}