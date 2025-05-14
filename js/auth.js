// DOM Elements
const errorMessage = document.querySelector('.error-message');
const successMessage = document.querySelector('.success-message');

// Show error message
function showError(message) {
    console.error('Error:', message);
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    } else {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.marginBottom = '10px';
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(errorElement, form.firstChild);
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
    } else {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        successElement.style.color = 'green';
        successElement.style.marginBottom = '10px';
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(successElement, form.firstChild);
        }
    }
}

// Logout function
function logout() {
    userStorage.clearCurrentUser();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    window.location.href = './index.html';
}

// Expose logout function globally
window.logout = logout;

// Run auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
                
                // Find user by email
                const user = userStorage.findUserByEmail(email);
                
                if (!user || user.password !== password) {
                    throw new Error('Invalid email or password');
                }
                
                // Set current user
                userStorage.setCurrentUser(user);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', `token_${user.id}`);
                localStorage.setItem('userId', user.id);
                
                // Show success message
                showSuccess('Login successful! Redirecting...');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = './home.html';
                }, 1500);
                
            } catch (error) {
                showError(error.message || 'Login failed');
                
                // Reset button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Registration form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Registration form found');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            console.log('Form values:', {
                username: username ? 'provided' : 'missing',
                email: email ? 'provided' : 'missing',
                password: password ? 'provided' : 'missing',
                confirmPassword: confirmPassword ? 'provided' : 'missing'
            });
            
            // Form validation
            if (!username || !email || !password || !confirmPassword) {
                console.log('Missing fields:', {
                    username: !username,
                    email: !email,
                    password: !password,
                    confirmPassword: !confirmPassword
                });
                showError('All fields are required');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters');
                return;
            }
            
            try {
                console.log('Attempting to register user');
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Registering...';
                submitBtn.disabled = true;
                
                // Check if email already exists
                const existingUser = userStorage.findUserByEmail(email);
                if (existingUser) {
                    throw new Error('Email already registered');
                }
                
                // Create new user
                const newUser = {
                    id: Date.now().toString(),
                    username,
                    email,
                    password,
                    createdAt: new Date().toISOString()
                };
                
                console.log('Created new user object:', { ...newUser, password: '[REDACTED]' });
                
                // Add user to storage
                userStorage.addUser(newUser);
                console.log('User added to storage');
                
                // Show success message
                showSuccess('Registration successful! Redirecting to login...');
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 2000);
                
            } catch (error) {
                console.error('Registration error:', error);
                showError(error.message || 'Registration failed');
                
                // Reset button
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Check if user is already logged in
    const currentUser = userStorage.getCurrentUser();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (currentUser && isLoggedIn) {
        // Update UI elements if on the index page
        if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
            const loginLink = document.getElementById('login-link');
            const registerLink = document.getElementById('register-link');
            const addPostBtn = document.getElementById('add-post-btn');
            const logoutBtn = document.getElementById('logout-btn');
            
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (addPostBtn) addPostBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        }
        
        // Only redirect login and register pages
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = './home.html';
        }
    }
});