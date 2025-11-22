import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRE } from '../config/env.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.getPublicProfile()
  });
};
