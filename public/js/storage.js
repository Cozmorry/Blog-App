class StorageService {
    constructor() {
        // Initialize storage with default data if empty
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('posts')) {
            localStorage.setItem('posts', JSON.stringify([]));
        }
        if (!localStorage.getItem('comments')) {
            localStorage.setItem('comments', JSON.stringify([]));
        }
        if (!localStorage.getItem('likes')) {
            localStorage.setItem('likes', JSON.stringify([]));
        }
    }

    // User methods
    registerUser(username, email, password) {
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const newUser = {
            id: Date.now(),
            username,
            email,
            password // In a real app, you'd hash this
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

    // Post methods
    createPost(title, content, category, imageUrl = null) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const posts = this.getPosts();
        const newPost = {
            id: Date.now(),
            title,
            content,
            category,
            image_url: imageUrl,
            user_id: user.id,
            username: user.username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        return newPost;
    }

    getPosts() {
        return JSON.parse(localStorage.getItem('posts')) || [];
    }

    getUserPosts(userId) {
        const posts = this.getPosts();
        return posts.filter(post => post.user_id === userId);
    }

    getPost(postId) {
        const posts = this.getPosts();
        return posts.find(post => post.id === postId);
    }

    updatePost(postId, title, content, category, imageUrl = null) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const posts = this.getPosts();
        const postIndex = posts.findIndex(p => p.id === postId && p.user_id === user.id);
        if (postIndex === -1) throw new Error('Post not found or unauthorized');

        posts[postIndex] = {
            ...posts[postIndex],
            title,
            content,
            category,
            image_url: imageUrl || posts[postIndex].image_url,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem('posts', JSON.stringify(posts));
        return posts[postIndex];
    }

    deletePost(postId) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const posts = this.getPosts();
        const filteredPosts = posts.filter(p => !(p.id === postId && p.user_id === user.id));
        if (filteredPosts.length === posts.length) throw new Error('Post not found or unauthorized');
        
        localStorage.setItem('posts', JSON.stringify(filteredPosts));
        // Also delete related comments and likes
        this.deletePostComments(postId);
        this.deletePostLikes(postId);
    }

    // Comment methods
    addComment(postId, content) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const comments = this.getComments();
        const newComment = {
            id: Date.now(),
            post_id: postId,
            user_id: user.id,
            username: user.username,
            content,
            created_at: new Date().toISOString()
        };
        comments.push(newComment);
        localStorage.setItem('comments', JSON.stringify(comments));
        return newComment;
    }

    getComments() {
        return JSON.parse(localStorage.getItem('comments')) || [];
    }

    getPostComments(postId) {
        const comments = this.getComments();
        return comments.filter(comment => comment.post_id === postId);
    }

    deleteComment(commentId) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const comments = this.getComments();
        const filteredComments = comments.filter(c => !(c.id === commentId && c.user_id === user.id));
        localStorage.setItem('comments', JSON.stringify(filteredComments));
    }

    deletePostComments(postId) {
        const comments = this.getComments();
        const filteredComments = comments.filter(c => c.post_id !== postId);
        localStorage.setItem('comments', JSON.stringify(filteredComments));
    }

    // Like methods
    toggleLike(postId) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const likes = this.getLikes();
        const existingLike = likes.find(l => l.post_id === postId && l.user_id === user.id);

        if (existingLike) {
            // Unlike
            const filteredLikes = likes.filter(l => !(l.post_id === postId && l.user_id === user.id));
            localStorage.setItem('likes', JSON.stringify(filteredLikes));
            return false;
        } else {
            // Like
            likes.push({
                id: Date.now(),
                post_id: postId,
                user_id: user.id,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('likes', JSON.stringify(likes));
            return true;
        }
    }

    getLikes() {
        return JSON.parse(localStorage.getItem('likes')) || [];
    }

    getPostLikes(postId) {
        const likes = this.getLikes();
        return {
            count: likes.filter(l => l.post_id === postId).length,
            userLiked: this.getCurrentUser() 
                ? likes.some(l => l.post_id === postId && l.user_id === this.getCurrentUser().id)
                : false
        };
    }

    deletePostLikes(postId) {
        const likes = this.getLikes();
        const filteredLikes = likes.filter(l => l.post_id !== postId);
        localStorage.setItem('likes', JSON.stringify(filteredLikes));
    }

    // Helper methods
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
}

// Create a global instance
window.storage = new StorageService(); 