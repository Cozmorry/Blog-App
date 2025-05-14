// API endpoint
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const authForm = document.querySelector('.auth-form');
const errorMessage = document.querySelector('.error-message');
const successMessage = document.querySelector('.success-message');

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }
}

// Show success message
function showSuccess(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }
}

// Handle form submission
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(authForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const endpoint = window.location.pathname.includes('login') ? '/login' : '/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'An error occurred');
            }
            
            if (endpoint === '/login') {
                // Store token and user info
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn flag for compatibility
                
                // Show success message and redirect to home.html
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'home.html'; // Redirect to home.html
                }, 1500);
            } else {
                // Show success message and redirect to login
                showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showError(error.message);
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const user = storage.getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const user = storage.loginUser(email, password);
        localStorage.setItem('token', 'dummy-token-' + Date.now()); // For compatibility
        window.location.href = '/home.html';
    } catch (error) {
        alert(error.message);
    }
});

// Handle registration form submission
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const user = storage.registerUser(username, email, password);
        storage.loginUser(email, password); // Auto login after registration
        localStorage.setItem('token', 'dummy-token-' + Date.now()); // For compatibility
        window.location.href = '/home.html';
    } catch (error) {
        alert(error.message);
    }
});

// Handle logout
function logout() {
    storage.logout();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Update UI based on auth state
function updateAuthUI() {
    const user = storage.getCurrentUser();
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    
    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        if (userLinks) {
            userLinks.style.display = 'block';
            const usernameSpan = document.getElementById('username');
            if (usernameSpan) usernameSpan.textContent = user.username;
        }
    } else {
        if (authLinks) authLinks.style.display = 'block';
        if (userLinks) userLinks.style.display = 'none';
    }
}

// Call updateAuthUI when page loads
document.addEventListener('DOMContentLoaded', updateAuthUI);