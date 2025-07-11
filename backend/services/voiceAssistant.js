const speech = require('@google-cloud/speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbHelpers, COLLECTIONS } = require('../config/dbConfig');

class VoiceAssistant {
  constructor() {
    this.speechClient = new speech.SpeechClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Regional language support
    this.languageCodes = {
      'te': 'te-IN', // Telugu
      'hi': 'hi-IN', // Hindi
      'ta': 'ta-IN', // Tamil
      'kn': 'kn-IN', // Kannada
      'en': 'en-IN'  // English
    };

    // Optimized prompts for travel queries
    this.travelPrompts = {
      search: "User wants to find: {query}. Suggest 3 rural destinations in India. JSON format, max 100 words.",
      booking: "Help user book: {destination}. Provide booking steps. Max 80 words.",
      info: "Provide info about: {topic}. Rural tourism context. Max 60 words."
    };
  }

  // Convert speech to text with language detection
  async speechToText(audioBuffer, languageCode = 'en-IN') {
    try {
      const request = {
        audio: { content: audioBuffer.toString('base64') },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: this.languageCodes[languageCode] || 'en-IN',
          alternativeLanguageCodes: ['en-IN', 'hi-IN', 'te-IN'],
          enableAutomaticPunctuation: true,
          model: 'latest_short' // Optimized for short queries
        }
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives[0].transcript)
        .join('\n') || '';

      return {
        text: transcription,
        confidence: response.results?.[0]?.alternatives[0]?.confidence || 0,
        detectedLanguage: response.results?.[0]?.languageCode || languageCode
      };
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw new Error('Speech recognition failed');
    }
  }

  // Process travel query with AI
  async processQuery(text, language = 'en', userId = null) {
    try {
      const queryType = this.classifyQuery(text);
      const context = await this.getUserContext(userId);
      
      let prompt = this.travelPrompts[queryType] || this.travelPrompts.info;
      prompt = prompt.replace('{query}', text)
                   .replace('{destination}', text)
                   .replace('{topic}', text);

      const contextInfo = `
        User location: ${context.location || 'India'}
        Previous searches: ${context.recentSearches?.slice(0, 2).join(', ') || 'none'}
        Language: ${language}
      `;

      const result = await this.model.generateContent(
        `${prompt}\nContext: ${contextInfo}\nQuery: "${text}"`
      );

      const response = result.response.text();
      
      // Log query for learning
      await this.logQuery(userId, text, queryType, response, language);
      
      return {
        response,
        queryType,
        language,
        suggestions: await this.generateSuggestions(queryType, text)
      };
    } catch (error) {
      console.error('Query processing error:', error);
      return {
        response: "I'm sorry, I couldn't process your request. Please try again.",
        queryType: 'error',
        language
      };
    }
  }

  // Handle real-time voice conversation
  async handleVoiceQuery(audioBuffer, language = 'en', userId = null) {
    try {
      // Step 1: Convert speech to text
      const transcription = await this.speechToText(audioBuffer, language);
      
      if (transcription.confidence < 0.6) {
        return {
          success: false,
          message: "Could not understand clearly. Please speak again.",
          confidence: transcription.confidence
        };
      }

      // Step 2: Process the query
      const queryResult = await this.processQuery(
        transcription.text, 
        transcription.detectedLanguage, 
        userId
      );

      // Step 3: Return structured response
      return {
        success: true,
        transcription: transcription.text,
        response: queryResult.response,
        queryType: queryResult.queryType,
        language: transcription.detectedLanguage,
        suggestions: queryResult.suggestions,
        confidence: transcription.confidence
      };
    } catch (error) {
      console.error('Voice query error:', error);
      return {
        success: false,
        message: "Voice processing failed. Please try again.",
        error: error.message
      };
    }
  }

  // Classify query type for appropriate response
  classifyQuery(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('book') || lowerText.includes('reserve')) {
      return 'booking';
    }
    if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('show')) {
      return 'search';
    }
    if (lowerText.includes('price') || lowerText.includes('cost')) {
      return 'pricing';
    }
    if (lowerText.includes('cancel') || lowerText.includes('modify')) {
      return 'booking_management';
    }
    
    return 'info';
  }

  // Get user context for personalized responses
  async getUserContext(userId) {
    if (!userId) return {};
    
    try {
      const user = await dbHelpers.getDoc(COLLECTIONS.USERS, userId);
      const recentBookings = await dbHelpers.getPaginated(
        COLLECTIONS.BOOKINGS, 
        { userId }, 
        3
      );
      
      return {
        location: user?.location,
        preferences: user?.preferences,
        recentSearches: user?.recentSearches || [],
        recentBookings: recentBookings.map(b => b.destinationName)
      };
    } catch (error) {
      return {};
    }
  }

  // Generate follow-up suggestions
  async generateSuggestions(queryType, originalQuery) {
    const suggestions = {
      search: [
        "Show me more details",
        "What's the price?",
        "How do I book this?"
      ],
      booking: [
        "Check availability",
        "See cancellation policy",
        "Contact host"
      ],
      info: [
        "Find similar places",
        "Show on map",
        "Read reviews"
      ]
    };

    return suggestions[queryType] || suggestions.info;
  }

  // Log queries for analytics and improvement
  async logQuery(userId, query, type, response, language) {
    try {
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection('voice_queries').doc(),
        data: {
          userId,
          query,
          type,
          response: response.substring(0, 200), // Limit storage
          language,
          timestamp: new Date(),
          processed: true
        }
      }]);
    } catch (error) {
      console.error('Query logging error:', error);
    }
  }

  // Streaming speech recognition for real-time interaction
  createStreamingRecognition(languageCode = 'en-IN') {
    const request = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: this.languageCodes[languageCode] || 'en-IN',
        enableAutomaticPunctuation: true
      },
      interimResults: true
    };

    return this.speechClient.streamingRecognize(request);
  }
}

module.exports = new VoiceAssistant();