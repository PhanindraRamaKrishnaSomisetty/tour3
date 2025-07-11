# VillageStay - Rural Tourism Platform

A comprehensive full-stack platform for authentic rural tourism experiences with blockchain integration, AI-powered recommendations, and voice assistance.

## 🏗️ Architecture

### Backend Services
- **becknService.js** - Beckn Protocol integration for discovery, quotes, and bookings
- **blockchainService.js** - Ethereum smart contracts for immutable booking logs
- **aiFilterService.js** - Gemini AI for personalized content and itineraries
- **voiceAssistant.js** - Multi-language voice queries with Speech-to-Text
- **ipfsStorage.js** - Immutable data storage for booking integrity
- **dbConfig.js** - Firebase Firestore real-time database

### Key Features
- 🔍 **Beckn Protocol** - Standardized discovery and booking APIs
- ⛓️ **Blockchain Logging** - Immutable booking and rating records
- 🤖 **AI Recommendations** - Personalized destination filtering
- 🎤 **Voice Assistant** - Regional language support (Telugu, Hindi, Tamil, Kannada)
- 📦 **IPFS Storage** - Decentralized data integrity
- 🔥 **Firebase Integration** - Real-time database and authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Firebase project
- Google Cloud account
- Ethereum wallet

### Environment Setup
```bash
# Clone repository
git clone <your-repo-url>
cd villagestay

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install

# Start development
npm run dev
```

### Docker Deployment
```bash
# Build and run with Docker Compose
cd deploy
docker-compose up -d

# Or build individual container
cd backend
docker build -t villagestay/backend .
docker run -p 3000:3000 --env-file .env villagestay/backend
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f deploy/kubernetes/

# Check deployment status
kubectl get pods -n villagestay
kubectl get services -n villagestay
```

## 📡 API Endpoints

### Beckn Protocol
- `POST /api/beckn/search` - Search destinations
- `POST /api/beckn/quote` - Get booking quotes
- `POST /api/beckn/book` - Complete booking

### AI Services
- `POST /api/ai/filter` - Filter destinations with AI
- `POST /api/ai/itinerary` - Generate travel itinerary
- `POST /api/ai/recommendations` - Get personalized recommendations

### Voice Assistant
- `POST /api/voice/query` - Process voice queries
- `POST /api/voice/text` - Process text queries

### Blockchain
- `POST /api/blockchain/verify` - Verify booking integrity
- `POST /api/blockchain/rating` - Log ratings on blockchain

### IPFS
- `GET /api/ipfs/retrieve/:hash` - Retrieve IPFS data
- `POST /api/ipfs/verify` - Verify data integrity

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore
3. Generate service account key
4. Update `.env` with credentials

### Blockchain Setup
1. Deploy smart contract (contracts/BookingContract.sol)
2. Update contract address in `.env`
3. Fund wallet for gas fees

### Google Cloud Setup
1. Enable Speech-to-Text API
2. Create service account
3. Download credentials JSON
4. Set GOOGLE_CLOUD_KEY_PATH

### IPFS Setup
1. Create Infura IPFS project
2. Get project ID and secret
3. Update IPFS_AUTH in `.env`

## 🏭 Production Deployment

### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/villagestay-backend
gcloud run deploy --image gcr.io/PROJECT_ID/villagestay-backend --platform managed
```

### Firebase Functions
```bash
# Deploy individual functions
firebase deploy --only functions:becknSearch
firebase deploy --only functions:aiRecommendations
```

### Kubernetes (GKE)
```bash
# Create cluster
gcloud container clusters create villagestay-cluster --num-nodes=3

# Deploy application
kubectl apply -f deploy/kubernetes/
```

## 🔒 Security Features

- Rate limiting (100 requests/minute)
- Helmet.js security headers
- Input validation with Joi
- Firebase Authentication
- Blockchain transaction verification
- IPFS data integrity checks

## 📊 Monitoring

### Health Checks
- `/health` endpoint for service status
- Kubernetes liveness/readiness probes
- Docker health checks

### Logging
- Winston structured logging
- Request/response logging
- Error tracking
- Performance metrics

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## 📈 Scaling

### Horizontal Pod Autoscaler
- CPU-based scaling (70% threshold)
- Memory-based scaling (80% threshold)
- Min 3, Max 10 replicas

### Database Optimization
- Firestore batch operations
- Query result caching
- Connection pooling

### AI Service Optimization
- Prompt engineering for minimal tokens
- Response caching
- Batch processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.villagestay.com](https://docs.villagestay.com)
- Issues: GitHub Issues
- Email: support@villagestay.com

---

Built with ❤️ for sustainable rural tourism