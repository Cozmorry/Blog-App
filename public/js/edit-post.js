// Check authentication
if (!storage.getCurrentUser()) {
    window.location.href = '/login.html';
}

// Get post ID from URL
const urlParams = new URLSearchParams(window.location.search);
const postId = parseInt(urlParams.get('id'));

if (!postId) {
    window.location.href = '/blog.html';
}

// Load post data
document.addEventListener('DOMContentLoaded', () => {
    const post = storage.getPost(postId);
    
    if (!post || post.user_id !== storage.getCurrentUser().id) {
        window.location.href = '/blog.html';
        return;
    }
    
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;
    document.getElementById('category').value = post.category || 'Uncategorized';
    
    if (post.image_url) {
        document.getElementById('currentImage').src = post.image_url;
        document.getElementById('currentImageContainer').style.display = 'block';
    }
});

// Handle form submission
document.getElementById('editPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const imageInput = document.getElementById('image');
    
    try {
        let imageUrl = null;
        if (imageInput.files.length > 0) {
            // Handle image upload (store as data URL)
            const file = imageInput.files[0];
            imageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }
        
        storage.updatePost(postId, title, content, category, imageUrl);
        window.location.href = '/blog.html';
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Error updating post. Please try again later.');
    }
}); 