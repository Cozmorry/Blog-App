// Storage keys
const STORAGE_KEYS = {
    USERS: 'blog_users',
    POSTS: 'blog_posts',
    COMMENTS: 'blog_comments',
    LIKES: 'blog_likes',
    CURRENT_USER: 'current_user'
};

// Helper function to get data from localStorage
function getStorageItem(key, defaultValue = []) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
}

// Helper function to set data in localStorage
function setStorageItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// User Management
const userStorage = {
    getUsers() {
        return getStorageItem(STORAGE_KEYS.USERS);
    },
    
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        setStorageItem(STORAGE_KEYS.USERS, users);
    },
    
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    },
    
    setCurrentUser(user) {
        setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    },
    
    getCurrentUser() {
        return getStorageItem(STORAGE_KEYS.CURRENT_USER, null);
    },
    
    clearCurrentUser() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
};

// Post Management
const postStorage = {
    getPosts() {
        return getStorageItem(STORAGE_KEYS.POSTS);
    },
    
    addPost(post) {
        const posts = this.getPosts();
        posts.push({
            ...post,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        });
        setStorageItem(STORAGE_KEYS.POSTS, posts);
        return posts[posts.length - 1];
    },
    
    updatePost(postId, updatedPost) {
        const posts = this.getPosts();
        const index = posts.findIndex(post => post.id === postId);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
            setStorageItem(STORAGE_KEYS.POSTS, posts);
            return posts[index];
        }
        return null;
    },
    
    deletePost(postId) {
        const posts = this.getPosts();
        const filteredPosts = posts.filter(post => post.id !== postId);
        setStorageItem(STORAGE_KEYS.POSTS, filteredPosts);
        
        // Clean up related comments and likes
        commentStorage.deletePostComments(postId);
        likeStorage.deletePostLikes(postId);
    },
    
    getPostById(postId) {
        const posts = this.getPosts();
        return posts.find(post => post.id === postId);
    }
};

// Comment Management
const commentStorage = {
    getComments() {
        return getStorageItem(STORAGE_KEYS.COMMENTS);
    },
    
    addComment(postId, comment) {
        const comments = this.getComments();
        const newComment = {
            ...comment,
            id: Date.now().toString(),
            postId,
            createdAt: new Date().toISOString()
        };
        comments.push(newComment);
        setStorageItem(STORAGE_KEYS.COMMENTS, comments);
        return newComment;
    },
    
    getPostComments(postId) {
        const comments = this.getComments();
        return comments.filter(comment => comment.postId === postId);
    },
    
    deletePostComments(postId) {
        const comments = this.getComments();
        const filteredComments = comments.filter(comment => comment.postId !== postId);
        setStorageItem(STORAGE_KEYS.COMMENTS, filteredComments);
    }
};

// Like Management
const likeStorage = {
    getLikes() {
        return getStorageItem(STORAGE_KEYS.LIKES);
    },
    
    toggleLike(postId, userId) {
        const likes = this.getLikes();
        const existingLike = likes.find(like => 
            like.postId === postId && like.userId === userId
        );
        
        if (existingLike) {
            // Unlike
            const filteredLikes = likes.filter(like => 
                !(like.postId === postId && like.userId === userId)
            );
            setStorageItem(STORAGE_KEYS.LIKES, filteredLikes);
            return false;
        } else {
            // Like
            likes.push({
                id: Date.now().toString(),
                postId,
                userId,
                createdAt: new Date().toISOString()
            });
            setStorageItem(STORAGE_KEYS.LIKES, likes);
            return true;
        }
    },
    
    getPostLikes(postId) {
        const likes = this.getLikes();
        return likes.filter(like => like.postId === postId);
    },
    
    hasUserLiked(postId, userId) {
        const likes = this.getLikes();
        return likes.some(like => 
            like.postId === postId && like.userId === userId
        );
    },
    
    deletePostLikes(postId) {
        const likes = this.getLikes();
        const filteredLikes = likes.filter(like => like.postId !== postId);
        setStorageItem(STORAGE_KEYS.LIKES, filteredLikes);
    }
};

// Initialize storage - make sure all required storage items exist
function initializeStorage() {
    // Initialize users if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    
    // Initialize posts if not exists
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
    }
    
    // Initialize comments if not exists
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
    }
    
    // Initialize likes if not exists
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify([]));
    }
    
    console.log('Storage initialized', {
        users: getStorageItem(STORAGE_KEYS.USERS).length,
        posts: getStorageItem(STORAGE_KEYS.POSTS).length,
        comments: getStorageItem(STORAGE_KEYS.COMMENTS).length,
        likes: getStorageItem(STORAGE_KEYS.LIKES).length
    });
}

// Run initialization when the script loads
initializeStorage();

// Export all storage modules
window.userStorage = userStorage;
window.postStorage = postStorage;
window.commentStorage = commentStorage;
window.likeStorage = likeStorage; 