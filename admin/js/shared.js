// =========================================================================
// 1. FIREBASE INITIALIZATION
// =========================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "next-quest-studios.firebaseapp.com",
  projectId: "next-quest-studios",
  storageBucket: "next-quest-studios.appspot.com",
  messagingSenderId: "428011767655",
  appId: "1:428011767655:web:8a43987aea19616d7211c2",
  measurementId: "G-Z4MTHCZLDD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create global aliases for the services we will use
const auth = firebase.auth();
const db = firebase.firestore();


// =========================================================================
// 2. SHARED HELPER FUNCTIONS
// =========================================================================

/**
 * Displays an error message in a designated element.
 * @param {string} message The error message to display.
 */
function displayError(message) {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        errorContainer.textContent = message;
    }
}


// =========================================================================
// 3. SHARED VISUAL EFFECTS (PARTICLE BACKGROUND)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];

    const particleConfig = {
        count: 80,
        color: 'rgba(0, 170, 255, 0.6)'
    };

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() * 2 - 1) * 0.5;
            this.speedY = (Math.random() * 2 - 1) * 0.5;
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }
        draw() {
            ctx.fillStyle = particleConfig.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleConfig.count; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        requestAnimationFrame(animateParticles);
    }
    
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
});
              
