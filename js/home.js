document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    
    if (!isLoggedIn || !token) {
        window.location.href = './index.html';
        return;
    }

    // Initialize hamburger menu
    initializeHamburgerMenu();
    
    // Initialize search functionality
    initializeSearch();

    // Load user posts
    loadUserPosts();
});

// Initialize hamburger menu
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const posts = document.querySelectorAll('.blog-post');
        
        posts.forEach(post => {
            const title = post.querySelector('h3').textContent.toLowerCase();
            const content = post.querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm) || content.includes(searchTerm);
            post.style.display = isVisible ? 'flex' : 'none';
        });
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Base64 encoded placeholder image (gray rectangle with text)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAGQAQMAAABbwG+aAAAABlBMVEX///+AgIBrWbWJAAAB2UlEQVR4nO3VsY3kMAxGYQqH4JCU4tCUotKUopS0EpRCQgppmM34/2VIeXfYXT9EQMgLPM8wRYriB5KAD0mSJEnvEn5Z/yP8J4B/r1iCEWXEJrBiRQYXAgp58JhKPWfFYe6aNNOEAigVtjJWnBjrGBIsTI0BUUZsrMEAiHWMNRrAWhQrXszZkAZEGUO3mOoEVtQigT2zPu5ArjLbSAxZkC61MoCtSGA42YQo46s8sALPqcbPJoSQYbJOYUKU0afVm1qRAAnMiDJY51qcmJJqcJCwYLZWdQaQLsVBojbBWGrHnJhgxYwVTXhOFViZUCmujDVbMSFW1EphxoIVE2acaEIqjEpiwYKJlWJFE7JtwOvCeLIFEyLF7MWKJgSKvQksDIis2FhJTGhCJB1YE4uxoi60nwvMaEJYnNXOqg1RSaxYsCHQirBWVkSKeQlEGdx+LCQWrIhmgclZca3YsOE5VmNFVwKpYsGKQDpjsTI2bEiDgJXFgSojMCpn3nwDImQlEGVEYLFhxYoJmVkRzMysjDgDBT4nVjr/RsSYYEJmDLCiCZHWuQMD6rwDmZE1KmPF22TFjAURJmZ9PB3+TtlYWRkbNmREbcLCiBXRGBs2JEmSJEmSJEmS/ls/+AZPmYz7uYgAAAAASUVORK5CYII=';

// Load user posts from localStorage
async function loadUserPosts() {
    const postsContainer = document.getElementById('user-posts-container');
    if (!postsContainer) return;

    try {
        const userId = localStorage.getItem('userId');
        
        // Get posts from the storage module and filter by current user
        const allPosts = window.postStorage.getPosts();
        const posts = allPosts.filter(post => post.userId === userId);
        
        // Clear the container
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <p>You haven't created any posts yet.</p>
                    <a href="./add-post.html" class="cta-button"><i class="fas fa-plus"></i> Create Your First Post</a>
                </div>
            `;
            return;
        }

        // Generate HTML for each post
        posts.forEach(post => {
            const postEl = document.createElement('article');
            postEl.className = 'blog-post';
            
            // Use post image or placeholder
            const imageSrc = post.image || PLACEHOLDER_IMAGE;
            
            // Format the date
            const formattedDate = new Date(post.createdAt).toLocaleDateString();
            
            postEl.innerHTML = `
                <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                <div class="post-content">
                    <div class="post-meta">
                        <span class="date">${formattedDate}</span>
                        <span class="category">${post.category || 'Uncategorized'}</span>
                        <span class="author">By: ${post.author || 'Anonymous'}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-actions">
                        <button class="read-more-btn" data-id="${post.id}">Read More</button>
                        <div class="edit-actions">
                            <button class="edit-btn" data-id="${post.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="delete-btn" data-id="${post.id}"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postEl);
        });

        // Add event listeners for buttons
        setupEditButtons();
        setupDeleteButtons();
        setupReadMoreButtons();
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load posts: ${error.message}</p>
                <button onclick="loadUserPosts()" class="secondary-btn">Retry</button>
            </div>
        `;
    }
}

// Set up read more buttons
function setupReadMoreButtons() {
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.dataset.id;
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                showPostModal(post);
            }
        });
    });
}

// Show post modal
function showPostModal(post) {
    // Check if a modal already exists and remove it
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Format the date
    const formattedDate = new Date(post.createdAt).toLocaleDateString();
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${post.category || 'Uncategorized'}</span>
                <span class="author">By: ${post.author || 'Anonymous'}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="modal-image">` : ''}
            <div class="post-content">
                ${post.content}
            </div>
        </div>
    `;
    
    // Add the modal to the document
    document.body.appendChild(modal);
    
    // Make the modal visible with a fade-in effect
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close modal when clicking the close button or outside the modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal(modal);
        }
    });
    
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
}

// Function to close the modal with a fade-out effect
function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    }, 300);
}

// Set up edit buttons
function setupEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.closest('.edit-btn').dataset.id;
            localStorage.setItem('editPostId', postId);
            window.location.href = './edit-post.html';
        });
    });
}

// Set up delete buttons
function setupDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const postId = e.target.closest('.delete-btn').dataset.id;
            
            if (confirm('Are you sure you want to delete this post?')) {
                try {
                    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                    const updatedPosts = posts.filter(post => post.id !== postId);
                    localStorage.setItem('posts', JSON.stringify(updatedPosts));
                    
                    // Reload posts
                    loadUserPosts();
                } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post: ' + error.message);
                }
            }
        });
    });
}