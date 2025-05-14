document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!isLoggedIn || !token || !userId) {
        window.location.href = './login.html';
        return;
    }

    // Get the current user
    const currentUser = userStorage.getCurrentUser();
    if (!currentUser) {
        window.location.href = './login.html';
        return;
    }

    // Get the form element
    const addPostForm = document.getElementById('add-post-form');
    
    if (addPostForm) {
        // Preview image functionality
        const coverPhotoInput = document.getElementById('cover-photo');
        let imageBase64 = null;
        
        if (coverPhotoInput) {
            coverPhotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Read the file and convert to base64 for storage
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        imageBase64 = event.target.result;
                        
                        // Show preview if desired
                        const previewContainer = document.querySelector('.preview-container');
                        if (previewContainer) {
                            previewContainer.innerHTML = `<img src="${imageBase64}" alt="Preview">`;
                            previewContainer.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        addPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const category = document.getElementById('category').value;
            
            if (!title || !content || !category) {
                alert('Please fill in all required fields');
                return;
            }

            // Show loading indicator
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Publishing...';
            submitBtn.disabled = true;
            
            try {
                // Create new post object
                const newPost = {
                    id: Date.now().toString(),
                    title,
                    content,
                    category,
                    image: imageBase64, // Store image as base64 string
                    userId: userId,
                    author: currentUser.username,
                    createdAt: new Date().toISOString()
                };
                
                // Save to localStorage
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                posts.push(newPost);
                localStorage.setItem('posts', JSON.stringify(posts));
                
                // Show success message
                alert('Post published successfully!');
                
                // Redirect to home page
                window.location.href = './home.html';
                
            } catch (error) {
                console.error('Error publishing post:', error);
                alert('Failed to publish post: ' + error.message);
            } finally {
                // Reset button state regardless of success/failure
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});