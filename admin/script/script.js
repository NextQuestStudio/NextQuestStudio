// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// --- DOM Elements ---
const loginForm = document.getElementById('loginForm');
const loginStep = document.getElementById('login-step');
const otpStep = document.getElementById('otp-step');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const otpInput = document.getElementById('otp');
const loginButton = document.getElementById('loginButton');
const verifyOtpButton = document.getElementById('verifyOtpButton');
const errorMessage = document.getElementById('error-message');

let currentUser = null; // To hold user object between steps

// --- Step 1: Handle Initial Login (Email, Password, CAPTCHA) ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';
    loginButton.disabled = true;

    const email = emailInput.value;
    const password = passwordInput.value;
    const captchaResponse = grecaptcha.getResponse();

    if (email === '' || password === '') {
        errorMessage.textContent = 'Email and Password are required.';
        loginButton.disabled = false;
        return;
    }

    if (captchaResponse.length === 0) {
        errorMessage.textContent = 'Please complete the CAPTCHA.';
        loginButton.disabled = false;
        return;
    }

    try {
        // Sign in to get the user's token, but don't treat as fully logged in yet
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        // Call the Cloud Function to send the OTP
        const generateOtp = functions.httpsCallable('generateAndSendOtp');
        const result = await generateOtp({ userId: currentUser.uid, email: currentUser.email, captcha: captchaResponse });

        if (result.data.success) {
            // Hide login form, show OTP form
            loginStep.classList.add('hidden');
            otpStep.classList.remove('hidden');
            errorMessage.textContent = ''; // Clear previous errors
        } else {
            throw new Error(result.data.error || 'Failed to send access code.');
        }

    } catch (error) {
        console.error("Login Error:", error);
        errorMessage.textContent = error.message;
        await auth.signOut().catch(() => {}); // Ensure user is signed out on failure
        currentUser = null;
        loginButton.disabled = false;
        grecaptcha.reset(); // Reset CAPTCHA on failure
    }
});

// --- Step 2: Handle OTP Verification ---
verifyOtpButton.addEventListener('click', async () => {
    errorMessage.textContent = '';
    verifyOtpButton.disabled = true;
    const otp = otpInput.value;

    if (otp.length === 0) {
        errorMessage.textContent = 'Please enter the access code.';
        verifyOtpButton.disabled = false;
        return;
    }

    if (!currentUser) {
        errorMessage.textContent = 'Session expired. Please start over.';
        verifyOtpButton.disabled = false;
        return;
    }
    
    try {
        const verifyOtp = functions.httpsCallable('verifyOtp');
        const result = await verifyOtp({ userId: currentUser.uid, otp: otp });

        if (result.data.success) {
            // OTP is correct! User is now fully authenticated. Redirect.
            window.location.href = 'dashboard.html'; // SUCCESS
        } else {
            throw new Error(result.data.error || 'Invalid or expired access code.');
        }

    } catch (error) {
        console.error("OTP Verification Error:", error);
        errorMessage.textContent = error.message;
        verifyOtpButton.disabled = false;
    }
});
