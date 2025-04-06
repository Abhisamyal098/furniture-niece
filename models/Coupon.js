const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: [true, 'Please add a discount value'],
        min: [0, 'Discount value must be at least 0']
    },
    minPurchase: {
        type: Number,
        min: [0, 'Minimum purchase must be at least 0']
    },
    maxDiscount: {
        type: Number,
        min: [0, 'Maximum discount must be at least 0']
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please add an end date']
    },
    usageLimit: {
        type: Number,
        min: [0, 'Usage limit must be at least 0']
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Validate coupon
couponSchema.methods.validateCoupon = async function(totalAmount) {
    const now = new Date();

    if (!this.isActive) {
        return {
            isValid: false,
            message: 'Coupon is not active'
        };
    }

    if (now < this.startDate) {
        return {
            isValid: false,
            message: 'Coupon has not started yet'
        };
    }

    if (now > this.endDate) {
        return {
            isValid: false,
            message: 'Coupon has expired'
        };
    }

    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return {
            isValid: false,
            message: 'Coupon usage limit reached'
        };
    }

    if (this.minPurchase && totalAmount < this.minPurchase) {
        return {
            isValid: false,
            message: `Minimum purchase amount of ${this.minPurchase} required`
        };
    }

    return {
        isValid: true,
        message: 'Coupon is valid'
    };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(totalAmount) {
    let discount = 0;

    if (this.discountType === 'percentage') {
        discount = totalAmount * (this.discountValue / 100);
    } else {
        discount = this.discountValue;
    }

    if (this.maxDiscount && discount > this.maxDiscount) {
        discount = this.maxDiscount;
    }

    return discount;
};

// Increment used count
couponSchema.methods.incrementUsedCount = async function() {
    this.usedCount += 1;
    await this.save();
};

module.exports = mongoose.model('Coupon', couponSchema); 