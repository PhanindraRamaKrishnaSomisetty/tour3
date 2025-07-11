const { create } = require('ipfs-http-client');
const { dbHelpers, COLLECTIONS } = require('../config/dbConfig');

class IPFSStorage {
  constructor() {
    // Use Infura IPFS or local node
    this.ipfs = create({
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'https',
      headers: {
        authorization: process.env.IPFS_AUTH || ''
      }
    });
  }

  // Store booking data immutably
  async storeBookingData(bookingData) {
    try {
      // Create immutable booking record
      const bookingRecord = {
        id: bookingData.id,
        userId: bookingData.userId,
        destinationId: bookingData.destinationId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalAmount: bookingData.totalAmount,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        hash: this.generateBookingHash(bookingData)
      };

      // Store in IPFS
      const result = await this.ipfs.add(JSON.stringify(bookingRecord));
      const ipfsHash = result.cid.toString();

      // Store hash reference in Firestore
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection('ipfs_records').doc(bookingData.id),
        data: {
          bookingId: bookingData.id,
          ipfsHash,
          dataType: 'booking',
          createdAt: new Date(),
          size: result.size
        }
      }]);

      return {
        success: true,
        ipfsHash,
        size: result.size,
        bookingHash: bookingRecord.hash
      };
    } catch (error) {
      console.error('IPFS storage error:', error);
      throw new Error('Failed to store booking data');
    }
  }

  // Store review/rating data
  async storeReviewData(reviewData) {
    try {
      const reviewRecord = {
        id: reviewData.id,
        bookingId: reviewData.bookingId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        timestamp: new Date().toISOString(),
        verified: true,
        hash: this.generateReviewHash(reviewData)
      };

      const result = await this.ipfs.add(JSON.stringify(reviewRecord));
      const ipfsHash = result.cid.toString();

      // Store reference
      await dbHelpers.batchWrite([{
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection('ipfs_records').doc(reviewData.id),
        data: {
          reviewId: reviewData.id,
          bookingId: reviewData.bookingId,
          ipfsHash,
          dataType: 'review',
          createdAt: new Date()
        }
      }]);

      return {
        success: true,
        ipfsHash,
        reviewHash: reviewRecord.hash
      };
    } catch (error) {
      console.error('Review storage error:', error);
      throw new Error('Failed to store review data');
    }
  }

  // Retrieve data from IPFS
  async retrieveData(ipfsHash) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error('Failed to retrieve data from IPFS');
    }
  }

  // Verify data integrity
  async verifyDataIntegrity(bookingId) {
    try {
      // Get IPFS hash from Firestore
      const record = await dbHelpers.getDoc('ipfs_records', bookingId);
      if (!record) {
        return { verified: false, error: 'No IPFS record found' };
      }

      // Retrieve data from IPFS
      const ipfsData = await this.retrieveData(record.ipfsHash);
      
      // Verify hash
      const computedHash = this.generateBookingHash(ipfsData);
      const isValid = computedHash === ipfsData.hash;

      return {
        verified: isValid,
        ipfsHash: record.ipfsHash,
        data: ipfsData,
        computedHash,
        storedHash: ipfsData.hash
      };
    } catch (error) {
      console.error('Verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  // Pin important data to prevent garbage collection
  async pinData(ipfsHash) {
    try {
      await this.ipfs.pin.add(ipfsHash);
      return { success: true, pinned: true };
    } catch (error) {
      console.error('Pin error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate booking hash for integrity verification
  generateBookingHash(bookingData) {
    const crypto = require('crypto');
    const hashData = `${bookingData.id}${bookingData.userId}${bookingData.destinationId}${bookingData.totalAmount}${bookingData.timestamp}`;
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  // Generate review hash
  generateReviewHash(reviewData) {
    const crypto = require('crypto');
    const hashData = `${reviewData.bookingId}${reviewData.userId}${reviewData.rating}${reviewData.timestamp}`;
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  // Batch store multiple items efficiently
  async batchStore(items) {
    try {
      const results = [];
      
      for (const item of items) {
        const result = await this.ipfs.add(JSON.stringify(item.data));
        results.push({
          id: item.id,
          ipfsHash: result.cid.toString(),
          size: result.size
        });
      }

      // Store all references in batch
      const batchOps = results.map(result => ({
        type: 'set',
        ref: require('../config/dbConfig').initializeFirebase()
          .collection('ipfs_records').doc(result.id),
        data: {
          ipfsHash: result.ipfsHash,
          dataType: 'batch',
          createdAt: new Date(),
          size: result.size
        }
      }));

      await dbHelpers.batchWrite(batchOps);
      return { success: true, results };
    } catch (error) {
      console.error('Batch storage error:', error);
      throw new Error('Batch storage failed');
    }
  }
}

module.exports = new IPFSStorage();