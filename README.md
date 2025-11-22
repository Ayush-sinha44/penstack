# Stationary Exchange System - Backend

Backend API for university stationary exchange system built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT Authentication
- ✅ Two user roles: Donor & Receiver
- ✅ Item listing and management
- ✅ Request system with approval workflow
- ✅ Image upload support
- ✅ Advanced search and filtering
- ✅ Role-based access control
- ✅ Request statistics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer express-validator
npm install --save-dev nodemon
```

2. Make sure MongoDB is running:
```bash
sudo systemctl start mongodb
# or
mongod
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile

### Items
- GET /api/items - Get all items (public)
- GET /api/items/:id - Get single item (public)
- POST /api/items - Create item (donor only)
- PUT /api/items/:id - Update item (donor only)
- DELETE /api/items/:id - Delete item (donor only)
- GET /api/items/my/items - Get my items (donor only)

### Requests
- POST /api/requests - Create request (receiver only)
- GET /api/requests - Get requests (filtered by role)
- GET /api/requests/:id - Get single request
- PUT /api/requests/:id/status - Update request status (donor only)
- PUT /api/requests/:id/cancel - Cancel request (receiver only)
- GET /api/requests/stats - Get request statistics

## Environment Variables

Create a .env file in the root directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stationary_exchange
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Testing

Use Postman or curl to test the API endpoints.

Example register request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@university.edu",
    "password": "password123",
    "role": "donor",
    "university": "XYZ University",
    "department": "Computer Science",
    "phoneNumber": "+1234567890"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── models/         # Database models
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── uploads/            # Uploaded files
├── .env                # Environment variables
├── .gitignore
├── package.json
├── server.js           # Entry point
└── README.md
```

## License

ISC
