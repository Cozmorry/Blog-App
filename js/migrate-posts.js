/**
 * This script helps migrate existing localStorage posts to the database
 * It should be included in pages where users might have existing posts
 */

// Script to migrate posts from old to new storage format
console.log("Post migration script loaded");

// Debug helper to show storage information
function logStorageInfo() {
    try {
        const oldPosts = JSON.parse(localStorage.getItem('posts') || '[]');
        const newPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        
        console.log("Storage info:");
        console.log(`- 'posts' key: ${oldPosts.length} posts`);
        console.log(`- 'blog_posts' key: ${newPosts.length} posts`);
        
        return { oldPosts, newPosts };
    } catch (e) {
        console.error("Error checking storage:", e);
        return { oldPosts: [], newPosts: [] };
    }
}

// Function to migrate posts from 'posts' to 'blog_posts'
function migratePosts() {
    try {
        const { oldPosts, newPosts } = logStorageInfo();
        
        if (oldPosts.length === 0) {
            console.log("No posts to migrate");
            return false;
        }
        
        // If we already have posts in blog_posts, we need to merge carefully
        if (newPosts.length > 0) {
            console.log("Both storage locations have posts. Merging...");
            
            // Create a map of existing post IDs to avoid duplicates
            const existingIds = new Set(newPosts.map(post => post.id));
            
            // Add posts that don't already exist
            let addedCount = 0;
            oldPosts.forEach(post => {
                if (!existingIds.has(post.id)) {
                    newPosts.push(post);
                    addedCount++;
                }
            });
            
            // Save merged posts
            localStorage.setItem('blog_posts', JSON.stringify(newPosts));
            console.log(`Migration complete: Added ${addedCount} posts`);
    } else {
            // Simple case - just copy posts over
            localStorage.setItem('blog_posts', JSON.stringify(oldPosts));
            console.log(`Migration complete: Copied ${oldPosts.length} posts`);
        }
        
        // Re-check storage
        logStorageInfo();
        return true;
    } catch (e) {
        console.error("Error migrating posts:", e);
        return false;
    }
}

// Full cleanup utility
function fullCleanup() {
    try {
        // Migrate any posts from old to new format
        migratePosts();
        
        // Ensure all storage items are properly initialized
        const storageKeys = ['blog_users', 'blog_posts', 'blog_comments', 'blog_likes'];
        
        storageKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
                console.log(`Initialized empty ${key}`);
            }
        });
        
        // Fix any posts that might have missing properties
        const posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        let fixedCount = 0;
        
        posts.forEach(post => {
            let fixed = false;
            
            // Ensure required fields exist
            if (!post.createdAt) {
                post.createdAt = new Date().toISOString();
                fixed = true;
            }
            
            if (!post.category) {
                post.category = 'Uncategorized';
                fixed = true;
            }
            
            if (!post.author) {
                post.author = 'Anonymous';
                fixed = true;
            }
            
            if (fixed) fixedCount++;
        });
        
        // Save fixed posts
        if (fixedCount > 0) {
            localStorage.setItem('blog_posts', JSON.stringify(posts));
            console.log(`Fixed ${fixedCount} posts`);
        }
        
        return true;
    } catch (e) {
        console.error("Error during cleanup:", e);
        return false;
    }
}

// Export utilities as debug tools
window.debugPosts = {
    migratePosts,
    logStorageInfo,
    fullCleanup
};

// Run migration on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only run if we detect posts in the old format
    const oldPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    if (oldPosts.length > 0) {
        console.log(`Found ${oldPosts.length} posts in old format. Migrating...`);
        migratePosts();
    }
});

/**
 * Migrate posts from localStorage to the database
 * @param {Array} posts - Array of posts from localStorage
 */
async function migratePostsToDatabase(posts) {
    const token = localStorage.getItem('token');
    const migrateProgressModal = createMigrationModal(posts.length);
    
    document.body.appendChild(migrateProgressModal);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process each post
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const progressBar = document.getElementById('migration-progress');
        const statusText = document.getElementById('migration-status');
        
        // Update UI
        statusText.textContent = `Migrating post ${i + 1} of ${posts.length}: ${post.title}`;
        progressBar.value = ((i + 1) / posts.length) * 100;
        
        try {
            // Create post via API
            const formData = new FormData();
            formData.append('title', post.title);
            formData.append('content', post.content);
            formData.append('category', post.category || 'Uncategorized');
            
            // If there's a coverPhoto that's a data URL, convert it to a file
            if (post.coverPhoto && post.coverPhoto.startsWith('data:image')) {
                const blob = await dataURLtoBlob(post.coverPhoto);
                formData.append('image', blob, 'cover-image.jpg');
            }
            
            // Get the base URL of the site - use localStorage config if available
            const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
            const apiUrl = `${apiBaseUrl}/api/posts`;
            
            // Send the request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Failed to migrate post: ${post.title}`);
            }
            
            successCount++;
        } catch (error) {
            console.error('Error migrating post:', error);
            failedCount++;
        }
        
        // Slight delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Show completion status
    const progressBar = document.getElementById('migration-progress');
    const statusText = document.getElementById('migration-status');
    const actionButton = document.getElementById('migration-action');
    
    progressBar.value = 100;
    statusText.textContent = `Migration complete! ${successCount} posts migrated successfully, ${failedCount} failed.`;
    actionButton.textContent = 'Close';
    actionButton.onclick = () => {
        document.body.removeChild(migrateProgressModal);
        
        // Mark migration as complete
        localStorage.setItem('postsMigrated', 'true');
        
        // Reload the page to show the updated posts
        window.location.reload();
    };
}

/**
 * Create a modal dialog to show migration progress
 * @param {number} totalPosts - Total number of posts to migrate
 * @returns {HTMLElement} The created modal element
 */
function createMigrationModal(totalPosts) {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="post-modal-content" style="max-width: 500px;">
            <h2>Migrating Posts</h2>
            <p id="migration-status">Preparing to migrate ${totalPosts} posts...</p>
            <progress id="migration-progress" value="0" max="100" style="width: 100%; height: 20px;"></progress>
            <p style="margin-top: 20px; color: #666;">Please do not close this page during migration.</p>
            <button id="migration-action" class="primary-btn" style="display: none;">Close</button>
        </div>
    `;
    
    return modal;
}

/**
 * Convert a data URL to a Blob object
 * @param {string} dataURL - The data URL to convert
 * @returns {Blob} A Blob object created from the data URL
 */
async function dataURLtoBlob(dataURL) {
    // Convert base64 to raw binary data held in a string
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const byteString = atob(parts[1]);
    
    // Create an ArrayBuffer with the binary data
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    
    // Return a Blob object
    return new Blob([arrayBuffer], { type: contentType });
} 