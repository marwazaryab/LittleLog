import { auth, db, onAuthStateChanged, doc, setDoc, getDoc, generateReadableDocId, findUserDocByUid } from './auth.js';

let currentUser = null;
let allergiesList = [];
let medicationsList = [];

// Check authentication state and load existing profile
onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? 'User signed in' : 'No user');
    if (user) {
        currentUser = user;
        console.log('User is signed in:', user.email, user.uid);

        // Try to load existing profile
        await loadExistingProfile(user.uid);
    } else {
        // No user is signed in, redirect to login
        console.log('No user signed in, redirecting to login...');
        window.location.href = 'login.html';
    }
});

// Load existing profile data if available
async function loadExistingProfile(userId) {
    try {
        const userDoc = await findUserDocByUid(userId);

        if (userDoc && userDoc.exists()) {
            const profileData = userDoc.data();
            console.log('Loading existing profile data...');

            // Populate form fields
            document.getElementById('firstName').value = profileData.firstName || '';
            document.getElementById('lastName').value = profileData.lastName || '';
            document.getElementById('birthday').value = profileData.birthday || '';
            document.getElementById('gender').value = profileData.gender || '';
            document.getElementById('location').value = profileData.location || '';
            document.getElementById('preferredLanguage').value = profileData.preferredLanguage || 'English';
            document.getElementById('numberOfChildren').value = profileData.numberOfChildren || 0;
            document.getElementById('firstTimeParent').checked = profileData.firstTimeParent || false;

            // Load allergies
            if (profileData.allergies && profileData.allergies.length > 0) {
                const allergiesContainer = document.getElementById('allergiesContainer');
                const allergiesInput = document.getElementById('allergiesInput');
                profileData.allergies.forEach(allergy => {
                    addTag(allergiesContainer, allergiesInput, allergiesList, allergy);
                });
            }

            // Load medications
            if (profileData.medications && profileData.medications.length > 0) {
                const medicationsContainer = document.getElementById('medicationsContainer');
                const medicationsInput = document.getElementById('medicationsInput');
                profileData.medications.forEach(medication => {
                    addTag(medicationsContainer, medicationsInput, medicationsList, medication);
                });
            }

            // Update page title to indicate editing
            document.querySelector('h2').textContent = 'Edit Your Profile';
            document.querySelector('.intro-text').textContent = 'Update your profile information below.';
            document.querySelector('button[type="submit"]').textContent = 'Update Profile';
        }
    } catch (error) {
        console.error('Error loading existing profile:', error);
    }
}

// Tags input functionality for allergies
function setupTagsInput(containerId, inputId, tagsList) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = input.value.trim();
            if (value) {
                addTag(container, input, tagsList, value);
                input.value = '';
            }
        }
    });

    // Also allow comma separation
    input.addEventListener('input', (e) => {
        const value = input.value;
        if (value.includes(',')) {
            const tags = value.split(',').map(t => t.trim()).filter(t => t);
            tags.forEach(tag => {
                addTag(container, input, tagsList, tag);
            });
            input.value = '';
        }
    });
}

function addTag(container, input, tagsList, value) {
    if (!tagsList.includes(value)) {
        tagsList.push(value);

        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${value}
            <span class="remove" data-value="${value}">&times;</span>
        `;

        container.insertBefore(tag, input);

        // Add click handler to remove tag
        tag.querySelector('.remove').addEventListener('click', () => {
            const index = tagsList.indexOf(value);
            if (index > -1) {
                tagsList.splice(index, 1);
            }
            tag.remove();
        });
    }
}

// Calculate age from birthday
function calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// Helper function to show error messages
function showError(message) {
    const errorMessageEl = document.getElementById('errorMessage');
    errorMessageEl.textContent = message;
    errorMessageEl.classList.add('show');
    // Also scroll to error message
    errorMessageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize tags input
setupTagsInput('allergiesContainer', 'allergiesInput', allergiesList);
setupTagsInput('medicationsContainer', 'medicationsInput', medicationsList);

// Wait for DOM to be fully loaded before attaching event listener
let formSubmitted = false;

// Handle form submission
const profileForm = document.getElementById('profileForm');
if (!profileForm) {
    console.error('Profile form not found!');
} else {
    console.log('Profile form found, attaching submit handler...');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted!');
        
        if (formSubmitted) {
            console.log('Form already being processed, ignoring duplicate submission');
            return;
        }
        formSubmitted = true;

        console.log('Checking current user...', currentUser);
        if (!currentUser) {
            console.error('No current user found!');
            alert('You must be logged in to complete your profile');
            window.location.href = 'login.html';
            formSubmitted = false;
            return;
        }
        
        console.log('Current user:', currentUser.email, currentUser.uid);

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const birthday = document.getElementById('birthday').value;
        const gender = document.getElementById('gender').value;
        const location = document.getElementById('location').value.trim();
        const preferredLanguage = document.getElementById('preferredLanguage').value;
        const numberOfChildren = parseInt(document.getElementById('numberOfChildren').value) || 0;
        const firstTimeParent = document.getElementById('firstTimeParent').checked;

        // Clear any previous error messages
        const errorMessageEl = document.getElementById('errorMessage');
        if (errorMessageEl) {
            errorMessageEl.classList.remove('show');
            errorMessageEl.textContent = '';
        }

        // Validate required fields
        if (!firstName) {
            showError('Please enter your first name');
            document.getElementById('firstName').focus();
            formSubmitted = false;
            return;
        }

        if (!lastName) {
            showError('Please enter your last name');
            document.getElementById('lastName').focus();
            formSubmitted = false;
            return;
        }

        if (!birthday) {
            showError('Please enter your birthday');
            document.getElementById('birthday').focus();
            formSubmitted = false;
            return;
        }

        // Validate birthday is not in the future
        const birthDate = new Date(birthday);
        const today = new Date();
        if (birthDate > today) {
            showError('Birthday cannot be in the future');
            document.getElementById('birthday').focus();
            formSubmitted = false;
            return;
        }

        // Calculate age
        const age = calculateAge(birthday);

        // Validate age is reasonable
        if (age < 0 || age > 150) {
            showError('Please enter a valid birthday');
            document.getElementById('birthday').focus();
            formSubmitted = false;
            return;
        }

        console.log('Form validation passed. Saving profile...');

        // Generate readable document ID from name
        const readableDocId = generateReadableDocId(firstName, lastName, currentUser.uid);

        // Create profile data object
        const profileData = {
            authUid: currentUser.uid, // Store auth UID for linking
            firstName,
            lastName,
            birthday,
            age,
            gender: gender || null,
            location: location || null,
            preferredLanguage,
            numberOfChildren,
            firstTimeParent,
            allergies: allergiesList,
            medications: medicationsList,
            childrenIds: [], // Empty array for now, can be populated later
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            console.log('Checking for existing profile...');
            // Check if profile already exists (by UID)
            const existingDoc = await findUserDocByUid(currentUser.uid);
            const isUpdate = existingDoc && existingDoc.exists();
            
            // If updating and the name changed, we might need to delete the old document
            // For now, we'll update the existing document if it exists, otherwise create new
            let docIdToUse = readableDocId;
            if (isUpdate) {
                // Use the existing document ID to preserve the document
                docIdToUse = existingDoc.id;
                console.log('Updating existing profile with ID:', docIdToUse);
            } else {
                console.log('Creating new profile with ID:', docIdToUse);
            }

            // Save to Firestore with readable document ID
            console.log('Saving to Firestore...');
            const userDocRef = doc(db, 'users', docIdToUse);
            await setDoc(userDocRef, profileData);

            console.log('Profile saved successfully!');
            console.log('Document ID:', docIdToUse);
            console.log('Profile data:', profileData);
            alert(isUpdate ? 'Profile updated successfully!' : 'Profile completed successfully!');

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            formSubmitted = false; // Reset flag on error
            console.error('Error saving profile:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            
            // More detailed error message
            let errorMsg = 'Error saving profile: ' + error.message;
            if (error.code === 'permission-denied') {
                errorMsg = 'Permission denied. Please check your Firestore security rules. Make sure authenticated users can write to the users collection.';
            } else if (error.code === 'unavailable') {
                errorMsg = 'Firestore is unavailable. Please check your internet connection.';
            } else if (error.message && error.message.toLowerCase().includes('insufficient')) {
                errorMsg = 'Insufficient information: ' + error.message;
            }
            showError(errorMsg);
            alert(errorMsg); // Also show alert for visibility
        }
    });
}
