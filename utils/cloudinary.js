const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
const uploadImage = async (file, folder = 'furnicraft') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete image
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        return {
            success: true,
            result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);

        return {
            success: true,
            result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get image URL
const getImageUrl = (publicId, options = {}) => {
    try {
        const url = cloudinary.url(publicId, {
            secure: true,
            ...options
        });

        return {
            success: true,
            url
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    deleteMultipleImages,
    getImageUrl
}; 