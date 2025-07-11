export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  source: string;
  type: 'booking' | 'marketplace' | 'food' | 'activity' | 'transport' | 'bonus';
  stakeholders: {
    id: string;
    name: string;
    role: string;
    percentage: number;
    amount: number;
    village: string;
  }[];
  communityId: string;
  bookingId?: string;
  description: string;
  paymentMethod: 'upi' | 'card' | 'crypto' | 'bank_transfer';
  blockchainTxHash?: string;
}

// Generate realistic transactions for the past hour
const generateRecentTransactions = (): Transaction[] => {
  const now = new Date();
  const transactions: Transaction[] = [];
  
  // Transaction 1: Araku Valley Booking (15 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_1',
    timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    amount: 5250,
    source: 'Family Homestay Booking - Araku Valley',
    type: 'booking',
    stakeholders: [
      { id: 'host_1', name: 'Ravi Kumar', role: 'Village Guide', percentage: 25, amount: 1312, village: 'Araku Valley' },
      { id: 'host_2', name: 'Lakshmi Family', role: 'Homestay Host', percentage: 30, amount: 1575, village: 'Araku Valley' },
      { id: 'artisan_1', name: 'Tribal Craft Group', role: 'Cultural Activities', percentage: 15, amount: 787, village: 'Araku Valley' },
      { id: 'transport_1', name: 'Local Transport Co-op', role: 'Transportation', percentage: 10, amount: 525, village: 'Araku Valley' },
      { id: 'food_1', name: 'Village Kitchen', role: 'Food Provider', percentage: 12, amount: 630, village: 'Araku Valley' },
      { id: 'community_1', name: 'Community Development Fund', role: 'Development', percentage: 8, amount: 420, village: 'Araku Valley' }
    ],
    communityId: '1',
    bookingId: 'booking_araku_001',
    description: 'Family of 4 booked 3-day cultural immersion experience',
    paymentMethod: 'upi',
    blockchainTxHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12'
  });

  // Transaction 2: Hampi Marketplace Purchase (32 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_2',
    timestamp: new Date(now.getTime() - 32 * 60 * 1000),
    amount: 2800,
    source: 'Stone Carving Workshop & Artifacts',
    type: 'marketplace',
    stakeholders: [
      { id: 'artisan_2', name: 'Venkata Stone Carver', role: 'Master Artisan', percentage: 70, amount: 1960, village: 'Hampi' },
      { id: 'guide_2', name: 'Heritage Guide Collective', role: 'Workshop Guide', percentage: 15, amount: 420, village: 'Hampi' },
      { id: 'material_1', name: 'Local Stone Suppliers', role: 'Material Provider', percentage: 10, amount: 280, village: 'Hampi' },
      { id: 'community_2', name: 'Heritage Preservation Fund', role: 'Conservation', percentage: 5, amount: 140, village: 'Hampi' }
    ],
    communityId: '4',
    description: 'Tourist purchased handcrafted stone sculptures and attended workshop',
    paymentMethod: 'card',
    blockchainTxHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234'
  });

  // Transaction 3: Spiti Valley Adventure Booking (45 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_3',
    timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    amount: 7200,
    source: 'High Altitude Trekking & Monastery Stay',
    type: 'booking',
    stakeholders: [
      { id: 'guide_3', name: 'Tenzin Mountain Guide', role: 'Trekking Guide', percentage: 35, amount: 2520, village: 'Kaza' },
      { id: 'monastery_1', name: 'Key Monastery', role: 'Accommodation', percentage: 25, amount: 1800, village: 'Kaza' },
      { id: 'porter_1', name: 'Local Porter Group', role: 'Support Staff', percentage: 15, amount: 1080, village: 'Kaza' },
      { id: 'food_2', name: 'High Altitude Kitchen', role: 'Meals', percentage: 10, amount: 720, village: 'Kaza' },
      { id: 'equipment_1', name: 'Gear Rental Co-op', role: 'Equipment', percentage: 8, amount: 576, village: 'Kaza' },
      { id: 'community_3', name: 'Buddhist Community Fund', role: 'Monastery Maintenance', percentage: 7, amount: 504, village: 'Kaza' }
    ],
    communityId: '5',
    bookingId: 'booking_spiti_002',
    description: 'Solo traveler booked 5-day high altitude trekking with monastery experience',
    paymentMethod: 'crypto',
    blockchainTxHash: '0x3c4d5e6f7890abcdef1234567890abcdef123456'
  });

  // Transaction 4: Majuli Cultural Workshop (8 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_4',
    timestamp: new Date(now.getTime() - 8 * 60 * 1000),
    amount: 1500,
    source: 'Traditional Mask Making Workshop',
    type: 'activity',
    stakeholders: [
      { id: 'artisan_3', name: 'Hemanga Mask Artist', role: 'Workshop Master', percentage: 60, amount: 900, village: 'Garamur' },
      { id: 'satra_1', name: 'Auniati Satra', role: 'Venue Provider', percentage: 20, amount: 300, village: 'Garamur' },
      { id: 'material_2', name: 'Bamboo & Clay Suppliers', role: 'Materials', percentage: 15, amount: 225, village: 'Garamur' },
      { id: 'community_4', name: 'Cultural Preservation Fund', role: 'Heritage Support', percentage: 5, amount: 75, village: 'Garamur' }
    ],
    communityId: '6',
    description: 'Group workshop on traditional Assamese mask making techniques',
    paymentMethod: 'upi',
    blockchainTxHash: '0x4d5e6f7890abcdef1234567890abcdef12345678'
  });

  // Transaction 5: Lambasingi Food Order (22 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_5',
    timestamp: new Date(now.getTime() - 22 * 60 * 1000),
    amount: 850,
    source: 'Organic Apple Products & Hill Station Breakfast',
    type: 'food',
    stakeholders: [
      { id: 'farmer_1', name: 'Apple Farmers Collective', role: 'Organic Producers', percentage: 50, amount: 425, village: 'Lambasingi' },
      { id: 'kitchen_1', name: 'Hill Station Kitchen', role: 'Food Preparation', percentage: 30, amount: 255, village: 'Lambasingi' },
      { id: 'delivery_1', name: 'Local Delivery Service', role: 'Transportation', percentage: 15, amount: 127, village: 'Lambasingi' },
      { id: 'community_5', name: 'Farmers Welfare Fund', role: 'Support', percentage: 5, amount: 43, village: 'Lambasingi' }
    ],
    communityId: '2',
    description: 'Tourist ordered organic apple products and traditional hill breakfast',
    paymentMethod: 'upi',
    blockchainTxHash: '0x5e6f7890abcdef1234567890abcdef1234567890'
  });

  // Transaction 6: Maredumilli Eco-Tour (55 minutes ago)
  transactions.push({
    id: 'tx_' + Date.now() + '_6',
    timestamp: new Date(now.getTime() - 55 * 60 * 1000),
    amount: 3600,
    source: 'Forest Conservation & Wildlife Photography Tour',
    type: 'activity',
    stakeholders: [
      { id: 'guide_4', name: 'Forest Guide Venu', role: 'Wildlife Expert', percentage: 40, amount: 1440, village: 'Maredumilli' },
      { id: 'forest_1', name: 'Forest Department Co-op', role: 'Conservation Partner', percentage: 25, amount: 900, village: 'Maredumilli' },
      { id: 'tribal_1', name: 'Tribal Knowledge Keepers', role: 'Cultural Guides', percentage: 20, amount: 720, village: 'Maredumilli' },
      { id: 'equipment_2', name: 'Photography Equipment Rental', role: 'Gear Provider', percentage: 10, amount: 360, village: 'Maredumilli' },
      { id: 'conservation_1', name: 'Wildlife Conservation Fund', role: 'Protection', percentage: 5, amount: 180, village: 'Maredumilli' }
    ],
    communityId: '3',
    description: 'Photography enthusiast booked guided forest tour with wildlife spotting',
    paymentMethod: 'card',
    blockchainTxHash: '0x6f7890abcdef1234567890abcdef123456789012'
  });

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const recentTransactions = generateRecentTransactions();

export const getTransactionsByTimeRange = (hours: number = 1): Transaction[] => {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return recentTransactions.filter(tx => tx.timestamp >= cutoffTime);
};

export const getTotalEarningsByStakeholder = (stakeholderId: string, hours: number = 1): number => {
  const transactions = getTransactionsByTimeRange(hours);
  return transactions.reduce((total, tx) => {
    const stakeholder = tx.stakeholders.find(s => s.id === stakeholderId);
    return total + (stakeholder?.amount || 0);
  }, 0);
};

export const getTransactionsByCommunity = (communityId: string, hours: number = 1): Transaction[] => {
  const transactions = getTransactionsByTimeRange(hours);
  return transactions.filter(tx => tx.communityId === communityId);
};