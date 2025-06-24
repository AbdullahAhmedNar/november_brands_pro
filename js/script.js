// Professional Image Viewer Functions with Zoom
let currentZoom = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

function createImageViewerIfMissing() {
    if (document.getElementById('imageViewer')) return;
    
    const viewerHTML = `
        <div id="imageViewer" class="image-viewer">
            <div class="image-viewer-container">
                <div class="image-viewer-content">
                    <div class="image-viewer-header">
                        <h3 id="imageViewerTitle" class="image-viewer-title">Product Image</h3>
                        <button class="image-viewer-close" onclick="closeImageViewer()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="image-viewer-body">
                        <img id="imageViewerImage" class="image-viewer-image" src="" alt="Product Image">
                        <div class="zoom-controls">
                            <button class="zoom-btn" id="zoomOut" title="Zoom Out">
                                <i class="fas fa-minus"></i>
                            </button>
                            <div class="zoom-level-display" id="zoomLevel">100%</div>
                            <button class="zoom-btn" id="zoomIn" title="Zoom In">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="zoom-btn" id="resetZoom" title="Reset Zoom">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="image-viewer-footer">
                        <div class="image-viewer-actions">
                            <button class="image-viewer-btn btn-close" onclick="closeImageViewer()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
    setupImageViewerListeners();
    console.log('✅ Image viewer created dynamically');
}

function showProductImage(imageSrc, productName) {
    console.log('🖼️ Opening image viewer for:', productName);
    
    const viewer = document.getElementById('imageViewer');
    const viewerImg = document.getElementById('imageViewerImage');
    const viewerTitle = document.getElementById('imageViewerTitle');
    
    if (!viewer || !viewerImg || !viewerTitle) {
        console.error('❌ Image viewer elements not found');
        // Create viewer if it doesn't exist
        createImageViewerIfMissing();
        return;
    }
    
    try {
        // Reset viewer state
        viewer.classList.remove('active');
        currentZoom = 1;
        
        // Clear previous image to prevent flickering
        viewerImg.src = '';
        viewerImg.style.transform = 'scale(1)';
        viewerImg.style.cursor = 'zoom-in';
        
        // Set title
        viewerTitle.textContent = productName || 'Product Image';
        
        // Apply responsive image sizing
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024;
        
        if (isMobile) {
            viewerImg.style.maxWidth = '85vw';
            viewerImg.style.maxHeight = '35vh';
            console.log('📱 Mobile sizing applied');
        } else if (isTablet) {
            viewerImg.style.maxWidth = '70vw';
            viewerImg.style.maxHeight = '45vh';
            console.log('📟 Tablet sizing applied');
        } else {
            viewerImg.style.maxWidth = '60vw';
            viewerImg.style.maxHeight = '60vh';
            console.log('🖥️ Desktop sizing applied');
        }
        
        viewerImg.style.width = 'auto';
        viewerImg.style.height = 'auto';
        viewerImg.style.objectFit = 'contain';
        viewerImg.style.margin = 'auto';
        viewerImg.style.display = 'block';
        
        // Force positioning
        viewer.style.cssText = `
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            background: rgba(0, 0, 0, 0.95) !important;
            align-items: center !important;
            justify-content: center !important;
        `;
        
        // Load image with proper error handling
        viewerImg.onload = function() {
            console.log('✅ Image loaded successfully');
            setupZoomControls();
            
            // Show viewer with animation
            requestAnimationFrame(() => {
                viewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        };
        
        viewerImg.onerror = function() {
            console.error('❌ Failed to load image:', imageSrc);
            closeImageViewer();
        };
        
        // Set image source last to trigger loading
        viewerImg.src = imageSrc;
        viewerImg.alt = productName || 'Product Image';
        
        console.log('🎬 Image viewer setup completed');
        
    } catch (error) {
        console.error('❌ Error in showProductImage:', error);
        closeImageViewer();
    }
}

function setupZoomControls() {
    const viewerImg = document.getElementById('imageViewerImage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const imageBody = document.querySelector('.image-viewer-body');
    
    if (!viewerImg || !zoomInBtn || !zoomOutBtn || !resetZoomBtn) {
        console.error('❌ Zoom control elements not found');
        return;
    }
    
    // Reset zoom state
    currentZoom = 1;
    updateImageZoom();
    
    // Zoom In Button
    zoomInBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = Math.min(currentZoom + 0.5, 5);
        updateImageZoom();
        console.log('🔍 Zoom In:', Math.round(currentZoom * 100) + '%');
    };
    
    // Zoom Out Button  
    zoomOutBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = Math.max(currentZoom - 0.5, 0.5);
        updateImageZoom();
        console.log('🔍 Zoom Out:', Math.round(currentZoom * 100) + '%');
    };
    
    // Reset Zoom Button
    resetZoomBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = 1;
        updateImageZoom();
        if (imageBody) {
            imageBody.scrollTop = 0;
            imageBody.scrollLeft = 0;
        }
        console.log('🔄 Zoom Reset: 100%');
    };
    
    // Image click to toggle zoom
    viewerImg.onclick = function(e) {
        e.stopPropagation();
        if (currentZoom === 1) {
            currentZoom = 2;
            console.log('👆 Click to zoom in: 200%');
        } else {
            currentZoom = 1;
            console.log('👆 Click to zoom out: 100%');
        }
        updateImageZoom();
    };
    
    // Mouse wheel zoom (Desktop only)
    if (imageBody) {
        imageBody.onwheel = function(e) {
            e.preventDefault();
            const zoomSpeed = 0.2;
            const oldZoom = currentZoom;
            
            if (e.deltaY < 0) {
                currentZoom = Math.min(currentZoom + zoomSpeed, 5);
            } else {
                currentZoom = Math.max(currentZoom - zoomSpeed, 0.5);
            }
            
            if (oldZoom !== currentZoom) {
                updateImageZoom();
                console.log('🖱️ Wheel zoom:', Math.round(currentZoom * 100) + '%');
            }
        };
    }
    
    // Drag functionality for zoomed images
    let dragStarted = false;
    
    viewerImg.onmousedown = function(e) {
        if (currentZoom > 1) {
            dragStarted = true;
            isDragging = true;
            startX = e.pageX;
            startY = e.pageY;
            if (imageBody) {
                scrollLeft = imageBody.scrollLeft;
                scrollTop = imageBody.scrollTop;
            }
            viewerImg.style.cursor = 'grabbing';
            e.preventDefault();
        }
    };
    
    document.onmousemove = function(e) {
        if (!isDragging || !dragStarted) return;
        e.preventDefault();
        
        if (imageBody) {
            const deltaX = e.pageX - startX;
            const deltaY = e.pageY - startY;
            imageBody.scrollLeft = scrollLeft - deltaX;
            imageBody.scrollTop = scrollTop - deltaY;
        }
    };
    
    document.onmouseup = function() {
        if (dragStarted) {
            isDragging = false;
            dragStarted = false;
            if (viewerImg) {
                viewerImg.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
            }
        }
    };
    
    console.log('✅ Zoom controls setup completed');
}

function updateImageZoom() {
    const viewerImg = document.getElementById('imageViewerImage');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const imageBody = document.querySelector('.image-viewer-body');
    
    if (viewerImg && zoomLevelDisplay) {
        // Apply zoom transform
        viewerImg.style.transform = `scale(${currentZoom})`;
        viewerImg.classList.toggle('zoomed', currentZoom !== 1);
        zoomLevelDisplay.textContent = Math.round(currentZoom * 100) + '%';
        
        // Update cursor based on zoom level
        if (currentZoom > 1) {
            viewerImg.style.cursor = 'grab';
            // Enable scrolling for zoomed images
            if (imageBody) {
                imageBody.style.overflow = 'auto';
            }
        } else {
            viewerImg.style.cursor = 'zoom-in';
            // Disable scrolling for normal view
            if (imageBody) {
                imageBody.style.overflow = 'hidden';
                imageBody.scrollTop = 0;
                imageBody.scrollLeft = 0;
            }
        }
        
        console.log(`🔍 Zoom updated: ${Math.round(currentZoom * 100)}%`);
    }
}

function resetImageZoom() {
    currentZoom = 1;
    updateImageZoom();
}

function closeImageViewer() {
    console.log('🚪 Closing image viewer');
    
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.classList.remove('active');
        
        // Reset zoom and drag state
        currentZoom = 1;
        isDragging = false;
        
        // Clean up event listeners
        document.onmousemove = null;
        document.onmouseup = null;
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            viewer.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('✅ Image viewer closed successfully');
        }, 300);
    }
}

// Setup Image Viewer Event Listeners
function setupImageViewerListeners() {
    const viewer = document.getElementById('imageViewer');
    const container = document.querySelector('.image-viewer-container');
    
    if (viewer) {
        viewer.addEventListener('click', function(e) {
            if (e.target === viewer) {
                closeImageViewer();
            }
        });
    }
    
    if (container) {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const viewer = document.getElementById('imageViewer');
            if (viewer && viewer.classList.contains('active')) {
                closeImageViewer();
            }
        }
    });
}

// Enhanced Hero Loading Animation Functions
function showLoadingAnimation(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // Show hero skeleton loading
        container.innerHTML = `
            <div class="hero-loading-container">
                ${generateSkeletonCards(6)}
            </div>
        `;
        console.log('Hero skeleton loading animation shown for:', containerId);
    }
}

function generateSkeletonCards(count) {
    let cards = '';
    for (let i = 0; i < count; i++) {
        cards += `
            <div class="skeleton-card" style="animation-delay: ${i * 0.2}s">
                <div class="skeleton-image"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-description"></div>
                <div class="skeleton-description" style="width: 60%;"></div>
                <div class="skeleton-price"></div>
            </div>
        `;
    }
    return cards;
}

// Enhanced product loading with hero animations
function showHeroProductLoading(containerId, categoryName) {
    const container = document.getElementById(containerId);
    if (container) {
        // Clear any existing content first
        container.innerHTML = '';
        container.className = 'products-grid';
        
        // Add hero loading content
        container.innerHTML = `
            <div class="hero-loading-container">
                <div class="skeleton-card hero-loading-main" style="grid-column: 1 / -1; text-align: center; height: 240px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 105, 180, 0.15)); border: 3px solid rgba(255, 20, 147, 0.3); box-shadow: 0 20px 40px rgba(255, 20, 147, 0.2);">
                    <div class="loading-spinner" style="margin-bottom: 30px; width: 80px; height: 80px; border-width: 8px;"></div>
                    <div class="loading-text" style="color: #ff1493; font-size: 1.6rem; font-weight: 800; text-shadow: 0 4px 8px rgba(255, 20, 147, 0.3);">Loading ${categoryName} Products<span class="loading-dots"></span></div>
                    <div class="loading-subtitle" style="color: #ff69b4; font-size: 1.1rem; margin-top: 15px; font-weight: 500;">🌟 Curating premium beauty essentials for you...</div>
                    <div style="margin-top: 20px; color: #666; font-size: 0.9rem;">✨ Please wait while we prepare your ${categoryName.toLowerCase()} collection</div>
                </div>
                ${generateSkeletonCards(6)}
            </div>
        `;
        
        // Add some visual feedback
        container.style.minHeight = '500px';
        container.style.opacity = '1';
        
        console.log(`✨ Enhanced hero loading animation shown for ${categoryName}:`, containerId);
        
        // Add progress indicator animation
        setTimeout(() => {
            const mainLoader = container.querySelector('.hero-loading-main');
            if (mainLoader) {
                mainLoader.style.background = 'linear-gradient(135deg, rgba(255, 20, 147, 0.2), rgba(255, 105, 180, 0.2))';
                mainLoader.style.borderColor = 'rgba(255, 20, 147, 0.4)';
                console.log(`🔄 Enhanced loading state for ${categoryName}`);
            }
        }, 1000);
    }
}

function hideLoadingAnimation(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('loading');
    }
}

// Make functions globally available
window.showProductImage = showProductImage;
window.closeImageViewer = closeImageViewer;

// Global Variables
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isLoadingProducts = false;

// Products will be loaded from database
let products = {
    skincare: [],
    haircare: [],
    perfumes: []
};

// Clean up deleted products from localStorage
async function cleanupDeletedProducts() {
    try {
        const response = await fetch('api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'get_products'
            })
        });
        
        const data = await response.json();
        if (data.success) {
            const validProductIds = data.products.map(p => p.id);
            
            // Clean up favorites
            favorites = favorites.filter(id => validProductIds.includes(id));
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Clean up cart
            cart = cart.filter(item => validProductIds.includes(item.id));
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update counters
            updateCounters();
        }
    } catch (error) {
        console.error('Error cleaning up deleted products:', error);
    }
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    await cleanupDeletedProducts(); // Add cleanup call here
    updateCounters();
    setupEventListeners();
    
    // Debug URL parameters
    console.log('Current URL:', window.location.href);
    console.log('URL search params:', window.location.search);
    console.log('URL hash:', window.location.hash);
    
    // Wait a bit more for products to be fully loaded before highlighting
    setTimeout(highlightProductFromURL, 1000);
});

// Listen for product deletion events
window.addEventListener('productDeleted', async function(event) {
    const deletedProductId = event.detail.productId;
    
    // Remove from favorites if present
    const favIndex = favorites.indexOf(deletedProductId);
    if (favIndex > -1) {
        favorites.splice(favIndex, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // Remove from cart if present
    cart = cart.filter(item => item.id !== deletedProductId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update counters
    updateCounters();
    
    // If favorites modal is open, refresh it
    const favoritesModal = document.getElementById('favoritesModal');
    if (favoritesModal && favoritesModal.style.display === 'block') {
        openFavoritesModal();
    }
    
    // If cart modal is open, refresh it
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.style.display === 'block') {
        openCartModal();
    }
});

// Initialize Application
async function initializeApp() {
    // Check if user is logged in
    if (currentUser) {
        updateUserInterface();
    }
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup intersection observer for animations
    setupScrollAnimations();
    
    // Load products from database
    await loadProductsFromDatabase();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            scrollToSection(target.substring(1));
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Favorites button
    document.getElementById('favoritesBtn').addEventListener('click', openFavoritesModal);
    
    // Cart button
    document.getElementById('cartBtn').addEventListener('click', openCartModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Mobile menu toggle - Remove duplicate event listener since onclick is in HTML
    // const mobileToggle = document.querySelector('.mobile-menu-toggle');
    // if (mobileToggle) {
    //     mobileToggle.addEventListener('click', toggleMobileMenu);
    // }
    
    // Setup Image Viewer Event Listeners
    setupImageViewerListeners();
}

// Smooth Scrolling Setup
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to Section Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = section.offsetTop;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Setup Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.product-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Load Products from Database with Enhanced Loading
async function loadProductsFromDatabase() {
    if (isLoadingProducts) {
        console.log('Products are already loading...');
        return;
    }
    
    try {
        console.log('Loading products from database...');
        isLoadingProducts = true;
        
        // Show hero loading for all sections
        showHeroProductLoading('skincareProducts', 'Skincare');
        showHeroProductLoading('haircareProducts', 'Haircare');
        showHeroProductLoading('perfumeProducts', 'Perfume');
        
        // Show loading message to user
        console.log('🎬 Starting professional loading sequence...');
        
        // Load all products first
        const response = await fetch('./api/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                type: 'get_products'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Products loaded from database:', data);
        
        if (data.success && data.products && data.products.length > 0) {
            // Clear existing products
            products.skincare = [];
            products.haircare = [];
            products.perfumes = [];
            
            // Group products by category
            data.products.forEach(product => {
                // Convert product_id string to numeric id for compatibility
                product.id = parseInt(product.id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 10000);
                
                if (products[product.category]) {
                    products[product.category].push(product);
                }
            });
            
            // Enhanced loading sequence with proper timing
            console.log('🎭 Starting sequential loading with enhanced animations...');
            
            // Load products to the page with enhanced sequential timing
            setTimeout(() => {
                console.log('🌟 Starting to load Skincare products...');
                loadProductsByCategory('skincare', 'skincareProducts');
            }, 2500);
            setTimeout(() => {
                console.log('💆‍♀️ Starting to load Haircare products...');
                loadProductsByCategory('haircare', 'haircareProducts');
            }, 5000);
            setTimeout(() => {
                console.log('🌹 Starting to load Perfume products...');
                loadProductsByCategory('perfumes', 'perfumeProducts');
            }, 7500);
            
            console.log('📊 Products distribution:', {
                skincare: products.skincare.length,
                haircare: products.haircare.length,
                perfumes: products.perfumes.length
            });
        } else {
            console.log('⚠️ No products found in database, loading sample data...');
            // Fallback to sample data if database fails or empty
            loadSampleProductsWithAnimation();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data if API fails
        loadSampleProductsWithAnimation();
    } finally {
        // Reset loading state after extended delay
        setTimeout(() => {
            isLoadingProducts = false;
            console.log('🎉 All products loading sequence completed!');
            
            // Show completion statistics
            const totalProducts = products.skincare.length + products.haircare.length + products.perfumes.length;
            console.log(`📊 Loading Statistics:
            🌟 Skincare: ${products.skincare.length} products
            💆‍♀️ Haircare: ${products.haircare.length} products  
            🌹 Perfumes: ${products.perfumes.length} products
            📦 Total: ${totalProducts} products loaded with sequential animations`);
        }, 12000); // Extended to account for all animations
    }
}

// Enhanced sample products loader with animations
function loadSampleProductsWithAnimation() {
    console.log('Loading enhanced sample products with animations...');
    
    // Show hero loading for all sections first
    showHeroProductLoading('skincareProducts', 'Skincare');
    showHeroProductLoading('haircareProducts', 'Haircare');
    showHeroProductLoading('perfumeProducts', 'Perfume');
    
    // Load sample data
    products.skincare = [
        {
            id: 1,
            name: "Vitamin C Serum",
            description: "Brightening serum with 20% Vitamin C for radiant skin",
            price: "$45.00",
            image: "https://via.placeholder.com/300x250/ffb6c1/000000?text=Vitamin+C+Serum",
            category: "skincare"
        },
        {
            id: 2,
            name: "Hyaluronic Acid Moisturizer",
            description: "Deep hydrating moisturizer for all skin types",
            price: "$38.00",
            image: "https://via.placeholder.com/300x250/ffb6c1/000000?text=Hyaluronic+Moisturizer",
            category: "skincare"
        },
        {
            id: 3,
            name: "Retinol Night Cream",
            description: "Anti-aging night cream with retinol for smooth skin",
            price: "$52.00",
            image: "https://via.placeholder.com/300x250/ffb6c1/000000?text=Retinol+Cream",
            category: "skincare"
        }
    ];
    
    products.haircare = [
        {
            id: 4,
            name: "Argan Oil Hair Mask",
            description: "Nourishing hair mask with organic argan oil",
            price: "$35.00",
            image: "https://via.placeholder.com/300x250/ffd700/000000?text=Argan+Hair+Mask",
            category: "haircare"
        },
        {
            id: 5,
            name: "Keratin Shampoo",
            description: "Strengthening shampoo with keratin complex",
            price: "$28.00",
            image: "https://via.placeholder.com/300x250/ffd700/000000?text=Keratin+Shampoo",
            category: "haircare"
        },
        {
            id: 6,
            name: "Hair Growth Serum",
            description: "Advanced serum to promote healthy hair growth",
            price: "$48.00",
            image: "https://via.placeholder.com/300x250/ffd700/000000?text=Growth+Serum",
            category: "haircare"
        }
    ];
    
    products.perfumes = [
        {
            id: 7,
            name: "Rose Elegance",
            description: "Luxurious rose-based perfume with floral notes",
            price: "$65.00",
            image: "https://via.placeholder.com/300x250/dda0dd/000000?text=Rose+Elegance",
            category: "perfumes"
        },
        {
            id: 8,
            name: "Midnight Oud",
            description: "Rich and mysterious oud fragrance",
            price: "$85.00",
            image: "https://via.placeholder.com/300x250/dda0dd/000000?text=Midnight+Oud",
            category: "perfumes"
        },
        {
            id: 9,
            name: "Vanilla Dreams",
            description: "Sweet and warm vanilla scent with amber notes",
            price: "$58.00",
            image: "https://via.placeholder.com/300x250/dda0dd/000000?text=Vanilla+Dreams",
            category: "perfumes"
        }
    ];

    // Load products with enhanced sequential timing
    setTimeout(() => {
        console.log('🌟 Starting to load Skincare sample products...');
        loadProductsByCategory('skincare', 'skincareProducts');
    }, 3000);
    setTimeout(() => {
        console.log('💆‍♀️ Starting to load Haircare sample products...');
        loadProductsByCategory('haircare', 'haircareProducts');
    }, 6000);
    setTimeout(() => {
        console.log('🌹 Starting to load Perfume sample products...');
        loadProductsByCategory('perfumes', 'perfumeProducts');
    }, 9000);
}

// This function has been replaced by loadSampleProductsWithAnimation

// Function to refresh products (can be called when products are updated)
async function refreshProducts() {
    console.log('Refreshing products...');
    await loadProductsFromDatabase();
}

// Export for admin use
window.refreshProducts = refreshProducts;

// Listen for hash changes and URL changes
window.addEventListener('hashchange', highlightProductFromURL);
window.addEventListener('popstate', highlightProductFromURL);

// Load Products by Category with Hero Loading Animation
function loadProductsByCategory(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    console.log(`🎬 Loading ${category} products with enhanced hero animations...`);
    
    // First, clear the loading animation
    setTimeout(() => {
        const categoryProducts = products[category];
        container.innerHTML = '';
        container.classList.add('products-grid');

        if (categoryProducts && categoryProducts.length > 0) {
            console.log(`📦 Found ${categoryProducts.length} ${category} products to animate`);
            
            // Create products with smooth slide-in animations
            categoryProducts.forEach((product, index) => {
                const productCard = createProductCard(product);
                
                // Set initial hidden state for all products with stronger effects
                productCard.style.opacity = '0';
                productCard.style.transform = 'translateY(120px) scale(0.6) rotateX(15deg)';
                productCard.style.filter = 'blur(15px) grayscale(100%)';
                productCard.style.transition = 'none';
                productCard.style.pointerEvents = 'none';
                
                container.appendChild(productCard);
            });
            
            // Wait a bit then trigger sequential smooth animations
            setTimeout(() => {
                const productCards = container.querySelectorAll('.product-card');
                console.log(`🎭 Starting enhanced sequential animations for ${productCards.length} ${category} products`);
                
                productCards.forEach((card, index) => {
                    setTimeout(() => {
                        // Add different animation types for variety
                        const animationTypes = ['slide-in-left', 'slide-in-right', 'slide-in-bottom', 'fade-in-scale'];
                        const animationType = animationTypes[index % animationTypes.length];
                        
                        console.log(`🎨 Animating ${category} product ${index + 1} with ${animationType}`);
                        
                        // Apply smooth transition
                        card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        card.style.transitionDelay = `${index * 0.15}s`;
                        
                        // Reset to final state
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                        card.style.filter = 'blur(0px) grayscale(0%)';
                        card.style.pointerEvents = 'auto';
                        
                        // Apply animation class
                        card.classList.add(animationType);
                        card.classList.add('animated');
                        
                        console.log(`✨ ${category} product ${index + 1} animated successfully`);
                    }, index * 300); // Slower staggered timing for better visibility
                });
                
                // Add completion notification
                const totalAnimationTime = categoryProducts.length * 300 + 1000;
                setTimeout(() => {
                    console.log(`🎉 All ${category} products animation sequence completed!`);
                }, totalAnimationTime);
            }, 1000); // Longer delay to show loading state
            
        } else {
            container.innerHTML = `
                <div class="no-products hero-loading-main" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, rgba(255, 20, 147, 0.05), rgba(255, 105, 180, 0.05)); border-radius: 20px;">
                    <i class="fas fa-box-open" style="font-size: 4rem; color: #ff69b4; margin-bottom: 2rem; opacity: 0.7;"></i>
                    <h3 style="color: #ff1493; font-size: 1.5rem; margin-bottom: 1rem;">No Products Available</h3>
                    <p style="color: #666; font-size: 1.1rem;">This category is currently being updated with new products</p>
                </div>
            `;
        }
        
        console.log(`${category} products loaded with hero animations successfully`);
    }, 200); // Faster loading delay for smooth animations
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-actions">
                <button class="action-btn view-image-btn" title="View Image">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="toggleFavorite(${product.id})" title="Add to Favorites">
                    <i class="fas fa-heart ${favorites.includes(product.id) ? 'text-pink' : ''}"></i>
                </button>
                <button class="action-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                    <i class="fas fa-shopping-bag"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${product.price}</div>
            <div class="product-buttons">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="whatsapp-order-btn" onclick="orderSingleProduct(${product.id})" title="Order via WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    Order Now
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners for image viewing
    const productImage = card.querySelector('.product-image img');
    const viewBtn = card.querySelector('.view-image-btn');
    
    // Click on image to view
    if (productImage) {
        productImage.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showProductImage(product.image, product.name);
        });
    }
    
    // Click on view button to view
    if (viewBtn) {
        viewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showProductImage(product.image, product.name);
        });
    }
    
    return card;
}

// Toggle Favorite
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateCounters();
    updateFavoriteButtons();
    
    // Show notification
    showNotification(index > -1 ? 'Removed from favorites' : 'Added to favorites');
}

// Add to Cart
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCounters();
    
    // Show notification
    showNotification('Added to cart');
}

// Update Counters
function updateCounters() {
    document.getElementById('favCount').textContent = favorites.length;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Update Favorite Buttons
function updateFavoriteButtons() {
    document.querySelectorAll('.action-btn .fa-heart').forEach(btn => {
        const productId = parseInt(btn.closest('.product-card').querySelector('.add-to-cart-btn').getAttribute('onclick').match(/\d+/)[0]);
        btn.classList.toggle('text-pink', favorites.includes(productId));
    });
}

// Open Favorites Modal
function openFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorite items yet</p>';
    } else {
        favorites.forEach(productId => {
            const product = findProductById(productId);
            if (product) {
                const item = createFavoriteItem(product);
                favoritesList.appendChild(item);
            }
        });
    }
    
    modal.style.display = 'block';
}

// Close Favorites Modal
function closeFavoritesModal() {
    document.getElementById('favoritesModal').style.display = 'none';
}

// Open Cart Modal
function openCartModal() {
    const modal = document.getElementById('cartModal');
    const cartList = document.getElementById('cartList');
    
    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-message">Your cart is empty</p>';
    } else {
        cart.forEach(cartItem => {
            const product = findProductById(cartItem.id);
            if (product) {
                const item = createCartItem(product, cartItem.quantity);
                cartList.appendChild(item);
            }
        });
    }
    
    modal.style.display = 'block';
}

// Close Cart Modal
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Create Favorite Item
function createFavoriteItem(product) {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
            <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0;">${product.name}</h4>
                <p style="margin: 0; color: #ff1493; font-weight: bold;">${product.price}</p>
            </div>
            <button onclick="toggleFavorite(${product.id})" style="background: none; border: none; color: #ff1493; font-size: 1.2rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return item;
}

// Create Cart Item
function createCartItem(product, quantity) {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
            <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0;">${product.name}</h4>
                <p style="margin: 0; color: #ff1493; font-weight: bold;">${product.price}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="updateQuantity(${product.id}, -1)" style="width: 30px; height: 30px; border: 1px solid #ff1493; background: none; color: #ff1493; border-radius: 50%; cursor: pointer;">-</button>
                <span style="min-width: 30px; text-align: center;">${quantity}</span>
                <button onclick="updateQuantity(${product.id}, 1)" style="width: 30px; height: 30px; border: 1px solid #ff1493; background: #ff1493; color: white; border-radius: 50%; cursor: pointer;">+</button>
            </div>
            <button onclick="removeFromCart(${product.id})" style="background: none; border: none; color: #ff1493; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return item;
}

// Update Quantity
function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCounters();
            openCartModal(); // Refresh modal
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCounters();
    openCartModal(); // Refresh modal
    showNotification('Removed from cart');
}

// Find Product by ID
function findProductById(id) {
    for (const category in products) {
        const product = products[category].find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff1493;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Helper function to determine product category section
function getProductCategorySection(product) {
    if (!product.category) return '';
    
    const category = product.category.toLowerCase();
    if (category.includes('skin')) return '#skincare';
    if (category.includes('hair')) return '#haircare';
    if (category.includes('perfume')) return '#perfumes';
    return '';
}

// Order Single Product via WhatsApp
function orderSingleProduct(productId) {
    const product = findProductById(productId);
    if (!product) {
        showNotification('Product not found');
        return;
    }
    
    let message = "*NOVEMBER BRANDS - SINGLE PRODUCT ORDER*\n";
    message += "~Premium Beauty Products by Taghreed Nar\n\n";
    message += "Hello!\n\n";
    message += "I would like to order this specific product:\n\n";
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${product.name}\n`;
    message += `Description: ${product.description}\n`;
    message += `Price: ${product.price}\n`;
    message += `Quantity: 1 piece\n`;
    
    // Add product link with product ID parameter
    const currentDomain = window.location.origin;
    const currentPath = window.location.pathname;
    const categorySection = getProductCategorySection(product);
    const productLink = `${currentDomain}${currentPath}?product=${encodeURIComponent(product.name)}&id=${product.id}${categorySection}`;
    
    message += `Product Link: ${productLink}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `Thank you!`;
    
    const phoneNumber = "+201097927953";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Open WhatsApp
function openWhatsApp() {
    const phoneNumber = "+201097927953";
    let message = "🌸 *NOVEMBER BRANDS* 🌸\n";
    message += "✨ *Premium Beauty Products by Taghreed Nar* ✨\n\n";
    message += "مرحباً! 👋\n\n";
    message += "أنا مهتمة بمجموعتكم الرائعة من:\n";
    message += "💄 منتجات العناية بالبشرة\n";
    message += "💇‍♀️ علاجات العناية بالشعر\n";
    message += "🌺 العطور المميزة\n\n";
    message += "هل يمكنكم مشاركة المزيد من المعلومات حول:\n";
    message += "• المنتجات المتاحة والأسعار 💰\n";
    message += "• العروض الخاصة أو الباقات 🎁\n";
    message += "• خيارات التوصيل 🚚\n";
    message += "• توصيات المنتجات المناسبة لاحتياجاتي ✨\n\n";
    message += "أتطلع إلى سماع ردكم! 💕\n";
    message += "شكراً لكم! 🙏";
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Proceed to WhatsApp with Cart
function proceedToWhatsApp() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    let message = "🌸 *NOVEMBER BRANDS ORDER* 🌸\n";
    message += "✨ *Premium Beauty Products by Taghreed Nar* ✨\n\n";
    message += "Hello! I would like to order the following items:\n\n";
    
    let totalItems = 0;
    let estimatedTotal = 0;
    
    cart.forEach((cartItem, index) => {
        const product = findProductById(cartItem.id);
        if (product) {
            totalItems += cartItem.quantity;
            
            // Extract numeric price for calculation
            const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
            const itemTotal = priceValue * cartItem.quantity;
            estimatedTotal += itemTotal;
            
            message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `${index + 1}. 💄 *${product.name}*\n`;
            message += `📝 ${product.description}\n`;
            message += `💰 Price: ${product.price} each\n`;
            message += `📦 Quantity: ${cartItem.quantity}\n`;
            message += `💵 Subtotal: $${itemTotal.toFixed(2)}\n`;
            
            // Add product link with product ID parameter
            const currentDomain = window.location.origin;
            const currentPath = window.location.pathname;
            const categorySection = getProductCategorySection(product);
            const productLink = `${currentDomain}${currentPath}?product=${encodeURIComponent(product.name)}&id=${product.id}${categorySection}`;
            message += `🔗 Product Link: ${productLink}\n`;
            message += `\n`;
        }
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📊 *ORDER SUMMARY*\n`;
    message += `🛍️ Total Items: ${totalItems}\n`;
    message += `💰 Estimated Total: $${estimatedTotal.toFixed(2)}\n\n`;
    
    message += `📞 *CONTACT INFO*\n`;
    message += `👩‍💼 Contact Person: Taghreed Nar\n`;
    message += `📱 WhatsApp: +20 109 792 7953\n\n`;
    
    message += `🚚 Please confirm:\n`;
    message += `• Final pricing with any offers\n`;
    message += `• Delivery location and fees\n`;
    message += `• Expected delivery time\n`;
    message += `• Payment method\n\n`;
    
    message += `Thank you for choosing November Brands! 💕\n`;
    message += `We look forward to enhancing your beauty routine! ✨`;
    
    const phoneNumber = "+201097927953";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    console.log('Toggle mobile menu called'); // Debug log
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (mobileMenu) {
        const isActive = mobileMenu.classList.contains('active');
        
        if (isActive) {
            mobileMenu.classList.remove('active');
            body.style.overflow = 'auto';
            if (mobileToggle) mobileToggle.classList.remove('active');
        } else {
            mobileMenu.classList.add('active');
            body.style.overflow = 'hidden';
            if (mobileToggle) mobileToggle.classList.add('active');
        }
        
        console.log('Mobile menu active:', !isActive); // Debug log
    } else {
        console.log('Mobile menu element not found'); // Debug log
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        body.style.overflow = 'auto';
    }
}

// Update User Interface
function updateUserInterface() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (currentUser) {
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = logout;
        signupBtn.style.display = 'none';
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.reload();
}

// Scroll Header Effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Add CSS for text-pink class
const style = document.createElement('style');
style.textContent = `
    .text-pink {
        color: #ff1493 !important;
    }
    .empty-message {
        text-align: center;
        color: #666;
        padding: 2rem;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Check for product parameter in URL and highlight it
function highlightProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productName = urlParams.get('product');
    
    if (productId && productName) {
        console.log('Looking for product:', productId, productName);
        console.log('Available product cards:', document.querySelectorAll('[data-product-id]').length);
        
        // Navigate to the appropriate section first if hash exists
        const hash = window.location.hash;
        if (hash) {
            const targetSection = document.querySelector(hash);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Wait a bit for products to load, then highlight
        setTimeout(() => {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            console.log('Product card found:', productCard);
            
            if (productCard) {
                // Scroll to the product
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight effect
                productCard.style.border = '3px solid #ff1493';
                productCard.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.5)';
                productCard.style.transform = 'scale(1.05)';
                productCard.style.transition = 'all 0.3s ease';
                productCard.style.zIndex = '999';
                
                // Remove highlight after 5 seconds
                setTimeout(() => {
                    productCard.style.border = '';
                    productCard.style.boxShadow = '';
                    productCard.style.transform = '';
                    productCard.style.zIndex = '';
                }, 5000);
                
                // Show notification
                showNotification(`Found product: ${decodeURIComponent(productName)}`);
            } else {
                console.log('Product not found, trying again...');
                // Try again after more time for products to load
                setTimeout(() => {
                    const productCard2 = document.querySelector(`[data-product-id="${productId}"]`);
                    if (productCard2) {
                        productCard2.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        productCard2.style.border = '3px solid #ff1493';
                        productCard2.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.5)';
                        productCard2.style.transform = 'scale(1.05)';
                        productCard2.style.transition = 'all 0.3s ease';
                        productCard2.style.zIndex = '999';
                        
                        setTimeout(() => {
                            productCard2.style.border = '';
                            productCard2.style.boxShadow = '';
                            productCard2.style.transform = '';
                            productCard2.style.zIndex = '';
                        }, 5000);
                        
                        showNotification(`Found product: ${decodeURIComponent(productName)}`);
                    } else {
                        showNotification('Product not found. Please check if the product exists.');
                    }
                }, 3000);
            }
        }, 2000);
    }
}

// Function to refresh products (can be called when products are updated)
async function refreshProducts() {
    console.log('Refreshing products...');
    await loadProductsFromDatabase();
}

// Export for admin use
window.refreshProducts = refreshProducts; 