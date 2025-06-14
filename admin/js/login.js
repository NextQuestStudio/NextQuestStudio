document.addEventListener('DOMContentLoaded', () => {
    // Select page-specific elements
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');

    // Ensure the form exists before adding a listener
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            displayError(""); // Clear any previous errors

            // 1. Check if reCAPTCHA is completed
            const captchaResponse = grecaptcha.getResponse();
            if (captchaResponse.length === 0) {
                displayError("Please complete the CAPTCHA verification.");
                return; // Stop the login process
            }

            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;

            // 2. Authenticate user with Firebase
            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // 3. On success, check for admin role in Firestore
                    const user = userCredential.user;
                    return db.collection('users').doc(user.uid).get();
                })
                .then(doc => {
                    // 4. Authorize or deny based on role
                    if (doc.exists && doc.data().role === 'admin') {
                        // User is an authorized admin
                        console.log("Admin user successfully authenticated. Proceeding to OTC verification.");
                        
                        // Set a flag to allow access to the verification page
                        sessionStorage.setItem('isVerifyingAdmin', 'true');
                        
                        // TODO: 5. Trigger Cloud Function here to send OTC email.
                        // For now, we simulate this and redirect.
                        
                        // Redirect to the one-time code verification page
                        window.location.assign('verify-code.html');
                    } else {
                        // Not an admin, sign them out and show error
                        auth.signOut();
                        displayError("You do not have permission to access this area.");
                    }
                })
                .catch(error => {
                    // Handle Firebase authentication errors (e.g., wrong password)
                    console.error("Login failed:", error.message);
                    displayError("Login failed. Please check your credentials.");
                })
                .finally(() => {
                    // Reset the reCAPTCHA widget after every attempt
                    grecaptcha.reset();
                });
        });
    }
});
                         
