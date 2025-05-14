// Debug script to examine localStorage contents
console.log("=== DEBUG STORAGE INFO ===");

// Check if posts exist in different storage keys
const possiblePostKeys = [
    'posts',
    'blog_posts',
    'blogPosts',
    'userPosts'
];

// Display all localStorage keys
console.log("All localStorage keys:");
Object.keys(localStorage).forEach(key => {
    try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        const itemCount = Array.isArray(parsed) ? parsed.length : 'not an array';
        console.log(`${key}: ${itemCount} items`);
        
        // If this is a potential posts array, log more details
        if (possiblePostKeys.includes(key) || key.includes('post')) {
            console.log(`Details for ${key}:`, parsed);
        }
    } catch (e) {
        console.log(`${key}: [not JSON data]`);
    }
});

// Check actual storage module data
console.log("\nStorage module data:");
if (window.postStorage) {
    const posts = window.postStorage.getPosts();
    console.log("postStorage.getPosts():", posts);
    console.log("Post count:", posts.length);
} else {
    console.log("window.postStorage is not available!");
}

// Check for migration issues
console.log("\nChecking for migration issues:");
const directPosts = localStorage.getItem('posts');
const storagePosts = localStorage.getItem('blog_posts');

if (directPosts && !storagePosts) {
    console.log("FOUND ISSUE: Posts exist in 'posts' key but not in 'blog_posts'");
    console.log("This might be causing your posts not to show up");
    
    // Suggest fix
    console.log("\nTO FIX: Add this code to migrate posts:");
    console.log(`
// Migrate posts from 'posts' key to 'blog_posts' key
const oldPosts = JSON.parse(localStorage.getItem('posts') || '[]');
if (oldPosts.length > 0) {
    localStorage.setItem('blog_posts', JSON.stringify(oldPosts));
    console.log('Migrated', oldPosts.length, 'posts from old storage');
}
    `);
}

// Create migrate function
window.migrateOldPosts = function() {
    try {
        const oldPosts = JSON.parse(localStorage.getItem('posts') || '[]');
        if (oldPosts.length > 0) {
            localStorage.setItem('blog_posts', JSON.stringify(oldPosts));
            alert(`Migrated ${oldPosts.length} posts from old storage. Refresh the page to see them.`);
            return true;
        } else {
            alert('No old posts found to migrate');
            return false;
        }
    } catch (e) {
        console.error('Error during migration:', e);
        alert('Error during migration: ' + e.message);
        return false;
    }
};

console.log("\nDebug functions available:");
console.log("- window.migrateOldPosts(): Migrate posts from 'posts' to 'blog_posts'");
console.log("=== END DEBUG INFO ==="); 