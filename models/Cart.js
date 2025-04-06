const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    coupon: {
        code: String,
        discount: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update total items and price before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
    
    const itemsTotal = this.items.reduce(
        (acc, item) => acc + (item.price * item.quantity),
        0
    );
    
    this.totalPrice = this.coupon && this.coupon.discount
        ? itemsTotal - (itemsTotal * this.coupon.discount / 100)
        : itemsTotal;
    
    this.updatedAt = Date.now();
    next();
});

// Add item to cart
cartSchema.methods.addItem = async function(productId, quantity, price) {
    const existingItem = this.items.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ product: productId, quantity, price });
    }

    await this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = async function(productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId
    );

    await this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId
    );

    if (item) {
        item.quantity = quantity;
        await this.save();
    }
};

// Clear cart
cartSchema.methods.clearCart = async function() {
    this.items = [];
    this.totalItems = 0;
    this.totalPrice = 0;
    this.coupon = undefined;
    await this.save();
};

// Apply coupon
cartSchema.methods.applyCoupon = async function(coupon) {
    this.coupon = {
        code: coupon.code,
        discount: coupon.discountValue
    };
    await this.save();
};

// Remove coupon
cartSchema.methods.removeCoupon = async function() {
    this.coupon = undefined;
    await this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 