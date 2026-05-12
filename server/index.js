require('dotenv').config();
const express = require('express');
const cors = require('cors');

const hairTryonRouter      = require('./routes/hairTryon');
const nailTryonRouter      = require('./routes/nailTryon');
const hairStyleTryonRouter = require('./routes/hairStyleTryon');
const skusRouter           = require('./routes/skus');
const testRouter           = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/hair-tryon', hairTryonRouter);
app.use('/api/nail-tryon', nailTryonRouter);
app.use('/api/hair-style-tryon', hairStyleTryonRouter);
app.use('/api/skus', skusRouter);
app.use('/api/test', testRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED SERVER ERROR ===');
  console.error('Message:', err.message);
  console.error('Status:', err.status);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
