import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Download, Filter, RefreshCw, Zap, Shield, Users } from 'lucide-react';
import { recentTransactions, getTransactionsByTimeRange, getTotalEarningsByStakeholder } from '../data/realTimeTransactions';
import { blockchainService } from '../services/blockchainService';

const EnhancedMoneyFlowPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState(1); // hours
  const [transactions, setTransactions] = useState(recentTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [blockchainStats, setBlockchainStats] = useState(blockchainService.getBlockchainStats());

  useEffect(() => {
    updateTransactions();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateTransactions();
        setBlockchainStats(blockchainService.getBlockchainStats());
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const updateTransactions = () => {
    const filteredTransactions = getTransactionsByTimeRange(timeRange);
    setTransactions(filteredTransactions);
  };

  const getTotalAmount = () => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalStakeholders = () => {
    const uniqueStakeholders = new Set();
    transactions.forEach(tx => {
      tx.stakeholders.forEach(s => uniqueStakeholders.add(s.id));
    });
    return uniqueStakeholders.size;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors = {
      booking: 'bg-blue-100 text-blue-800',
      marketplace: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      activity: 'bg-purple-100 text-purple-800',
      transport: 'bg-yellow-100 text-yellow-800',
      bonus: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return '📱';
      case 'card': return '💳';
      case 'crypto': return '₿';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const generateDetailedReport = () => {
    const reportContent = `
VillageStay - Real-Time Money Flow Report
========================================

Time Range: Last ${timeRange} hour(s)
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
------------------
Total Transactions: ${transactions.length}
Total Amount: ₹${getTotalAmount().toLocaleString()}
Unique Stakeholders: ${getTotalStakeholders()}
Average Transaction: ₹${Math.round(getTotalAmount() / transactions.length).toLocaleString()}

BLOCKCHAIN STATISTICS
---------------------
Total Blocks: ${blockchainStats.totalBlocks}
Total Payments: ${blockchainStats.totalPayments}
Total Registrations: ${blockchainStats.totalRegistrations}
Chain Validity: ${blockchainStats.isValid ? 'Valid' : 'Invalid'}
Latest Block: ${blockchainStats.latestBlockHash}

TRANSACTION BREAKDOWN
--------------------
${transactions.map(tx => `
Transaction ID: ${tx.id}
Time: ${tx.timestamp.toLocaleString()}
Amount: ₹${tx.amount.toLocaleString()}
Source: ${tx.source}
Type: ${tx.type.toUpperCase()}
Payment Method: ${tx.paymentMethod.toUpperCase()}
Blockchain Hash: ${tx.blockchainTxHash}

Stakeholder Distribution:
${tx.stakeholders.map(s => `  • ${s.name} (${s.role}): ₹${s.amount} (${s.percentage}%) - ${s.village}`).join('\n')}
`).join('\n')}

STAKEHOLDER EARNINGS SUMMARY
---------------------------
${Array.from(new Set(transactions.flatMap(tx => tx.stakeholders.map(s => s.id)))).map(stakeholderId => {
  const stakeholder = transactions.flatMap(tx => tx.stakeholders).find(s => s.id === stakeholderId);
  const totalEarnings = getTotalEarningsByStakeholder(stakeholderId, timeRange);
  return `${stakeholder?.name}: ₹${totalEarnings.toLocaleString()} (${stakeholder?.village})`;
}).join('\n')}

TRANSPARENCY METRICS
-------------------
• All transactions recorded on blockchain
• Real-time stakeholder distribution
• Immutable payment records
• Automated smart contract execution
• Zero manipulation possible

COMMUNITY IMPACT
----------------
• Direct beneficiaries: ${getTotalStakeholders()} individuals/groups
• Communities supported: ${new Set(transactions.flatMap(tx => tx.stakeholders.map(s => s.village))).size}
• Average community retention: 93% of payment value
• Platform fee: 7% for technology and operations
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-time-money-flow-${timeRange}h-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Real-Time Money Flow Tracking</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Live blockchain-powered transaction monitoring with AI-driven stakeholder distribution
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={1}>Last 1 Hour</option>
                  <option value={6}>Last 6 Hours</option>
                  <option value={24}>Last 24 Hours</option>
                  <option value={168}>Last Week</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={updateTransactions}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={generateDetailedReport}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              ↑ Live tracking
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-600">₹{getTotalAmount().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last {timeRange} hour(s)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Stakeholders</p>
                <p className="text-2xl font-bold text-purple-600">{getTotalStakeholders()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Unique beneficiaries
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blockchain Blocks</p>
                <p className="text-2xl font-bold text-orange-600">{blockchainStats.totalBlocks}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              {blockchainStats.isValid ? '✓ Valid chain' : '✗ Invalid chain'}
            </div>
          </div>
        </div>

        {/* Real-time Transactions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Transaction Feed</h3>
            <p className="text-sm text-gray-600">Real-time blockchain-verified transactions</p>
          </div>

          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedTransaction === transaction.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                }`}
                onClick={() => setSelectedTransaction(
                  selectedTransaction === transaction.id ? null : transaction.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.source}</h4>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{transaction.timestamp.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{transaction.stakeholders.length} stakeholders</span>
                      <span>•</span>
                      <span className="font-mono text-xs">
                        {transaction.blockchainTxHash?.substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">₹{transaction.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {Math.round((Date.now() - transaction.timestamp.getTime()) / 60000)}m ago
                    </div>
                  </div>
                </div>

                {selectedTransaction === transaction.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Stakeholder Distribution</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {transaction.stakeholders.map((stakeholder, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{stakeholder.name}</p>
                            <p className="text-sm text-gray-600">{stakeholder.role}</p>
                            <p className="text-xs text-gray-500">{stakeholder.village}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">₹{stakeholder.amount}</p>
                            <p className="text-sm text-gray-500">{stakeholder.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h6 className="font-medium text-blue-900 mb-1">Blockchain Details</h6>
                      <p className="text-sm text-blue-800 font-mono">{transaction.blockchainTxHash}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Verified and immutable on VillageStay blockchain
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions in the selected time range</p>
              <button
                onClick={() => setTimeRange(24)}
                className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Try expanding to 24 hours
              </button>
            </div>
          )}
        </div>

        {/* Blockchain Status */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Blockchain-Powered Transparency</h2>
            <p className="text-purple-100 mb-6 max-w-3xl mx-auto">
              Every transaction is recorded on our secure blockchain, ensuring complete transparency and immutability of payment records.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{blockchainStats.totalPayments}</div>
                <div className="text-purple-200">Blockchain Payments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{blockchainStats.totalRegistrations}</div>
                <div className="text-purple-200">Host Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-purple-200">Transparency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">0</div>
                <div className="text-purple-200">Manipulation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMoneyFlowPage;