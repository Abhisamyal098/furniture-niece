const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be at least 0']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot be more than 100']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be less than 0']
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
            type: String,
            enum: ['cm', 'inch'],
            default: 'cm'
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lb'],
            default: 'kg'
        }
    },
    materials: [String],
    colors: [String],
    features: [String],
    ratings: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Review'
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
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

// Update updatedAt before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = async function() {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        {
            $match: { product: this._id }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        this.ratings = Math.round(stats[0].averageRating * 10) / 10;
    } else {
        this.ratings = 0;
    }

    await this.save();
};

module.exports = mongoose.model('Product', productSchema); 