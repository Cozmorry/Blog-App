document.addEventListener('DOMContentLoaded', () => {
    // Load all blog posts
    loadAllPosts();
    
    // Set up search functionality
    setupSearch();
    
    // Set up mobile menu
    setupMobileMenu();
    
    // Check for search query in URL
    checkForSearchQuery();
});

// Check for search query in URL and perform search if found
function checkForSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        // Set the search input value
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchTerm;
        }
        
        // Perform the search
        performSearch(searchTerm);
    }
}

// Base64 encoded placeholder image (gray rectangle with text)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAGQAQMAAABbwG+aAAAABlBMVEX///+AgIBrWbWJAAAB2UlEQVR4nO3VsY3kMAxGYQqH4JCU4tCUotKUopS0EpRCQgppmM34/2VIeXfYXT9EQMgLPM8wRYriB5KAD0mSJEnvEn5Z/yP8J4B/r1iCEWXEJrBiRQYXAgp58JhKPWfFYe6aNNOEAigVtjJWnBjrGBIsTI0BUUZsrMEAiHWMNRrAWhQrXszZkAZEGUO3mOoEVtQigT2zPu5ArjLbSAxZkC61MoCtSGA42YQo46s8sALPqcbPJoSQYbJOYUKU0afVm1qRAAnMiDJY51qcmJJqcJCwYLZWdQaQLsVBojbBWGrHnJhgxYwVTXhOFViZUCmujDVbMSFW1EphxoIVE2acaEIqjEpiwYKJlWJFE7JtwOvCeLIFEyLF7MWKJgSKvQksDIis2FhJTGhCJB1YE4uxoi60nwvMaEJYnNXOqg1RSaxYsCHQirBWVkSKeQlEGdx+LCQWrIhmgclZca3YsOE5VmNFVwKpYsGKQDpjsTI2bEiDgJXFgSojMCpn3nwDImQlEGVEYLFhxYoJmVkRzMysjDgDBT4nVjr/RsSYYEJmDLCiCZHWuQMD6rwDmZE1KmPF22TFjAURJmZ9PB3+TtlYWRkbNmREbcLCiBXRGBs2JEmSJEmSJEmS/ls/+AZPmYz7uYgAAAAASUVORK5CYII=';

// Load all blog posts from localStorage
function loadAllPosts() {
    const blogPostsContainer = document.querySelector('.blog-posts');
    if (!blogPostsContainer) return;
    
    try {
        // Clear any existing content and show loading indicator
        blogPostsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading posts...</p>
            </div>
        `;
        
        console.log('Accessing window.postStorage:', window.postStorage);
        
        // Get posts from postStorage module
        let blogPosts = [];
        try {
            blogPosts = window.postStorage.getPosts();
            console.log('Retrieved posts:', blogPosts);
        } catch (error) {
            console.error('Error getting posts from storage:', error);
            // Fallback to direct localStorage access if storage module fails
            blogPosts = JSON.parse(localStorage.getItem('posts') || '[]');
            console.log('Retrieved posts from direct localStorage:', blogPosts);
        }
        
        // Clear loading indicator
        blogPostsContainer.innerHTML = '';
        
        if (!blogPosts || blogPosts.length === 0) {
            // Display message if no posts exist
            blogPostsContainer.innerHTML = `
                <div class="no-posts">
                    <p>No blog posts available yet.</p>
                    <a href="./add-post.html" class="cta-button">
                        <i class="fas fa-plus"></i> Create First Post
                    </a>
                </div>
            `;
            return;
        }
        
        // Sort posts by date (newest first)
        const sortedPosts = blogPosts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        console.log('Sorted posts:', sortedPosts);
        
        // Create and append blog posts
        sortedPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        blogPostsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load posts: ${error.message}</p>
                <button onclick="loadAllPosts()" class="secondary-btn">Retry</button>
            </div>
        `;
    }
}

// Create a blog post element
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    
    // Use post image or placeholder
    const imageSrc = post.image || PLACEHOLDER_IMAGE;
    
    // Format the date
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date';
    
    article.innerHTML = `
        <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="post-content">
            <div class="post-meta">
                <span class="date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="category"><i class="fas fa-tag"></i> ${post.category || 'Uncategorized'}</span>
                <span class="author"><i class="far fa-user"></i> ${post.author || 'Anonymous'}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <div class="post-actions">
                <a href="#" class="read-more" data-id="${post.id}">
                    <i class="fas fa-book-reader"></i> Read More
                </a>
                <div class="post-interactions">
                    <button class="like-button ${hasUserLiked(post.id) ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${getPostLikes(post.id).length}</span>
                    </button>
                    <button class="comment-count" onclick="showComments('${post.id}')">
                        <i class="fas fa-comments"></i>
                        <span>${getPostComments(post.id).length}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for "Read More" button
    const readMoreBtn = article.querySelector('.read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPostModal(post);
        });
    }
    
    return article;
}

// Show post modal with comments
function showPostModal(post) {
    // Remove any existing modals
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    const comments = getPostComments(post.id);
    const imageSrc = post.image || PLACEHOLDER_IMAGE;
    const formattedDate = new Date(post.createdAt).toLocaleDateString();
                
                // Create comment HTML
                const commentsHtml = comments.length > 0 
                    ? comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                    <span class="comment-author"><i class="far fa-user"></i> ${comment.author}</span>
                    <span class="comment-date"><i class="far fa-clock"></i> ${new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="comment-content">${comment.content}</div>
                        </div>
                    `).join('')
        : '<p>No comments yet. Be the first to comment!</p>';
                
    // Create and show modal
                const modal = document.createElement('div');
    modal.className = 'modal';
                modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
                        <h2>${post.title}</h2>
                        <div class="post-meta">
                <span class="date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="category"><i class="fas fa-tag"></i> ${post.category || 'Uncategorized'}</span>
                <span class="author"><i class="far fa-user"></i> ${post.author || 'Anonymous'}</span>
            </div>
            <img src="${imageSrc}" alt="${post.title}" class="modal-image" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="post-content">
                ${post.content}
            </div>
            
            <div class="post-interactions">
                <button class="like-button ${hasUserLiked(post.id) ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${getPostLikes(post.id).length}</span>
                </button>
                        </div>
                        
                        <div class="comments-section">
                            <h3>Comments (${comments.length})</h3>
                            <div class="comments-list">
                                ${commentsHtml}
                            </div>
                            <div class="add-comment-section">
                                <h4>Add a Comment</h4>
                    <textarea id="commentText" placeholder="Write your comment here..."></textarea>
                    <button class="primary-btn" onclick="addComment('${post.id}')">
                        <i class="fas fa-paper-plane"></i> Post Comment
                    </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
    
    // Make the modal visible with a fade-in effect
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
                
                // Add event listener for closing the modal
    const closeButton = modal.querySelector('.close');
                closeButton.addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Close modal when clicking outside
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

// Close modal with fade-out effect
function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    }, 300);
}

// Check if current user has liked a post
function hasUserLiked(postId) {
    const userId = localStorage.getItem('userId');
    if (!userId) return false;
    
    return window.likeStorage.hasUserLiked(postId, userId);
}

// Get likes for a post
function getPostLikes(postId) {
    return window.likeStorage.getPostLikes(postId);
}

// Get comments for a post
function getPostComments(postId) {
    return window.commentStorage.getPostComments(postId);
}

// Toggle like status for a post
function toggleLike(postId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please log in to like posts');
        window.location.href = './login.html';
        return;
    }
    
    // Toggle the like status using the likeStorage module
    const isLiked = window.likeStorage.toggleLike(postId, userId);
    
    // Update like button UI
    const likeButtons = document.querySelectorAll(`.like-button[onclick="toggleLike('${postId}')"]`);
    likeButtons.forEach(button => {
        const likeCount = button.querySelector('.like-count');
        const likesCount = window.likeStorage.getPostLikes(postId).length;
        
        if (isLiked) {
            button.classList.add('liked');
        } else {
            button.classList.remove('liked');
        }
        
        likeCount.textContent = likesCount;
    });
}

// Add a comment to a post
function addComment(postId) {
    // Get the current user from userStorage
    const currentUser = userStorage.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        alert('Please log in to comment');
        window.location.href = './login.html';
        return;
    }
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }
    
    // Create and save the comment
    const newComment = window.commentStorage.addComment(postId, {
        userId: currentUser.id,
        author: currentUser.username,
        content: commentText
    });
    
    // Clear the comment text area
    document.getElementById('commentText').value = '';
    
    // Add the new comment to the comments list
    const commentsList = document.querySelector('.comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <div class="comment-header">
            <span class="comment-author"><i class="far fa-user"></i> ${newComment.author}</span>
            <span class="comment-date"><i class="far fa-clock"></i> ${new Date(newComment.createdAt).toLocaleString()}</span>
        </div>
        <div class="comment-content">${newComment.content}</div>
    `;
    commentsList.appendChild(commentElement);
    
    // Update comment count
    const countElement = document.querySelector('.comments-section h3');
    const commentsCount = window.commentStorage.getPostComments(postId).length;
    countElement.textContent = `Comments (${commentsCount})`;
}

// Set up search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
    }
}

// Perform search
function performSearch(searchTerm) {
    // Use window.postStorage to access the storage module
    const blogPosts = window.postStorage.getPosts();
    const searchLower = searchTerm.toLowerCase();
    
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.category.toLowerCase().includes(searchLower)
    );
    
    const blogPostsContainer = document.querySelector('.blog-posts');
    if (!blogPostsContainer) return;
    
    blogPostsContainer.innerHTML = '';
    
    if (filteredPosts.length === 0) {
        blogPostsContainer.innerHTML = `
            <div class="no-posts">
                <p>No posts found matching "${searchTerm}"</p>
                <button onclick="loadAllPosts()" class="secondary-btn">
                    <i class="fas fa-undo"></i> Show All Posts
                </button>
                </div>
            `;
            return;
        }
        
        filteredPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsContainer.appendChild(postElement);
        });
}

// Set up mobile menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
} 