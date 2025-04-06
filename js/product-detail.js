// Product Detail Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeImageGallery();
    initializeTabs();
    setupQuantityControls();
    setupProductActions();
});

// Image Gallery Functionality
function initializeImageGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Update main image
            mainImage.src = thumbnail.src;
            
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });
}

// Tab Functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding tab pane
            tabPanes.forEach(pane => {
                if (pane.id === tabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

// Quantity Controls
function setupQuantityControls() {
    const decreaseBtn = document.querySelector('.decrease');
    const increaseBtn = document.querySelector('.increase');
    const quantityInput = document.querySelector('.quantity-controls input');

    decreaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    increaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
    });

    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        }
    });
}

// Product Actions (Add to Cart, Buy Now, Wishlist)
function setupProductActions() {
    const addToCartBtn = document.querySelector('.add-to-cart');
    const buyNowBtn = document.querySelector('.buy-now');
    const addToWishlistBtn = document.querySelector('.add-to-wishlist');
    const quantityInput = document.querySelector('.quantity-controls input');

    // Add to Cart
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        // Add product to cart with quantity
        showNotification('Product added to cart!');
    });

    // Buy Now
    buyNowBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        // Redirect to checkout with product
        showNotification('Redirecting to checkout...');
    });

    // Add to Wishlist
    addToWishlistBtn.addEventListener('click', () => {
        // Add product to wishlist
        addToWishlistBtn.classList.toggle('active');
        if (addToWishlistBtn.classList.contains('active')) {
            showNotification('Product added to wishlist!');
        } else {
            showNotification('Product removed from wishlist!');
        }
    });
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2c3e50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .add-to-wishlist.active {
        color: #e74c3c;
    }
`;
document.head.appendChild(style); 