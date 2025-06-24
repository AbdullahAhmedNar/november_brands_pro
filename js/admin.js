// Admin Panel JavaScript
// Image upload handling and admin-specific functions

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeImageUpload();
});

// Initialize image upload functionality
function initializeImageUpload() {
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }
}

// Handle image selection
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showNotification('يرجى اختيار ملف صورة صحيح (PNG, JPG, JPEG)', 'error');
        resetImageUpload();
        return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showNotification('حجم الملف كبير جداً. يجب أن يكون أقل من 10MB', 'error');
        resetImageUpload();
        return;
    }
    
    // Show image preview
    showImagePreview(file);
}

// Show image preview
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const uploadArea = document.querySelector('.image-upload-area');
        
        if (preview && uploadArea) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadArea.classList.add('has-image');
            
            // Add remove button
            addRemoveImageButton();
        }
    };
    reader.readAsDataURL(file);
}

// Add remove image button
function addRemoveImageButton() {
    const uploadArea = document.querySelector('.image-upload-area');
    let removeBtn = uploadArea.querySelector('.remove-image-btn');
    
    if (!removeBtn) {
        removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = function(e) {
            e.stopPropagation();
            resetImageUpload();
        };
        uploadArea.appendChild(removeBtn);
    }
}

// Reset image upload
function resetImageUpload() {
    const preview = document.getElementById('imagePreview');
    const uploadArea = document.querySelector('.image-upload-area');
    const imageInput = document.getElementById('productImage');
    const removeBtn = uploadArea?.querySelector('.remove-image-btn');
    
    if (preview) {
        preview.style.display = 'none';
        preview.src = '';
    }
    
    if (uploadArea) {
        uploadArea.classList.remove('has-image');
    }
    
    if (imageInput) {
        imageInput.value = '';
    }
    
    if (removeBtn) {
        removeBtn.remove();
    }
}

// Convert file to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Admin form validation
function validateProductForm() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('productStock').value;
    const description = document.getElementById('productDescription').value.trim();
    
    if (!name) {
        showNotification('اسم المنتج مطلوب', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('فئة المنتج مطلوبة', 'error');
        return false;
    }
    
    if (!price || parseFloat(price) <= 0) {
        showNotification('سعر المنتج يجب أن يكون أكبر من صفر', 'error');
        return false;
    }
    
    if (!stock || parseInt(stock) < 0) {
        showNotification('كمية المنتج يجب أن تكون صفر أو أكثر', 'error');
        return false;
    }
    
    if (!description) {
        showNotification('وصف المنتج مطلوب', 'error');
        return false;
    }
    
    return true;
}

// Add product function
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
        submitButton.disabled = true;

        // Use the enhanced form submission
        const productData = await submitProductForm(this);
        if (!productData) {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            return; // Validation failed
        }
        
        console.log('Sending product data:', productData); // Debug log

        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include', // Important for sending cookies
            body: JSON.stringify(productData)
        });
        
        console.log('Response status:', response.status); // Debug log
        console.log('Response headers:', Object.fromEntries(response.headers.entries())); // Debug log
        
        // First get the response text
        const responseText = await response.text();
        console.log('Raw response:', responseText); // Debug log
        
        // Try to parse the response text as JSON
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('Parsed JSON response:', result); // Debug log
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Raw response that failed to parse:', responseText);
            throw new Error('استجابة غير صالحة من الخادم');
        }
        
        if (result.success) {
            showNotification('تم إضافة المنتج بنجاح!', 'success');
            this.reset();
            resetImageUpload();
            
            // Refresh products in main page if function exists
            if (typeof window.refreshProducts === 'function') {
                await window.refreshProducts();
            }
        } else {
            const errorMessage = result.message || 'خطأ غير معروف';
            console.error('Error details:', result); // Debug log
            showNotification('حدث خطأ: ' + errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error details:', error); // Debug log
        showNotification('حدث خطأ في الاتصال: ' + (error.message || 'خطأ غير معروف'), 'error');
    } finally {
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-plus"></i> إضافة المنتج';
        submitButton.disabled = false;
    }
});

// Enhanced form submission
async function submitProductForm(formElement) {
    if (!validateProductForm()) {
        return false;
    }
    
    const imageFile = document.getElementById('productImage').files[0];
    let imageBase64 = '';
    
    if (imageFile) {
        try {
            // Validate file size
            if (imageFile.size > 10 * 1024 * 1024) { // 10MB
                showNotification('حجم الصورة يجب أن يكون أقل من 10 ميجابايت', 'error');
                return false;
            }
            
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(imageFile.type)) {
                showNotification('يجب أن تكون الصورة من نوع JPG أو PNG', 'error');
                return false;
            }
            
            imageBase64 = await convertToBase64(imageFile);
        } catch (error) {
            console.error('Error converting image:', error);
            showNotification('فشل في معالجة الصورة', 'error');
            return false;
        }
    }
    
    return {
        action: 'add_product',
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value.trim(),
        image: imageBase64
    };
}

// Add check admin status function
async function checkAdminStatus() {
    try {
        console.log('Checking admin status...');
        
        // First, check localStorage as backup
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                console.log('Found user in localStorage:', user);
                if (user.isAdmin) {
                    console.log('User is admin according to localStorage');
                    // Still verify with server but don't fail immediately
                }
            } catch (e) {
                console.log('Failed to parse localStorage user');
            }
        }
        
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ type: 'check_admin' })
        });

        console.log('Admin check response status:', response.status);

        if (!response.ok) {
            console.log('Response not OK, checking localStorage backup...');
            
            // Check localStorage as fallback
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                try {
                    const user = JSON.parse(currentUser);
                    if (user.isAdmin) {
                        console.log('Using localStorage admin status as fallback');
                        return true;
                    }
                } catch (e) {
                    console.log('Failed to parse localStorage user for fallback');
                }
            }
            
            return false;
        }

        const text = await response.text();
        console.log('Raw admin check response:', text);
        
        const data = JSON.parse(text);
        console.log('Parsed admin check response:', data);
        
        if (data.success && data.isAdmin) {
            console.log('Admin status confirmed by server');
            return true;
        } else {
            console.log('Admin status denied by server:', data);
            
            // Check localStorage as fallback
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                try {
                    const user = JSON.parse(currentUser);
                    if (user.isAdmin) {
                        console.log('Using localStorage admin status as fallback');
                        return true;
                    }
                } catch (e) {
                    console.log('Failed to parse localStorage user for fallback');
                }
            }
            
            return false;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        
        // Check localStorage as final fallback
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                if (user.isAdmin) {
                    console.log('Using localStorage admin status as final fallback');
                    return true;
                }
            } catch (e) {
                console.log('Failed to parse localStorage user for final fallback');
            }
        }
        
        return false;
    }
}

// Simple admin check on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loading...');
    
    // Check if user is logged in and is admin
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        console.log('No user found - redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    let user;
    try {
        user = JSON.parse(currentUser);
    } catch (e) {
        console.log('Invalid user data - redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // Simple admin check
    if (user.isAdmin === true) {
        console.log('✅ Admin access granted');
        initializeImageUpload();
    } else {
        console.log('❌ Not admin - redirecting to login');
        alert('يجب تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة');
        window.location.href = 'login.html';
    }
});

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        return;
    }
    
    try {
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'delete_product',
                product_id: productId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showNotification('تم حذف المنتج بنجاح', 'success');
            
            // Broadcast a custom event to notify other pages
            const event = new CustomEvent('productDeleted', { detail: { productId } });
            window.dispatchEvent(event);
            
            // Refresh products list
            loadProducts();
        } else {
            showNotification(data.message || 'حدث خطأ أثناء حذف المنتج', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('حدث خطأ أثناء حذف المنتج', 'error');
    }
} 