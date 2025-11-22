import express from 'express';
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getMyItems
} from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { itemValidation } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/:id', getItem);

// Protected routes - donors only
router.post(
  '/',
  protect,
  authorize('donor'),
  upload.array('images', 5),
  itemValidation,
  createItem
);

router.put(
  '/:id',
  protect,
  authorize('donor'),
  upload.array('images', 5),
  updateItem
);

router.delete(
  '/:id',
  protect,
  authorize('donor'),
  deleteItem
);

router.get(
  '/my/items',
  protect,
  authorize('donor'),
  getMyItems
);

export default router;
