document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the signup page by looking for the form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        initializeSignupForm();
    }
});

function initializeSignupForm() {
    // --- ELEMENT SELECTION ---
    const form = document.getElementById('signup-form');
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const usernameError = document.getElementById('username-error');
    const formError = document.getElementById('form-error');
    
    // Password requirement list items
    const reqs = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special'),
    };

    // --- REAL-TIME PASSWORD VALIDATION ---
    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        // For each requirement, check if the password meets it and update the style
        validateRequirement(reqs.length, value.length >= 8);
        validateRequirement(reqs.uppercase, /[A-Z]/.test(value));
        validateRequirement(reqs.lowercase, /[a-z]/.test(value));
        validateRequirement(reqs.number, /[0-9]/.test(value));
        validateRequirement(reqs.special, /[!@#$%^&*]/.test(value));
    });

    function validateRequirement(element, isValid) {
        if (isValid) {
            element.classList.add('valid');
            element.classList.remove('invalid');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
        }
    }

    // --- DEBOUNCED USERNAME AVAILABILITY CHECK ---
    let debounceTimer;
    usernameInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const username = usernameInput.value;
            if (username.length < 3) {
                usernameError.textContent = "Username must be at least 3 characters.";
                return;
            }
            checkUsernameAvailability(username);
        }, 500); // Wait for 500ms after user stops typing
    });

    async function checkUsernameAvailability(username) {
        usernameError.textContent = "Checking...";
        const querySnapshot = await db.collection('users').where('username', '==', username).get();
        if (!querySnapshot.empty) {
            usernameError.textContent = "Username is already taken.";
        } else {
            usernameError.textContent = "";
        }
    }


    // --- FORM SUBMISSION HANDLING ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = ""; // Clear previous form errors

        // --- FINAL VALIDATION CHECKS ---
        if (passwordInput.value !== confirmPasswordInput.value) {
            formError.textContent = "Passwords do not match.";
            return;
        }
        if (usernameError.textContent !== "") {
            formError.textContent = "Please choose an available username.";
            return;
        }
        const isPasswordValid = Object.values(reqs).every(req => req.classList.contains('valid'));
        if (!isPasswordValid) {
            formError.textContent = "Please ensure your password meets all requirements.";
            return;
        }
        if (grecaptcha.getResponse().length === 0) {
            formError.textContent = "Please complete the CAPTCHA.";
            return;
        }

        // --- ACCOUNT CREATION ---
        try {
            const email = emailInput.value;
            const password = passwordInput.value;
            const username = usernameInput.value;

            // Step 1: Create the user in Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Step 2 (Server-side): An 'onCreate' Cloud Function will securely create the user's
            // document in Firestore with username, status, etc. We will write this next.
            // For now, we update the user's display name on the Auth object.
            await user.updateProfile({ displayName: username });

            // Step 3: Send the verification email
            await user.sendEmailVerification();

            // Success! Inform the user.
            form.innerHTML = `<h2>Account Created!</h2><p>Please check your email at <strong>${email}</strong> to verify your account before you can log in.</p>`;

        } catch (error) {
            // Handle errors from Firebase
            if (error.code === 'auth/email-already-in-use') {
                formError.textContent = "This email address is already registered.";
            } else {
                formError.textContent = "Failed to create account. Please try again.";
            }
            console.error("Signup Error:", error);
            grecaptcha.reset();
        }
    });
}
