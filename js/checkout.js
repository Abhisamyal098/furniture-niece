document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout
    initCheckout();
});

function initCheckout() {
    // Load cart items
    loadCartItems();
    
    // Setup form event listeners
    setupFormListeners();
    
    // Populate states dropdown
    populateStates();
}

function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.querySelector('.order-items');
    const orderSummaryContainer = document.querySelector('.order-summary-sidebar .order-items');
    
    if (cartItems.length === 0) {
        showEmptyCartMessage();
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    const taxRate = 0.1; // 10% tax rate
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    orderSummaryContainer.innerHTML = '';
    
    // Add items to both containers
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemHTML = `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-item-details">
                    <div class="order-item-title">${item.name}</div>
                    <div class="order-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="order-item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
        
        orderItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        orderSummaryContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    // Calculate tax and total
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Update totals in both containers
    updateTotals(subtotal, tax, total);
}

function updateTotals(subtotal, tax, total) {
    const totalContainers = document.querySelectorAll('.order-totals');
    
    totalContainers.forEach(container => {
        container.innerHTML = `
            <div class="total-item">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-item">
                <span>Shipping</span>
                <span>Free</span>
            </div>
            <div class="total-item">
                <span>Tax</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="total-item grand-total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    });
}

function setupFormListeners() {
    // Shipping form submission
    const shippingForm = document.getElementById('shippingForm');
    shippingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateShippingForm()) {
            showPaymentForm();
        }
    });
    
    // Payment form submission
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validatePaymentForm()) {
            showReviewForm();
        }
    });
    
    // Place order button
    const placeOrderBtn = document.querySelector('.place-order-btn');
    placeOrderBtn.addEventListener('click', function() {
        placeOrder();
    });
}

function validateShippingForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
        } else {
            clearError(field);
        }
    });
    
    // Validate email format
    const email = document.getElementById('email');
    if (email.value && !isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone format
    const phone = document.getElementById('phone');
    if (phone.value && !isValidPhone(phone.value)) {
        showError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function validatePaymentForm() {
    const requiredFields = ['cardNumber', 'expiry', 'cvv', 'cardName'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
        } else {
            clearError(field);
        }
    });
    
    // Validate card number
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber.value && !isValidCardNumber(cardNumber.value)) {
        showError(cardNumber, 'Please enter a valid card number');
        isValid = false;
    }
    
    // Validate expiry date
    const expiry = document.getElementById('expiry');
    if (expiry.value && !isValidExpiry(expiry.value)) {
        showError(expiry, 'Please enter a valid expiry date (MM/YY)');
        isValid = false;
    }
    
    // Validate CVV
    const cvv = document.getElementById('cvv');
    if (cvv.value && !isValidCVV(cvv.value)) {
        showError(cvv, 'Please enter a valid CVV');
        isValid = false;
    }
    
    return isValid;
}

function showPaymentForm() {
    document.getElementById('shippingForm').classList.add('hidden');
    document.getElementById('paymentForm').classList.remove('hidden');
    updateStep(2);
}

function showReviewForm() {
    document.getElementById('paymentForm').classList.add('hidden');
    document.getElementById('reviewForm').classList.remove('hidden');
    updateStep(3);
    
    // Populate review information
    populateReviewInfo();
}

function populateReviewInfo() {
    // Shipping information
    const shippingInfo = document.querySelector('.shipping-info .info-content');
    const shippingData = {
        name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };
    
    shippingInfo.innerHTML = `
        <p><strong>Name:</strong> ${shippingData.name}</p>
        <p><strong>Email:</strong> ${shippingData.email}</p>
        <p><strong>Phone:</strong> ${shippingData.phone}</p>
        <p><strong>Address:</strong> ${shippingData.address}</p>
        <p><strong>City:</strong> ${shippingData.city}</p>
        <p><strong>State:</strong> ${shippingData.state}</p>
        <p><strong>ZIP:</strong> ${shippingData.zip}</p>
    `;
    
    // Payment information
    const paymentInfo = document.querySelector('.payment-info .info-content');
    const cardNumber = document.getElementById('cardNumber').value;
    const lastFour = cardNumber.slice(-4);
    
    paymentInfo.innerHTML = `
        <p><strong>Card Number:</strong> **** **** **** ${lastFour}</p>
        <p><strong>Expiry Date:</strong> ${document.getElementById('expiry').value}</p>
        <p><strong>Name on Card:</strong> ${document.getElementById('cardName').value}</p>
    `;
}

function updateStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function placeOrder() {
    // In a real application, you would send this data to your backend
    const orderData = {
        shipping: {
            name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value
        },
        payment: {
            cardNumber: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value,
            name: document.getElementById('cardName').value
        },
        items: JSON.parse(localStorage.getItem('cart')) || [],
        total: parseFloat(document.querySelector('.grand-total span:last-child').textContent.replace('$', ''))
    };
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show success message
    showNotification('Order placed successfully!', 'success');
    
    // Redirect to order confirmation page
    setTimeout(() => {
        window.location.href = 'order-confirmation.html';
    }, 2000);
}

function populateStates() {
    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
        'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
        'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
        'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
        'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    
    const stateSelect = document.getElementById('state');
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Utility functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

function isValidCardNumber(cardNumber) {
    return /^\d{16}$/.test(cardNumber.replace(/\s/g, ''));
}

function isValidExpiry(expiry) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function showError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

function clearError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showEmptyCartMessage() {
    const checkoutContainer = document.querySelector('.checkout-container');
    checkoutContainer.innerHTML = `
        <div class="empty-cart-message">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 