import { validationResult } from 'express-validator';
import Request from '../models/Request.js';
import Item from '../models/Item.js';

// Create request (receivers only)
export const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { itemId, message } = req.body;

    // Check if item exists and is available
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available'
      });
    }

    // Check if user is the donor
    if (item.donor.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own item'
      });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      item: itemId,
      receiver: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved request for this item'
      });
    }

    const request = await Request.create({
      item: itemId,
      receiver: req.user.id,
      donor: item.donor,
      message
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('item', 'title category condition images')
      .populate('receiver', 'name university department phoneNumber')
      .populate('donor', 'name phoneNumber');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get all requests (filtered by user role)
export const getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // If user is donor, show requests for their items
    // If user is receiver, show their requests
    if (req.user.role === 'donor') {
      query.donor = req.user.id;
    } else {
      query.receiver = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('item', 'title category condition images pickupLocation')
      .populate('receiver', 'name university department phoneNumber email')
      .populate('donor', 'name phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// Get single request
export const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('item', 'title category condition images pickupLocation')
      .populate('receiver', 'name university department phoneNumber email')
      .populate('donor', 'name phoneNumber');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (
      request.receiver.toString() !== req.user.id &&
      request.donor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Update request status (donors only)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, responseMessage, scheduledPickupDate } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only donor can update status
    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Validate status transition
    const validStatuses = ['approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    request.status = status;
    if (responseMessage) request.responseMessage = responseMessage;
    if (scheduledPickupDate) request.scheduledPickupDate = scheduledPickupDate;

    await request.save();

    // Update item status if approved
    if (status === 'approved') {
      await Item.findByIdAndUpdate(request.item, { status: 'reserved' });
    } else if (status === 'rejected') {
      await Item.findByIdAndUpdate(request.item, { status: 'available' });
    } else if (status === 'completed') {
      await Item.findByIdAndUpdate(request.item, { status: 'donated' });
    }

    const updatedRequest = await Request.findById(request._id)
      .populate('item', 'title category condition images pickupLocation')
      .populate('receiver', 'name university department phoneNumber email')
      .populate('donor', 'name phoneNumber');

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// Cancel request (receivers only)
export const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only receiver can cancel
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    // Can only cancel pending or approved requests
    if (!['pending', 'approved'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this request'
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Make item available again
    await Item.findByIdAndUpdate(request.item, { status: 'available' });

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get request statistics (for dashboard)
export const getRequestStats = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user.id;
    } else {
      query.receiver = req.user.id;
    }

    const stats = await Request.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};
