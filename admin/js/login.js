document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('google-signin-btn');
    
    // This is just a helper to show alerts.
    function showDebugAlert(message) {
        alert(message);
        console.log(message); // Also log to console for when it's available
    }

    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            showDebugAlert("Step 1: Sign-in button clicked.");
            
            const provider = new firebase.auth.GoogleAuthProvider();

            auth.signInWithPopup(provider)
                .then(userCredential => {
                    const user = userCredential.user;
                    showDebugAlert("Step 2: Google Sign-In Successful! User: " + user.email);
                    
                    showDebugAlert("Step 3: Checking Firestore for admin role...");
                    return db.collection('users').doc(user.uid).get();
                })
                .then(doc => {
                    showDebugAlert("Step 4: Firestore check complete. Document exists: " + doc.exists);
                    
                    if (doc.exists && doc.data().role === 'admin') {
                        showDebugAlert("Step 5: SUCCESS! User is an admin. Redirecting to workspace...");
                        window.location.replace('workspace.html');
                    } else {
                        showDebugAlert("Step 6: FAILURE! User is not an admin in Firestore. Signing out.");
                        auth.signOut();
                        displayError("You do not have permission to access this area.");
                    }
                })
                .catch(error => {
                    // This will catch any error in the entire chain
                    showDebugAlert("ERROR! An error occurred: " + error.code + " | " + error.message);
                    displayError("An error occurred. Please try again.");
                });
        });
    }

    // We'll reuse the displayError function from shared.js
    // but define it here too in case shared.js hasn't loaded.
    function displayError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.textContent = message;
        }
    }
});
