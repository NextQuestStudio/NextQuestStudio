document.addEventListener('DOMContentLoaded', () => {
    // Select elements from the workspace page
    const userDisplayName = document.getElementById('user-display-name');
    const logoutBtn = document.getElementById('logout-btn');
    const projectsContainer = document.getElementById('projects-container');

    // =========================================================================
    // PAGE GUARD & DATA FETCHING
    // =========================================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in. Now, verify they are an admin.
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // User is an admin. Populate user info and fetch their projects.
                    if (userDisplayName) {
                        userDisplayName.textContent = user.email;
                    }
                    fetchUserProjects(user.uid);
                } else {
                    // User is not an admin.
                    auth.signOut();
                    window.location.replace('login.html');
                }
            }).catch(error => {
                console.error("Error fetching user role:", error);
                auth.signOut();
                window.location.replace('login.html');
            });
        } else {
            // No user is signed in. Redirect to login.
            window.location.replace('login.html');
        }
    });


    // =========================================================================
    // LOGOUT FUNCTIONALITY
    // =========================================================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.replace('login.html');
            }).catch(error => {
                console.error("Sign out error:", error);
            });
        });
    }

    // =========================================================================
    // FIRESTORE DATA FUNCTIONS
    // =========================================================================

    /**
     * Fetches and displays projects from Firestore where the user is a team member.
     * @param {string} uid The logged-in user's UID.
     */
    function fetchUserProjects(uid) {
        if (!projectsContainer) return;

        // Query the 'projects' collection.
        // The 'array-contains' operator is perfect for checking if a user's UID is in the 'teamMembers' array.
        db.collection('projects')
            .where('teamMembers', 'array-contains', uid)
            .orderBy('createdAt', 'desc') // Show newest projects first
            .onSnapshot(querySnapshot => {
                // Clear the container
                projectsContainer.innerHTML = '';

                if (querySnapshot.empty) {
                    projectsContainer.innerHTML = `<p class="no-projects-text">You are not assigned to any projects yet.</p>`;
                    return;
                }

                // Loop through each project document and render it
                querySnapshot.forEach(doc => {
                    const project = doc.data();
                    const projectId = doc.id;
                    const projectCard = createProjectCard(project, projectId);
                    projectsContainer.appendChild(projectCard);
                });
            }, error => {
                console.error("Error fetching projects: ", error);
                projectsContainer.innerHTML = `<p class="no-projects-text">Error loading projects.</p>`;
            });
    }

    /**
     * Creates an HTML element for a single project card.
     * @param {object} projectData The data for one project.
     * @param {string} projectId The document ID of the project.
     * @returns {HTMLElement} The created card element.
     */
    function createProjectCard(projectData, projectId) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.id = projectId; // Store the project ID on the element

        card.innerHTML = `
            <div class="status ${projectData.status}">${projectData.status}</div>
            <h3>${projectData.projectName}</h3>
            <p>${projectData.description}</p>
        `;

        // We can add a click listener here later to open the project details
        card.addEventListener('click', () => {
            console.log(`Clicked on project: ${projectId}`);
            // window.location.href = `project-details.html?id=${projectId}`; // Example for later
        });

        return card;
    }
});

