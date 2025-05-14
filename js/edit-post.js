document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!isLoggedIn || !token || !userId) {
        window.location.href = './login.html';
        return;
    }
    
    // Get the post ID to edit from localStorage
    const postId = localStorage.getItem('editPostId');
    if (!postId) {
        // No post ID found, redirect to home
        alert('No post selected for editing');
        window.location.href = './home.html';
        return;
    }
    
    // Load the post data for editing
    loadPostForEditing(postId);
});

// Load post data from localStorage for editing
function loadPostForEditing(postId) {
    try {
        // Show loading message
        document.getElementById('loading-message').style.display = 'flex';
        document.getElementById('edit-post-form').style.display = 'none';
        
        // Get posts from localStorage
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postToEdit = posts.find(post => post.id === postId);
        
        if (!postToEdit) {
            throw new Error('Post not found');
        }
        
        // Check if the user is the author of the post
        const userId = localStorage.getItem('userId');
        if (postToEdit.userId !== userId) {
            throw new Error('You are not authorized to edit this post');
        }
        
        // Hide the loading message and show the form
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('edit-post-form').style.display = 'block';
        
        // Fill the form with post data
        document.getElementById('title').value = postToEdit.title || '';
        document.getElementById('content').value = postToEdit.content || '';
        document.getElementById('post-id').value = postToEdit.id;
        
        // Set the category
        const categorySelect = document.getElementById('category');
        if (postToEdit.category) {
            // Find and select the matching option
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === postToEdit.category) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Display the current image
        const currentImage = document.getElementById('current-image');
        const imageContainer = document.getElementById('current-image-container');
        
        if (postToEdit.image) {
            currentImage.src = postToEdit.image;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
        
        // Set up image preview for new uploads
        const coverPhotoInput = document.getElementById('cover-photo');
        if (coverPhotoInput) {
            coverPhotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Read the file and convert to base64 for storage
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        currentImage.src = event.target.result;
                        imageContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Set up form submission
        const editForm = document.getElementById('edit-post-form');
        if (editForm) {
            editForm.addEventListener('submit', handleFormSubmit);
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('loading-message').innerHTML = `
            <div class="error-message">
                <p>Failed to load post data: ${error.message}</p>
                <button onclick="window.location.href='./home.html'" class="secondary-btn">Back to Home</button>
            </div>
        `;
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const postId = document.getElementById('post-id').value;
    const coverPhotoInput = document.getElementById('cover-photo');
    
    if (!title || !content || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        // Get posts from localStorage
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex === -1) {
            throw new Error('Post not found');
        }
        
        // Get the post to update
        const postToUpdate = posts[postIndex];
        
        // Check if the user is the author of the post
        const userId = localStorage.getItem('userId');
        if (postToUpdate.userId !== userId) {
            throw new Error('You are not authorized to edit this post');
        }
        
        // Update post data
        postToUpdate.title = title;
        postToUpdate.content = content;
        postToUpdate.category = category;
        postToUpdate.updatedAt = new Date().toISOString();
        
        // Update image if a new one is selected
        if (coverPhotoInput.files.length > 0) {
            const file = coverPhotoInput.files[0];
            const reader = new FileReader();
            
            // Convert to Promise to use async/await
            const readFileAsDataURL = () => {
                return new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };
            
            // Update the image
            postToUpdate.image = await readFileAsDataURL();
        }
        
        // Update the post in the posts array
        posts[postIndex] = postToUpdate;
        
        // Save back to localStorage
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Show success message
        alert('Post updated successfully!');
        
        // Redirect back to home page
        window.location.href = './home.html';
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post: ' + error.message);
    } finally {
        // Reset button state regardless of success/failure
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = originalText || 'Update Post';
            submitBtn.disabled = false;
        }
    }
} 