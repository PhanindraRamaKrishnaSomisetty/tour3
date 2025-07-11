import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import VoiceAssistant from './components/VoiceAssistant';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import MarketplacePage from './pages/MarketplacePage';
import MoneyFlowPage from './pages/MoneyFlowPage';
import DetailedMoneyFlowPage from './pages/DetailedMoneyFlowPage';
import EnhancedMoneyFlowPage from './pages/EnhancedMoneyFlowPage';
import WeatherForecastPage from './pages/WeatherForecastPage';
import BecomeHostPage from './pages/BecomeHostPage';
import FoodOrderPage from './pages/FoodOrderPage';
import StayInfoPage from './pages/StayInfoPage';
import DonationsPage from './pages/DonationsPage';
import IndiaMap from './components/IndiaMap';
import HelpCenter from './components/HelpCenter';
import ChatBot from './components/ChatBot';
import { User, Destination } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [filters, setFilters] = useState({});

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentPage('destination-detail');
  };

  const handleBooking = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentPage('booking');
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      if (page === 'destination-detail' || page === 'booking') {
        setSelectedDestination(data);
      }
    }
  };

  const handleFilterUpdate = (newFilters: any) => {
    setFilters(newFilters);
    if (currentPage !== 'destinations') {
      setCurrentPage('destinations');
    }
  };
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onDestinationSelect={handleDestinationSelect}
            onBooking={handleBooking}
          />
        );
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'destinations':
        return (
          <DestinationsPage
            onDestinationSelect={handleDestinationSelect}
            onBooking={handleBooking}
            filters={filters}
          />
        );
      case 'marketplace':
        return <MarketplacePage />;
      case 'money-flow':
        return <EnhancedMoneyFlowPage />;
      case 'detailed-money-flow':
        return <DetailedMoneyFlowPage />;
      case 'weather':
        return <WeatherForecastPage />;
      case 'become-host':
        return <BecomeHostPage />;
      case 'food-order':
        return <FoodOrderPage />;
      case 'stay-info':
        return <StayInfoPage />;
      case 'donations':
        return <DonationsPage />;
      case 'india-map':
        return (
          <IndiaMap
            onDestinationSelect={handleDestinationSelect}
            onBooking={handleBooking}
          />
        );
      case 'help':
        return <HelpCenter />;
      case 'destination-detail':
        return selectedDestination ? (
          <DestinationDetailPage
            destination={selectedDestination}
            onBooking={handleBooking}
          />
        ) : (
          <HomePage onDestinationSelect={handleDestinationSelect} onBooking={handleBooking} />
        );
      case 'booking':
        return selectedDestination ? (
          <BookingPage
            destination={selectedDestination}
            user={user}
            onBookingComplete={() => setCurrentPage('dashboard')}
          />
        ) : (
          <HomePage onDestinationSelect={handleDestinationSelect} onBooking={handleBooking} />
        );
      case 'dashboard':
        return user ? (
          <UserDashboard user={user} />
        ) : (
          <HomePage onDestinationSelect={handleDestinationSelect} onBooking={handleBooking} />
        );
      default:
        return (
          <HomePage
            onDestinationSelect={handleDestinationSelect}
            onBooking={handleBooking}
          />
        );
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
        {renderCurrentPage()}
        <ChatBot />
        <VoiceAssistant
          onNavigate={handleNavigate}
          onFilterUpdate={handleFilterUpdate}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;