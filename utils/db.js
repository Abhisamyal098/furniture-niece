const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});

// Handle process termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
});

// Create indexes
const createIndexes = async () => {
    try {
        // User indexes
        await mongoose.model('User').createIndexes([
            { email: 1 },
            { role: 1 }
        ]);

        // Product indexes
        await mongoose.model('Product').createIndexes([
            { name: 'text', description: 'text' },
            { category: 1 },
            { subcategory: 1 },
            { price: 1 },
            { ratings: 1 }
        ]);

        // Category indexes
        await mongoose.model('Category').createIndexes([
            { name: 1 },
            { parent: 1 }
        ]);

        // Order indexes
        await mongoose.model('Order').createIndexes([
            { user: 1 },
            { status: 1 },
            { createdAt: -1 }
        ]);

        // Review indexes
        await mongoose.model('Review').createIndexes([
            { product: 1 },
            { user: 1 },
            { rating: 1 }
        ]);

        // Coupon indexes
        await mongoose.model('Coupon').createIndexes([
            { code: 1 },
            { isActive: 1 }
        ]);

        console.log('Indexes created successfully');
    } catch (error) {
        console.error(`Error creating indexes: ${error.message}`);
    }
};

// Drop database
const dropDatabase = async () => {
    try {
        await mongoose.connection.dropDatabase();
        console.log('Database dropped successfully');
    } catch (error) {
        console.error(`Error dropping database: ${error.message}`);
    }
};

// Clear collections
const clearCollections = async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
        console.log('Collections cleared successfully');
    } catch (error) {
        console.error(`Error clearing collections: ${error.message}`);
    }
};

module.exports = {
    connectDB,
    createIndexes,
    dropDatabase,
    clearCollections
}; 