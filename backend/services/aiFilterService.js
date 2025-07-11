const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbHelpers, COLLECTIONS } = require('../config/dbConfig');

class AIFilterService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Optimized prompts for minimal token usage
    this.prompts = {
      filter: "Filter destinations based on: {criteria}. Return JSON: {destinations: [id1, id2]}",
      itinerary: "Create 3-day rural itinerary for {location}. Max 200 words. JSON format.",
      personalize: "Personalize content for user preferences: {prefs}. Brief response."
    };
  }

  // AI-powered destination filtering
  async filterDestinations(criteria, destinations) {
    try {
      const prompt = this.prompts.filter.replace('{criteria}', 
        `Budget: ${criteria.budget}, Interests: ${criteria.interests.join(',')}, Duration: ${criteria.duration}`
      );

      const destinationData = destinations.map(d => ({
        id: d.id,
        name: d.name,
        price: d.price,
        activities: d.activities.slice(0, 3), // Limit for token efficiency
        rating: d.rating
      }));

      const result = await this.model.generateContent(
        `${prompt}\nDestinations: ${JSON.stringify(destinationData)}`
      );

      const response = result.response.text();
      const filtered = JSON.parse(response);
      
      return destinations.filter(d => filtered.destinations.includes(d.id));
    } catch (error) {
      console.error('AI filtering error:', error);
      // Fallback to basic filtering
      return this.basicFilter(criteria, destinations);
    }
  }

  // Generate personalized itinerary
  async generateItinerary(destination, userPreferences, duration = 3) {
    try {
      const prompt = this.prompts.itinerary
        .replace('{location}', destination.name)
        .replace('3-day', `${duration}-day`);

      const context = `
        Destination: ${destination.name}
        Activities: ${destination.activities.slice(0, 5).join(', ')}
        User interests: ${userPreferences.interests?.join(', ') || 'general'}
        Budget level: ${userPreferences.budgetLevel || 'medium'}
      `;

      const result = await this.model.generateContent(`${prompt}\n${context}`);
      const itinerary = JSON.parse(result.response.text());

      // Cache result for future use
      await this.cacheResult('itinerary', {
        destinationId: destination.id,
        preferences: userPreferences,
        duration,
        itinerary,
        createdAt: new Date()
      });

      return itinerary;
    } catch (error) {
      console.error('Itinerary generation error:', error);
      return this.generateBasicItinerary(destination, duration);
    }
  }

  // Personalize content based on user behavior
  async personalizeContent(userId, content, context = 'general') {
    try {
      // Get user preferences from cache/DB
      const userProfile = await this.getUserProfile(userId);
      
      const prompt = this.prompts.personalize.replace('{prefs}', 
        JSON.stringify({
          interests: userProfile.interests || [],
          previousBookings: userProfile.bookingHistory?.slice(0, 3) || [],
          preferredBudget: userProfile.budgetRange || 'medium'
        })
      );

      const result = await this.model.generateContent(
        `${prompt}\nContent: ${content.substring(0, 500)}\nContext: ${context}`
      );

      return {
        personalizedContent: result.response.text(),
        confidence: 0.8,
        userId
      };
    } catch (error) {
      console.error('Personalization error:', error);
      return { personalizedContent: content, confidence: 0.1 };
    }
  }

  // Generate travel recommendations
  async getRecommendations(userId, location, preferences = {}) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const nearbyDestinations = await this.getNearbyDestinations(location);

      const prompt = `
        Recommend 3 rural destinations near ${location} for user with:
        Interests: ${preferences.interests?.join(',') || userProfile.interests?.join(',') || 'culture,nature'}
        Budget: ${preferences.budget || userProfile.budgetRange || '2000-5000'}
        
        Return JSON: {recommendations: [{id, reason, score}]}
        Max 150 words total.
      `;

      const result = await this.model.generateContent(
        `${prompt}\nDestinations: ${JSON.stringify(nearbyDestinations.slice(0, 10))}`
      );

      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Recommendation error:', error);
      return { recommendations: [] };
    }
  }

  // Helper methods
  async getUserProfile(userId) {
    try {
      const profile = await dbHelpers.getDoc(COLLECTIONS.USERS, userId);
      return profile || { interests: [], budgetRange: 'medium' };
    } catch (error) {
      return { interests: [], budgetRange: 'medium' };
    }
  }

  async getNearbyDestinations(location, radius = 100) {
    try {
      return await dbHelpers.getPaginated(COLLECTIONS.DESTINATIONS, {
        'location.state': location.state
      }, 20);
    } catch (error) {
      return [];
    }
  }

  basicFilter(criteria, destinations) {
    return destinations.filter(d => {
      const budgetMatch = !criteria.budget || d.price <= criteria.budget;
      const ratingMatch = !criteria.minRating || d.rating >= criteria.minRating;
      return budgetMatch && ratingMatch;
    });
  }

  generateBasicItinerary(destination, duration) {
    const activities = destination.activities || [];
    const days = [];
    
    for (let i = 0; i < duration; i++) {
      days.push({
        day: i + 1,
        activities: activities.slice(i * 2, (i + 1) * 2),
        description: `Day ${i + 1} in ${destination.name}`
      });
    }
    
    return { days, destination: destination.name };
  }

  async cacheResult(type, data) {
    try {
      const cacheKey = `${type}_${Date.now()}`;
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection('ai_cache').doc(cacheKey),
        data: { ...data, type, ttl: Date.now() + 86400000 } // 24h TTL
      }]);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }
}

module.exports = new AIFilterService();