// Cart Functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    setupEventListeners();
    loadRecentlyViewed();
});

// Initialize Cart
function initializeCart() {
    // Load cart items from localStorage or session
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay(cartItems);
    updateCartSummary(cartItems);
}

// Setup Event Listeners
function setupEventListeners() {
    // Quantity Controls
    document.querySelectorAll('.quantity-controls').forEach(control => {
        const decreaseBtn = control.querySelector('.decrease');
        const increaseBtn = control.querySelector('.increase');
        const input = control.querySelector('input');

        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
                updateItemTotal(control.closest('.cart-item'));
            }
        });

        increaseBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            input.value = value + 1;
            updateItemTotal(control.closest('.cart-item'));
        });

        input.addEventListener('change', () => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 1) {
                input.value = 1;
            }
            updateItemTotal(control.closest('.cart-item'));
        });
    });

    // Remove Buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cartItem = btn.closest('.cart-item');
            removeCartItem(cartItem);
        });
    });

    // Coupon Code
    const couponBtn = document.querySelector('.coupon button');
    if (couponBtn) {
        couponBtn.addEventListener('click', applyCoupon);
    }

    // Checkout Button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

// Update Item Total
function updateItemTotal(cartItem) {
    const price = parseFloat(cartItem.querySelector('.price').textContent.replace('$', ''));
    const quantity = parseInt(cartItem.querySelector('input').value);
    const total = price * quantity;
    
    cartItem.querySelector('.total').textContent = `$${total.toFixed(2)}`;
    updateCartSummary();
}

// Remove Cart Item
function removeCartItem(cartItem) {
    cartItem.remove();
    updateCartSummary();
    showNotification('Item removed from cart');
}

// Update Cart Summary
function updateCartSummary() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    cartItems.forEach(item => {
        const price = parseFloat(item.querySelector('.price').textContent.replace('$', ''));
        const quantity = parseInt(item.querySelector('input').value);
        subtotal += price * quantity;
    });

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    document.querySelector('.summary-item:nth-child(1) span:last-child').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('.summary-item:nth-child(3) span:last-child').textContent = `$${tax.toFixed(2)}`;
    document.querySelector('.summary-item.total span:last-child').textContent = `$${total.toFixed(2)}`;
}

// Apply Coupon
function applyCoupon() {
    const couponInput = document.querySelector('.coupon input');
    const couponCode = couponInput.value.trim();
    
    if (couponCode === 'FURNISH10') {
        const subtotal = parseFloat(document.querySelector('.summary-item:nth-child(1) span:last-child').textContent.replace('$', ''));
        const discount = subtotal * 0.1; // 10% discount
        
        // Add discount to summary
        const discountItem = document.createElement('div');
        discountItem.className = 'summary-item';
        discountItem.innerHTML = `
            <span>Discount (10%)</span>
            <span>-$${discount.toFixed(2)}</span>
        `;
        
        const totalItem = document.querySelector('.summary-item.total');
        totalItem.parentNode.insertBefore(discountItem, totalItem);
        
        // Update total
        const currentTotal = parseFloat(totalItem.querySelector('span:last-child').textContent.replace('$', ''));
        totalItem.querySelector('span:last-child').textContent = `$${(currentTotal - discount).toFixed(2)}`;
        
        showNotification('Coupon applied successfully!');
        couponInput.disabled = true;
        document.querySelector('.coupon button').disabled = true;
    } else {
        showNotification('Invalid coupon code');
    }
}

// Proceed to Checkout
function proceedToCheckout() {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    // Here you would typically redirect to a checkout page
    // For now, we'll just show a notification
    showNotification('Redirecting to checkout...');
}

// Load Recently Viewed
function loadRecentlyViewed() {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const productsGrid = document.querySelector('.recently-viewed .products-grid');
    
    if (recentlyViewed.length === 0) {
        productsGrid.innerHTML = '<p>No recently viewed items</p>';
        return;
    }

    productsGrid.innerHTML = recentlyViewed.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="add-to-wishlist" data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
`;
document.head.appendChild(style); 