const axios = require('axios');
const { dbHelpers, COLLECTIONS } = require('../config/dbConfig');

class BecknService {
  constructor() {
    this.baseURL = process.env.BECKN_GATEWAY_URL || 'https://beckn-gateway.example.com';
    this.subscriberId = process.env.BECKN_SUBSCRIBER_ID;
    this.privateKey = process.env.BECKN_PRIVATE_KEY;
  }

  // Discovery API - Find rural destinations
  async search(searchParams) {
    try {
      const context = this.createContext('search');
      const message = {
        intent: {
          item: {
            descriptor: { name: searchParams.query },
            location: searchParams.location,
            time: searchParams.dateRange
          },
          category: { id: 'rural-tourism' },
          fulfillment: {
            type: 'homestay',
            start: { time: searchParams.checkIn },
            end: { time: searchParams.checkOut }
          }
        }
      };

      const response = await this.makeRequest('search', { context, message });
      return this.processSearchResults(response.data);
    } catch (error) {
      console.error('Beckn search error:', error);
      throw new Error('Search service unavailable');
    }
  }

  // Get quotes for selected destinations
  async getQuote(destinationId, guestCount, dates) {
    try {
      const context = this.createContext('select');
      const message = {
        order: {
          items: [{
            id: destinationId,
            quantity: { count: guestCount }
          }],
          fulfillment: {
            start: { time: dates.checkIn },
            end: { time: dates.checkOut }
          }
        }
      };

      const response = await this.makeRequest('select', { context, message });
      return this.processQuoteResponse(response.data);
    } catch (error) {
      console.error('Beckn quote error:', error);
      throw new Error('Quote service unavailable');
    }
  }

  // Initialize booking
  async initBooking(quoteId, userDetails) {
    try {
      const context = this.createContext('init');
      const message = {
        order: {
          id: quoteId,
          billing: userDetails.billing,
          fulfillment: {
            customer: {
              person: { name: userDetails.name },
              contact: { 
                phone: userDetails.phone,
                email: userDetails.email 
              }
            }
          }
        }
      };

      const response = await this.makeRequest('init', { context, message });
      return this.processInitResponse(response.data);
    } catch (error) {
      console.error('Beckn init error:', error);
      throw new Error('Booking initialization failed');
    }
  }

  // Confirm booking
  async confirmBooking(orderId, paymentDetails) {
    try {
      const context = this.createContext('confirm');
      const message = {
        order: {
          id: orderId,
          payment: {
            type: paymentDetails.method,
            status: 'PAID',
            params: {
              transaction_id: paymentDetails.transactionId,
              amount: paymentDetails.amount
            }
          }
        }
      };

      const response = await this.makeRequest('confirm', { context, message });
      const booking = this.processConfirmResponse(response.data);
      
      // Store in Firestore
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection(COLLECTIONS.BOOKINGS).doc(booking.id),
        data: { ...booking, createdAt: new Date() }
      }]);

      return booking;
    } catch (error) {
      console.error('Beckn confirm error:', error);
      throw new Error('Booking confirmation failed');
    }
  }

  // Helper methods
  createContext(action) {
    return {
      domain: 'rural-tourism',
      country: 'IND',
      city: 'std:080',
      action,
      core_version: '1.0.0',
      bap_id: this.subscriberId,
      bap_uri: process.env.BAP_URI,
      transaction_id: this.generateTransactionId(),
      message_id: this.generateMessageId(),
      timestamp: new Date().toISOString()
    };
  }

  async makeRequest(endpoint, payload) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await this.generateAuthToken()}`
    };

    return axios.post(`${this.baseURL}/${endpoint}`, payload, { headers });
  }

  processSearchResults(data) {
    return data.message?.catalog?.bpp_providers?.map(provider => ({
      id: provider.id,
      name: provider.descriptor.name,
      location: provider.locations[0],
      items: provider.items.map(item => ({
        id: item.id,
        name: item.descriptor.name,
        price: item.price.value,
        category: item.category_id
      }))
    })) || [];
  }

  processQuoteResponse(data) {
    const order = data.message?.order;
    return {
      id: order.id,
      items: order.items,
      quote: order.quote,
      breakup: order.quote.breakup,
      total: order.quote.price.value
    };
  }

  processInitResponse(data) {
    return {
      orderId: data.message?.order?.id,
      status: data.message?.order?.status,
      payment: data.message?.order?.payment
    };
  }

  processConfirmResponse(data) {
    const order = data.message?.order;
    return {
      id: order.id,
      status: order.status,
      items: order.items,
      fulfillment: order.fulfillment,
      payment: order.payment,
      created_at: order.created_at
    };
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateAuthToken() {
    // Implement JWT signing with private key
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { subscriber_id: this.subscriberId },
      this.privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );
  }
}

module.exports = new BecknService();