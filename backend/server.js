const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('rate-limiter-flexible');
require('dotenv').config();

// Import services
const becknService = require('./services/becknService');
const blockchainService = require('./services/blockchainService');
const aiFilterService = require('./services/aiFilterService');
const voiceAssistant = require('./services/voiceAssistant');
const ipfsStorage = require('./services/ipfsStorage');
const { dbHelpers, COLLECTIONS } = require('./config/dbConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new rateLimit.RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Beckn Protocol APIs
app.post('/api/beckn/search', async (req, res) => {
  try {
    const { query, location, dateRange, checkIn, checkOut } = req.body;
    const results = await becknService.search({
      query, location, dateRange, checkIn, checkOut
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/beckn/quote', async (req, res) => {
  try {
    const { destinationId, guestCount, dates } = req.body;
    const quote = await becknService.getQuote(destinationId, guestCount, dates);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/beckn/book', async (req, res) => {
  try {
    const { quoteId, userDetails, paymentDetails } = req.body;
    
    // Initialize booking
    const initResult = await becknService.initBooking(quoteId, userDetails);
    
    // Confirm booking
    const booking = await becknService.confirmBooking(initResult.orderId, paymentDetails);
    
    // Store in IPFS
    const ipfsResult = await ipfsStorage.storeBookingData(booking);
    
    // Log on blockchain
    const blockchainResult = await blockchainService.logBooking(
      booking.id, 
      ipfsResult.ipfsHash, 
      booking.payment.params.amount
    );
    
    res.json({ 
      success: true, 
      booking,
      ipfsHash: ipfsResult.ipfsHash,
      txHash: blockchainResult.txHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Services APIs
app.post('/api/ai/filter', async (req, res) => {
  try {
    const { criteria, destinations } = req.body;
    const filtered = await aiFilterService.filterDestinations(criteria, destinations);
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/itinerary', async (req, res) => {
  try {
    const { destination, preferences, duration } = req.body;
    const itinerary = await aiFilterService.generateItinerary(destination, preferences, duration);
    res.json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { userId, location, preferences } = req.body;
    const recommendations = await aiFilterService.getRecommendations(userId, location, preferences);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Voice Assistant APIs
app.post('/api/voice/query', async (req, res) => {
  try {
    const { audioBuffer, language, userId } = req.body;
    const buffer = Buffer.from(audioBuffer, 'base64');
    const result = await voiceAssistant.handleVoiceQuery(buffer, language, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voice/text', async (req, res) => {
  try {
    const { text, language, userId } = req.body;
    const result = await voiceAssistant.processQuery(text, language, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blockchain APIs
app.post('/api/blockchain/verify', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const verification = await blockchainService.verifyBooking(bookingId);
    res.json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blockchain/rating', async (req, res) => {
  try {
    const { bookingId, rating, reviewData } = req.body;
    
    // Store review in IPFS
    const ipfsResult = await ipfsStorage.storeReviewData(reviewData);
    
    // Log rating on blockchain
    const blockchainResult = await blockchainService.logRating(
      bookingId, 
      rating, 
      ipfsResult.ipfsHash
    );
    
    res.json({ 
      success: true, 
      txHash: blockchainResult.txHash,
      ipfsHash: ipfsResult.ipfsHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IPFS APIs
app.get('/api/ipfs/retrieve/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const data = await ipfsStorage.retrieveData(hash);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ipfs/verify', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const verification = await ipfsStorage.verifyDataIntegrity(bookingId);
    res.json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`VillageStay Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;