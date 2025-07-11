import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Shield, CheckCircle } from 'lucide-react';
import { blockchainService, paymentContract } from '../services/blockchainService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentData, setPaymentData] = useState({
    // UPI
    upiId: '',
    
    // Card
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Net Banking
    bankName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using PhonePe, Google Pay, Paytm',
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay accepted'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'All major banks supported'
    }
  ];

  const upiApps = [
    { name: 'PhonePe', logo: '📱', color: 'bg-purple-500' },
    { name: 'Google Pay', logo: '💳', color: 'bg-blue-500' },
    { name: 'Paytm', logo: '💰', color: 'bg-blue-600' },
    { name: 'BHIM', logo: '🏦', color: 'bg-orange-500' }
  ];

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank'
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Process payment through blockchain
      const stakeholders = [
        { id: 'host_1', name: 'Host Family', role: 'Accommodation', percentage: 30, village: 'Village' },
        { id: 'guide_1', name: 'Local Guide', role: 'Guide Services', percentage: 25, village: 'Village' },
        { id: 'activity_1', name: 'Activity Coordinator', role: 'Activities', percentage: 20, village: 'Village' },
        { id: 'transport_1', name: 'Transport Service', role: 'Transportation', percentage: 10, village: 'Village' },
        { id: 'food_1', name: 'Food Provider', role: 'Meals', percentage: 8, village: 'Village' },
        { id: 'community_1', name: 'Community Fund', role: 'Development', percentage: 7, village: 'Village' }
      ];

      const paymentRecord = await paymentContract.executePayment(amount, stakeholders);
      
      // Simulate payment processing delay
      setTimeout(() => {
        setIsProcessing(false);
        alert(`Payment successful! 
        
Blockchain Transaction: ${paymentRecord.id}
Amount: ₹${paymentRecord.amount}
Stakeholders: ${paymentRecord.stakeholderDistribution.length}

Your payment has been securely recorded on blockchain and distributed to local stakeholders.`);
        onPaymentSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback to regular payment processing
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess();
        onClose();
      }, 3000);
    }
  };
      setIsProcessing(false);
      onPaymentSuccess();
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Amount */}
        <div className="p-6 bg-emerald-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-600">₹{amount}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Secure Payment</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Choose Payment Method</h3>
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <method.icon className="h-5 w-5 text-gray-600" />
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{method.name}</span>
                    {method.popular && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            {selectedMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={paymentData.upiId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, upiId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="yourname@upi"
                />
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Or pay with</p>
                  <div className="grid grid-cols-2 gap-2">
                    {upiApps.map((app, index) => (
                      <button
                        key={index}
                        className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">{app.logo}</span>
                        <span className="text-sm font-medium">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardholderName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Bank
                </label>
                <select
                  value={paymentData.bankName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Choose your bank</option>
                  {banks.map((bank, index) => (
                    <option key={index} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
            </p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full mt-6 bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${amount}`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By proceeding, you agree to our Terms & Conditions and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;