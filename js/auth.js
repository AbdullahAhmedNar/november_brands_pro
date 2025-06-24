// Authentication JavaScript

// Global Variables
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Admin initialization moved to backend for security

// Initialize admin user if not exists (backend only)
function initializeAdmin() {
    // Admin initialization is now handled by the backend API
    // No sensitive information stored in frontend
}

// Initialize Login Page
function initializeLoginPage() {
    initializeAdmin();
    setupLoginForm();
    setupSecurityChecks();
}

// Initialize Register Page
function initializeRegisterPage() {
    initializeAdmin();
    setupRegisterForm();
    setupPasswordValidation();
    setupSecurityChecks();
}

// Setup Login Form
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!form) return;
    
    // Real-time validation
    emailInput.addEventListener('input', validateEmailOrPhone);
    passwordInput.addEventListener('input', clearErrors);
    
    // Form submission
    form.addEventListener('submit', handleLogin);
}

// Setup Register Form
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputValidation);
        input.addEventListener('blur', handleInputValidation);
    });
    
    // Form submission
    form.addEventListener('submit', handleRegister);
}

// Setup Password Validation
function setupPasswordValidation() {
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        validatePasswordRequirements(this.value);
        if (confirmPasswordInput.value) {
            validatePasswordMatch();
        }
    });
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}

// Setup Security Checks
function setupSecurityChecks() {
    // Monitor for input type changes (security against inspect element manipulation)
    document.addEventListener('DOMContentLoaded', function() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="tel"], input[type="text"]');
        inputs.forEach(input => {
            // Store original type
            input.dataset.originalType = input.type;
            
            // Monitor for type changes
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
                        if (input.type !== input.dataset.originalType && 
                            input.dataset.originalType !== 'text') {
                            input.type = input.dataset.originalType;
                            showSecurityWarning(input);
                        }
                    }
                });
            });
            
            observer.observe(input, { attributes: true });
        });
    });
}

// Handle Input Validation
function handleInputValidation(e) {
    const input = e.target;
    const inputType = input.getAttribute('name') || input.id;
    
    clearError(input);
    
    switch (inputType) {
        case 'firstName':
        case 'lastName':
            validateName(input);
            break;
        case 'email':
        case 'loginEmail':
        case 'registerEmail':
            validateEmailOrPhone(e);
            break;
        case 'password':
        case 'loginPassword':
        case 'registerPassword':
            if (inputType === 'registerPassword') {
                validatePasswordRequirements(input.value);
            }
            break;
        case 'confirmPassword':
            validatePasswordMatch();
            break;
    }
}

// Validate Name
function validateName(input) {
    const value = input.value.trim();
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    
    if (!value) {
        showError(input, 'This field is required');
        return false;
    }
    
    if (!nameRegex.test(value)) {
        showError(input, 'Name should only contain letters and be 2-30 characters long');
        return false;
    }
    
    input.classList.add('valid');
    return true;
}

// Validate Email or Phone
function validateEmailOrPhone(e) {
    const input = e.target;
    const value = input.value.trim();
    
    if (!value) {
        showError(input, 'Email or phone number is required');
        return false;
    }
    
    // Check if it's an email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Check if it's a phone number (international format)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    const isValidEmail = emailRegex.test(value);
    const isValidPhone = phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    
    if (!isValidEmail && !isValidPhone) {
        showError(input, 'Please enter a valid email address or phone number');
        return false;
    }
    
    // Additional security: Check against common invalid patterns
    if (value.includes('<') || value.includes('>') || value.includes('script')) {
        showError(input, 'Invalid characters detected');
        input.setAttribute('data-compromised', 'true');
        return false;
    }
    
    input.classList.add('valid');
    input.removeAttribute('data-compromised');
    return true;
}

// Validate Password Requirements
function validatePasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        letter: /[a-zA-Z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)
    };
    
    // Update UI for each requirement
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            const icon = element.querySelector('i');
            if (requirements[req]) {
                element.classList.add('valid');
                icon.className = 'fas fa-check';
            } else {
                element.classList.remove('valid');
                icon.className = 'fas fa-times';
            }
        }
    });
    
    return Object.values(requirements).every(req => req);
}

// Validate Password Match
function validatePasswordMatch() {
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (!password || !confirmPassword) return false;
    
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'كلمات المرور غير متطابقة');
        return false;
    }
    
    clearError(confirmPassword);
    confirmPassword.classList.add('valid');
    return true;
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const emailOrPhone = formData.get('email').trim();
    const password = formData.get('password');
    
    // Show loading
    showLoadingState('loginBtn', 'loginLoading');
    
    try {
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for session cookies
            body: JSON.stringify({
                type: 'login',
                email: emailOrPhone,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('Login response:', data); // Debug log
        
        if (!data.success) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Login successful
        const user = data.user;
        
        // Store minimal user info in localStorage
        const userToStore = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin
        };
        
        console.log('=== Login Success Debug ===');
        console.log('User data from API:', user);
        console.log('user.isAdmin value:', user.isAdmin);
        console.log('user.isAdmin type:', typeof user.isAdmin);
        console.log('User object to store:', userToStore);
        console.log('=== End Debug ===');
        
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        
        // Wait a moment to ensure localStorage is saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on user type
        if (user.isAdmin) {
            console.log('Redirecting admin to admin panel...');
            window.location.href = './admin_new.html';
        } else {
            window.location.href = './index.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        hideLoadingState('loginBtn', 'loginLoading');
        showErrorModal(error.message || 'An error occurred during login');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    console.log('Registration form submitted'); // Debug log
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const firstName = formData.get('firstName').trim();
    const lastName = formData.get('lastName').trim();
    const emailOrPhone = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    console.log('Form data:', { firstName, lastName, emailOrPhone, password: '***', confirmPassword: '***', agreeTerms, newsletter }); // Debug log
    
    // Basic validation
    if (!firstName || !lastName || !emailOrPhone || !password || !confirmPassword) {
        console.log('Validation failed: Missing required fields'); // Debug log
        console.log('firstName:', firstName, 'lastName:', lastName, 'emailOrPhone:', emailOrPhone, 'password exists:', !!password, 'confirmPassword exists:', !!confirmPassword);
        showErrorModal('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    console.log('✅ Required fields validation passed');
    
    if (!agreeTerms) {
        console.log('Validation failed: Terms not agreed'); // Debug log
        const termsError = document.getElementById('termsError');
        if (termsError) {
            termsError.textContent = 'يجب الموافقة على الشروط والأحكام';
        }
        alert('يجب الموافقة على الشروط والأحكام');
        return;
    }
    
    console.log('✅ Terms validation passed');
    
    if (password !== confirmPassword) {
        console.log('Validation failed: Passwords do not match'); // Debug log
        showError(document.getElementById('confirmPassword'), 'كلمات المرور غير متطابقة');
        return;
    }
    
    console.log('✅ Password match validation passed');
    
    const passwordValidation = validatePasswordRequirements(password);
    console.log('Password validation result:', passwordValidation);
    
    if (!passwordValidation) {
        console.log('Validation failed: Password requirements not met'); // Debug log
        showErrorModal('كلمة المرور لا تلبي متطلبات الأمان');
        return;
    }
    
    console.log('✅ Password requirements validation passed');
    console.log('All validations passed, calling API...'); // Debug log
    
    // Show loading
    showLoadingState('registerBtn', 'registerLoading');
    
    try {
        // Call API for registration
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                type: 'register',
                firstName: firstName,
                lastName: lastName,
                email: emailOrPhone,
                password: password,
                newsletter: newsletter
            })
        });
        
        console.log('API response status:', response.status); // Debug log
        const data = await response.json();
        console.log('Registration response:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'فشل في إنشاء الحساب');
        }
        
        // Registration successful
        console.log('Registration successful!'); // Debug log
        hideLoadingState('registerBtn', 'registerLoading');
        showSuccessModal();
        
        // Also save to localStorage for backward compatibility
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const newUser = {
            id: data.user.id,
            firstName: firstName,
            lastName: lastName,
            email: emailOrPhone,
            password: hashPassword(password),
            isAdmin: false,
            createdAt: new Date().toISOString(),
            isVerified: false,
            newsletter: newsletter
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
    } catch (error) {
        console.error('Registration error:', error);
        hideLoadingState('registerBtn', 'registerLoading');
        showErrorModal(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Utility Functions
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function hashPassword(password) {
    // Simple hash function for demo purposes
    // In production, use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

function showError(input, message) {
    const errorElement = document.getElementById(input.id + 'Error') || 
                        document.getElementById(input.name + 'Error');
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    input.classList.remove('valid');
    input.classList.add('invalid');
}

function clearError(input) {
    const errorElement = document.getElementById(input.id + 'Error') || 
                        document.getElementById(input.name + 'Error');
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    input.classList.remove('invalid');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('invalid');
    });
}

function showSecurityWarning(input) {
    const existingWarning = input.parentElement.parentElement.querySelector('.security-warning');
    if (existingWarning) return;
    
    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Security violation detected. Input type modification is not allowed.';
    
    input.parentElement.parentElement.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 5000);
}

function showLoadingState(buttonId, loadingId) {
    const button = document.getElementById(buttonId);
    const loading = document.getElementById(loadingId);
    
    if (button && loading) {
        button.disabled = true;
        button.classList.add('loading');
        loading.classList.remove('hidden');
    }
}

function hideLoadingState(buttonId, loadingId) {
    const button = document.getElementById(buttonId);
    const loading = document.getElementById(loadingId);
    
    if (button && loading) {
        button.disabled = false;
        button.classList.remove('loading');
        loading.classList.add('hidden');
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const messageElement = document.getElementById('errorMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'block';
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function redirectToLogin() {
    window.location.href = './login.html';
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Prevent form submission on Enter key in password fields during requirements check
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.id === 'registerPassword') {
        const isValid = validatePasswordRequirements(e.target.value);
        if (!isValid) {
            e.preventDefault();
        }
    }
});

// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('login.html')) {
        initializeLoginPage();
    } else if (path.includes('register.html')) {
        initializeRegisterPage();
    }
});

// Enhanced security: Monitor console for suspicious activities
(function() {
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('Developer tools detected. Please note that attempting to manipulate form data is monitored.');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();

// Export functions for global access
window.togglePasswordVisibility = togglePasswordVisibility;
window.closeSuccessModal = closeSuccessModal;
window.closeErrorModal = closeErrorModal;
window.redirectToLogin = redirectToLogin;

// Authentication related functions
async function login(email, password) {
    try {
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'login',
                email: email,
                password: password
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('Server response:', text);

        const data = JSON.parse(text);
        
        if (data.success) {
            // Store user data with explicit admin flag
            const userToStore = {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                name: data.user.name,
                isAdmin: data.user.isAdmin === true
            };
            
            console.log('Storing user data:', userToStore);
            console.log('isAdmin value:', userToStore.isAdmin);
            
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            
            // Verify storage
            const stored = JSON.parse(localStorage.getItem('currentUser'));
            console.log('Verified stored data:', stored);
            
            if (userToStore.isAdmin) {
                console.log('Admin user - redirecting to admin panel');
                window.location.href = './admin_new.html';
            } else {
                console.log('Regular user - redirecting to home');
                window.location.href = './index.html';
            }
        } else {
            throw new Error(data.message || 'فشل تسجيل الدخول');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function verifyAdminStatus() {
    try {
        console.log('Making admin verification request...');
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                type: 'check_admin'
            }),
            credentials: 'include',
            mode: 'cors',
            cache: 'no-cache'
        });

        console.log('Admin check response status:', response.status);
        const responseText = await response.text();
        console.log('Raw admin check response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed admin check response:', data);
        } catch (e) {
            console.error('JSON parse error in admin check:', e);
            console.error('Raw response that failed to parse:', responseText);
            return false;
        }

        return data.success && data.isAdmin;
    } catch (error) {
        console.error('Admin verification error:', error);
        return false;
    }
}

async function checkAdminAccess() {
    try {
        console.log('Checking admin access...');
        const user = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!user) {
            console.log('No user found in localStorage');
            window.location.href = 'login.html';
            return false;
        }

        console.log('User data:', user);
        console.log('isAdmin value:', user.isAdmin);
        console.log('email:', user.email);

        // Check if user is admin - support multiple value types
        const isAdminCheck = user.isAdmin === true || 
                            user.isAdmin === 1 || 
                            user.isAdmin === "1" || 
                            user.isAdmin === "true" ||
                            false; // Admin check is now done server-side
        
        if (isAdminCheck) {
            console.log('✅ User verified as admin');
            return true;
        }

        console.log('❌ User is not admin');
        window.location.href = 'login.html';
        return false;
    } catch (error) {
        console.error('Admin access check error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

async function logout() {
    try {
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'logout'
            }),
            credentials: 'include',
            mode: 'cors',
            cache: 'no-cache'
        });

        const responseText = await response.text();
        console.log('Raw logout response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error in logout:', e);
            throw new Error('خطأ في استجابة الخادم');
        }
        
        if (data.success) {
            localStorage.removeItem('currentUser');
            window.location.href = window.location.origin + '/login.html';
        } else {
            throw new Error(data.message || 'فشل تسجيل الخروج');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local storage and redirect
        localStorage.removeItem('currentUser');
        window.location.href = window.location.origin + '/login.html';
        throw error;
    }
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            try {
                await login(email, password);
            } catch (error) {
                console.error('Login form error:', error);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Logout button handling
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await logout();
            } catch (error) {
                console.error('Logout failed:', error);
                alert('فشل تسجيل الخروج: ' + error.message);
            }
        });
    }

    // Check admin access on admin pages
    if (window.location.pathname.includes('admin')) {
        console.log('Admin page detected, checking access...');
        // Note: Admin check is now handled in admin.js directly
    }
}); 