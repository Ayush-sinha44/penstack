import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['donor', 'receiver'])
    .withMessage('Role must be either donor or receiver'),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

export const itemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['book', 'notebook', 'pen', 'pencil', 'calculator', 'ruler', 'eraser', 'other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required')
];

export const requestValidation = [
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('message').optional().trim().isLength({ max: 500 })
];
