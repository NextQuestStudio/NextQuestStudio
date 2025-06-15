document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('google-signin-btn');
    const errorDisplay = document.getElementById('error-message');

    // =========================================================================
    // PART 1: HANDLE THE BUTTON CLICK
    // =========================================================================
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            alert("Step 1: Sign-in button clicked. Redirecting to Google...");
            
            const provider = new firebase.auth.GoogleAuthProvider();
            // This line starts the redirect process. The code below will not run
            // until the user comes BACK to this page from Google.
            auth.signInWithRedirect(provider);
        });
    }


    // =========================================================================
    // PART 2: HANDLE THE RESULT AFTER RETURNING FROM GOOGLE
    // This code runs every time the page loads to check if we just came back
    // from the Google sign-in page.
    // =========================================================================
    
    alert("Page loaded. Checking for a sign-in redirect result...");

    auth.getRedirectResult()
        .then(result => {
            // Check if the 'result' object exists. It will only exist if the user
            // has just completed the sign-in redirect flow.
            if (result && result.user) {
                const user = result.user;
                alert("Step 2: Redirect result received! User: " + user.email);

                alert("Step 3: Checking Firestore for admin role...");
                return db.collection('users').doc(user.uid).get();
            }
            // If result is null, it means the user just loaded the page normally,
            // so we don't need to do anything. We return a 'marker' to check later.
            return null; 
        })
        .then(doc => {
            // If 'doc' is null, it means we didn't come from a redirect, so we stop.
            if (doc === null) {
                console.log("No redirect result to process.");
                return;
            }

            alert("Step 4: Firestore check complete. Document exists: " + doc.exists);
            
            if (doc.exists && doc.data().role === 'admin') {
                alert("Step 5: SUCCESS! User is an admin. Redirecting to workspace...");
                window.location.replace('workspace.html');
            } else {
                alert("Step 6: FAILURE! User is not an admin in Firestore. Signing out.");
                auth.signOut();
                displayError("You do not have permission to access this area.");
            }
        })
        .catch(error => {
            // This will catch any error from getRedirectResult or the Firestore check.
            alert("ERROR! An error occurred: " + error.code + " | " + error.message);
            displayError("An error occurred. Please try again.");
        });


    function displayError(message) {
        if (errorDisplay) {
            errorDisplay.textContent = message;
        }
    }
});
