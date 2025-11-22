import express from 'express';
import {
  createRequest,
  getRequests,
  getRequest,
  updateRequestStatus,
  cancelRequest,
  getRequestStats
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { requestValidation } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Common routes
router.get('/', getRequests);
router.get('/stats', getRequestStats);
router.get('/:id', getRequest);

// Receiver routes
router.post(
  '/',
  authorize('receiver'),
  requestValidation,
  createRequest
);

router.put(
  '/:id/cancel',
  authorize('receiver'),
  cancelRequest
);

// Donor routes
router.put(
  '/:id/status',
  authorize('donor'),
  updateRequestStatus
);

export default router;
