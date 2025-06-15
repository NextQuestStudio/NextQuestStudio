document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('google-signin-btn');
    const errorDisplay = document.getElementById('error-message');

    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .then(userCredential => {
                    const user = userCredential.user;
                    return db.collection('users').doc(user.uid).get();
                })
                .then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        console.log("Admin user successfully signed in.");
                        window.location.replace('workspace.html');
                    } else {
                        auth.signOut();
                        errorDisplay.textContent = "You do not have permission to access this area.";
                    }
                })
                .catch(error => {
                    console.error("Sign-in error:", error.message);
                    errorDisplay.textContent = "Failed to sign in. Please try again.";
                });
        });
    }
});
