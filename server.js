import app from './src/app.js';
import { PORT } from './src/config/env.js';
import connectDB from './src/config/database.js';

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
