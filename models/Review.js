const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    images: [{
        url: String,
        public_id: String
    }],
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    isHelpful: {
        type: Number,
        default: 0
    },
    isNotHelpful: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
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

// Prevent user from submitting more than one review per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update timestamps before saving
reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            ratings: Math.round(stats[0].averageRating * 10) / 10
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            ratings: 0
        });
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', function() {
    this.constructor.calculateAverageRating(this.product);
});

// Method to like a review
reviewSchema.methods.likeReview = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        this.isHelpful += 1;
        await this.save();
    }
    return this;
};

// Method to unlike a review
reviewSchema.methods.unlikeReview = async function(userId) {
    if (this.likes.includes(userId)) {
        this.likes = this.likes.filter(id => id.toString() !== userId.toString());
        this.isHelpful -= 1;
        await this.save();
    }
    return this;
};

// Method to mark as not helpful
reviewSchema.methods.markNotHelpful = async function() {
    this.isNotHelpful += 1;
    await this.save();
    return this;
};

module.exports = mongoose.model('Review', reviewSchema); 