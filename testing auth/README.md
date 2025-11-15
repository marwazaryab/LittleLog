# Firebase Authentication Integration

This folder contains a complete Firebase Authentication implementation for LittleLog using the modern Firebase SDK (v9+ modular).

## Features

- Email/Password Authentication
- Google OAuth Sign-In
- User Registration
- Protected Dashboard
- Logout Functionality
- Authentication State Management

## Files

- `login.html` - Login page with email/password and Google sign-in
- `signup.html` - User registration page
- `dashboard.html` - Protected dashboard for authenticated users
- `dashboard.js` - Dashboard logic with auth state listener
- `auth.js` - Firebase configuration and authentication logic
- `success.html` - Legacy success page (can be removed)

## Setup Instructions

### 1. Firebase Project Setup

Your Firebase configuration is already set up in `auth.js`. Make sure you have:

1. Created a Firebase project at https://console.firebase.google.com/
2. Enabled Email/Password authentication in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
3. Enabled Google authentication (optional):
   - Go to Authentication > Sign-in method
   - Enable "Google"
   - Configure OAuth consent screen

### 2. Running the Application

Since this uses ES6 modules, you need to serve the files through a local server (not just by opening the HTML file directly).

**Option 1: Using Python**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000/login.html
```

**Option 2: Using Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 8000

# Then open http://localhost:8000/login.html
```

**Option 3: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `login.html` and select "Open with Live Server"

### 3. Testing the Flow

1. **Sign Up**
   - Navigate to `login.html`
   - Click "Sign up here"
   - Enter email and password
   - Click "Sign Up"
   - You'll be redirected to the dashboard

2. **Login**
   - Navigate to `login.html`
   - Enter your credentials
   - Click "Login"
   - You'll be redirected to the dashboard

3. **Google Sign-In**
   - Click "Sign in with Google" on either login or signup page
   - Select your Google account
   - You'll be redirected to the dashboard

4. **Logout**
   - From the dashboard, click "Logout"
   - You'll be redirected to the login page

## Security Notes

**IMPORTANT**: Your Firebase API key is currently exposed in `auth.js`. This is normal for client-side Firebase apps, but you should:

1. Set up Firebase Security Rules to protect your data
2. Enable App Check for additional security
3. Configure authorized domains in Firebase Console
4. Never commit sensitive configuration to public repositories

## Customization

### Styling
The pages include inline CSS that you can customize. Consider moving styles to a separate CSS file for better organization.

### Validation
Password validation requires minimum 6 characters (Firebase requirement). You can add additional validation in the signup form.

### Error Handling
Currently displays errors using `alert()`. You can enhance this with:
- Custom error message UI
- Toast notifications
- Inline form validation errors

## Common Issues

### 1. CORS Errors
If you see CORS errors, make sure you're serving the files through a local server, not opening them directly in the browser.

### 2. Module Import Errors
Make sure you're using `type="module"` in script tags and serving through a server.

### 3. Firebase Auth Errors
- `auth/email-already-in-use` - Email is already registered
- `auth/invalid-email` - Email format is invalid
- `auth/weak-password` - Password is less than 6 characters
- `auth/user-not-found` - No user found with this email
- `auth/wrong-password` - Password is incorrect

## Next Steps

- Add email verification
- Implement password reset functionality
- Add more OAuth providers (Facebook, GitHub, etc.)
- Integrate with Firestore for user profiles
- Add loading states and better error handling
- Implement "Remember Me" functionality
