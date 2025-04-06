const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parent', 'name')
            .sort('name');

        sendSuccess(res, categories);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent', 'name');

        if (!category) {
            return sendNotFound(res, 'Category not found');
        }

        sendSuccess(res, category);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parent } = req.body;

        // Check if parent exists
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return sendNotFound(res, 'Parent category not found');
            }
        }

        // Upload image
        let image;
        if (req.file) {
            const result = await uploadImage(req.file.path);
            image = {
                url: result.url,
                public_id: result.public_id
            };
        }

        // Create category
        const category = await Category.create({
            name,
            description,
            parent,
            image
        });

        sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
        sendError(res, error.message);
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, parent } = req.body;

        // Get category
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendNotFound(res, 'Category not found');
        }

        // Check if parent exists
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return sendNotFound(res, 'Parent category not found');
            }
        }

        // Handle image update
        if (req.file) {
            // Delete old image
            if (category.image && category.image.public_id) {
                await deleteImage(category.image.public_id);
            }

            // Upload new image
            const result = await uploadImage(req.file.path);
            category.image = {
                url: result.url,
                public_id: result.public_id
            };
        }

        // Update category
        Object.assign(category, {
            name,
            description,
            parent
        });

        await category.save();

        sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendNotFound(res, 'Category not found');
        }

        // Delete image
        if (category.image && category.image.public_id) {
            await deleteImage(category.image.public_id);
        }

        await category.remove();

        sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
        sendError(res, error.message);
    }
};

// Get subcategories
exports.getSubcategories = async (req, res) => {
    try {
        const subcategories = await Category.find({ parent: req.params.id })
            .sort('name');

        sendSuccess(res, subcategories);
    } catch (error) {
        sendError(res, error.message);
    }
}; 