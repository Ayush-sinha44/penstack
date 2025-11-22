import { validationResult } from 'express-validator';
import Item from '../models/Item.js';

// Create item (donors only)
export const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, category, condition, quantity, tags, pickupLocation } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const item = await Item.create({
      title,
      description,
      category,
      condition,
      quantity,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      pickupLocation,
      images,
      donor: req.user.id
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Get all items with filters
export const getItems = async (req, res, next) => {
  try {
    const {
      category,
      condition,
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (status) query.status = status;
    
    if (search) {
      query.$text = { $search: search };
    }

    const items = await Item.find(query)
      .populate('donor', 'name university department phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      count: items.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// Get single item
export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('donor', 'name university department phoneNumber email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Update item (only by donor)
export const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = [...item.images, ...newImages];
    }

    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Delete item (only by donor)
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get my items (for donors)
export const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ donor: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};
