// Check authentication
if (!storage.getCurrentUser()) {
    window.location.href = '/login.html';
}

// Handle form submission
document.getElementById('addPostForm').addEventListener('submit', async (e) => {
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
        
        storage.createPost(title, content, category, imageUrl);
        window.location.href = '/blog.html';
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again later.');
    }
});