import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Eye, Calendar, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { communities } from '../data/communities';

interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
    current: number;
  };
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  precipitation: number;
  uvIndex: number;
  airQuality: number;
}

interface WeatherForecast {
  location: string;
  communityId: string;
  coordinates: [number, number];
  pastWeek: WeatherData[];
  nextThreeDays: WeatherData[];
  travelRecommendation: {
    score: number; // 0-100
    recommendation: 'excellent' | 'good' | 'fair' | 'poor';
    reasons: string[];
    bestActivities: string[];
    packingTips: string[];
  };
  seasonalInfo: {
    currentSeason: string;
    peakSeason: string;
    offSeason: string;
    monsoonPeriod: string;
  };
}

const WeatherForecastPage: React.FC = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(communities[0].id);
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateWeatherData();
  }, []);

  const generateWeatherData = () => {
    setLoading(true);
    
    const forecasts: WeatherForecast[] = communities.map(community => {
      const pastWeek = generatePastWeekData(community);
      const nextThreeDays = generateForecastData(community, pastWeek);
      const travelRecommendation = generateTravelRecommendation(nextThreeDays, community);
      
      return {
        location: `${community.village}, ${community.state}`,
        communityId: community.id,
        coordinates: community.coordinates,
        pastWeek,
        nextThreeDays,
        travelRecommendation,
        seasonalInfo: getSeasonalInfo(community)
      };
    });
    
    setWeatherData(forecasts);
    setLoading(false);
  };

  const generatePastWeekData = (community: any): WeatherData[] => {
    const data: WeatherData[] = [];
    const baseTemp = getBaseTemperature(community);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const tempVariation = (Math.random() - 0.5) * 8;
      const seasonalFactor = getSeasonalFactor(date.getMonth(), community);
      
      data.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round(baseTemp.min + tempVariation + seasonalFactor - 3),
          max: Math.round(baseTemp.max + tempVariation + seasonalFactor + 3),
          current: Math.round(baseTemp.avg + tempVariation + seasonalFactor)
        },
        humidity: Math.round(50 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        visibility: Math.round(8 + Math.random() * 7),
        condition: getRandomCondition(community, date.getMonth()),
        precipitation: Math.random() * 10,
        uvIndex: Math.round(3 + Math.random() * 8),
        airQuality: Math.round(50 + Math.random() * 40)
      });
    }
    
    return data;
  };

  const generateForecastData = (community: any, pastWeek: WeatherData[]): WeatherData[] => {
    const data: WeatherData[] = [];
    const lastDay = pastWeek[pastWeek.length - 1];
    const baseTemp = getBaseTemperature(community);
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Use AI-like prediction based on past trends
      const trend = calculateTrend(pastWeek);
      const seasonalFactor = getSeasonalFactor(date.getMonth(), community);
      
      data.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round(lastDay.temperature.min + trend.temp + seasonalFactor - 2),
          max: Math.round(lastDay.temperature.max + trend.temp + seasonalFactor + 2),
          current: Math.round(lastDay.temperature.current + trend.temp + seasonalFactor)
        },
        humidity: Math.round(Math.max(30, Math.min(90, lastDay.humidity + trend.humidity))),
        windSpeed: Math.round(Math.max(2, Math.min(25, lastDay.windSpeed + trend.wind))),
        visibility: Math.round(Math.max(5, Math.min(15, lastDay.visibility + trend.visibility))),
        condition: predictCondition(pastWeek, community, date.getMonth()),
        precipitation: Math.max(0, lastDay.precipitation + trend.precipitation),
        uvIndex: Math.round(Math.max(1, Math.min(11, lastDay.uvIndex + trend.uv))),
        airQuality: Math.round(Math.max(20, Math.min(100, lastDay.airQuality + trend.airQuality)))
      });
    }
    
    return data;
  };

  const getBaseTemperature = (community: any) => {
    const tempMap: { [key: string]: { min: number; max: number; avg: number } } = {
      'Araku Valley': { min: 15, max: 28, avg: 22 },
      'Lambasingi': { min: 8, max: 22, avg: 15 },
      'Maredumilli': { min: 18, max: 32, avg: 25 },
      'Hampi': { min: 20, max: 35, avg: 28 },
      'Kaza': { min: -5, max: 15, avg: 5 },
      'Garamur': { min: 12, max: 30, avg: 21 }
    };
    
    return tempMap[community.village] || { min: 15, max: 30, avg: 22 };
  };

  const getSeasonalFactor = (month: number, community: any): number => {
    // Adjust temperature based on season and location
    if (community.village === 'Kaza') {
      return month >= 5 && month <= 8 ? 10 : -5; // Summer vs Winter in high altitude
    }
    if (community.village === 'Lambasingi') {
      return month >= 11 || month <= 2 ? -5 : 3; // Cooler in winter months
    }
    return month >= 3 && month <= 5 ? 5 : month >= 6 && month <= 9 ? -2 : 0;
  };

  const getRandomCondition = (community: any, month: number): WeatherData['condition'] => {
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    
    if (community.village === 'Kaza' && (month <= 3 || month >= 11)) {
      conditions.push('snowy');
    }
    
    if (month >= 6 && month <= 9) { // Monsoon
      return Math.random() > 0.3 ? 'rainy' : 'cloudy';
    }
    
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  const calculateTrend = (pastWeek: WeatherData[]) => {
    const recent = pastWeek.slice(-3);
    const earlier = pastWeek.slice(0, 3);
    
    return {
      temp: (recent.reduce((sum, d) => sum + d.temperature.current, 0) / 3) - 
            (earlier.reduce((sum, d) => sum + d.temperature.current, 0) / 3),
      humidity: (recent.reduce((sum, d) => sum + d.humidity, 0) / 3) - 
               (earlier.reduce((sum, d) => sum + d.humidity, 0) / 3),
      wind: (recent.reduce((sum, d) => sum + d.windSpeed, 0) / 3) - 
            (earlier.reduce((sum, d) => sum + d.windSpeed, 0) / 3),
      visibility: (recent.reduce((sum, d) => sum + d.visibility, 0) / 3) - 
                 (earlier.reduce((sum, d) => sum + d.visibility, 0) / 3),
      precipitation: (recent.reduce((sum, d) => sum + d.precipitation, 0) / 3) - 
                    (earlier.reduce((sum, d) => sum + d.precipitation, 0) / 3),
      uv: (recent.reduce((sum, d) => sum + d.uvIndex, 0) / 3) - 
          (earlier.reduce((sum, d) => sum + d.uvIndex, 0) / 3),
      airQuality: (recent.reduce((sum, d) => sum + d.airQuality, 0) / 3) - 
                 (earlier.reduce((sum, d) => sum + d.airQuality, 0) / 3)
    };
  };

  const predictCondition = (pastWeek: WeatherData[], community: any, month: number): WeatherData['condition'] => {
    const recentConditions = pastWeek.slice(-3).map(d => d.condition);
    const rainyDays = recentConditions.filter(c => c === 'rainy').length;
    
    if (rainyDays >= 2) return 'rainy';
    if (month >= 6 && month <= 9) return Math.random() > 0.4 ? 'rainy' : 'cloudy';
    
    return getRandomCondition(community, month);
  };

  const generateTravelRecommendation = (forecast: WeatherData[], community: any) => {
    let score = 100;
    const reasons: string[] = [];
    const bestActivities: string[] = [];
    const packingTips: string[] = [];
    
    const avgTemp = forecast.reduce((sum, d) => sum + d.temperature.current, 0) / 3;
    const rainyDays = forecast.filter(d => d.condition === 'rainy').length;
    const avgVisibility = forecast.reduce((sum, d) => sum + d.visibility, 0) / 3;
    
    // Temperature assessment
    if (avgTemp < 5) {
      score -= 20;
      reasons.push('Very cold temperatures');
      packingTips.push('Heavy winter clothing', 'Thermal wear', 'Waterproof boots');
    } else if (avgTemp > 35) {
      score -= 15;
      reasons.push('Very hot temperatures');
      packingTips.push('Light cotton clothes', 'Sun hat', 'Sunscreen');
    } else if (avgTemp >= 15 && avgTemp <= 25) {
      reasons.push('Pleasant temperatures');
      packingTips.push('Light layers', 'Comfortable walking shoes');
    }
    
    // Rain assessment
    if (rainyDays >= 2) {
      score -= 25;
      reasons.push('Frequent rainfall expected');
      packingTips.push('Raincoat', 'Waterproof bag', 'Quick-dry clothes');
    } else if (rainyDays === 1) {
      score -= 10;
      reasons.push('Some rain expected');
      packingTips.push('Light raincoat', 'Umbrella');
    }
    
    // Visibility assessment
    if (avgVisibility < 8) {
      score -= 15;
      reasons.push('Reduced visibility due to weather');
    }
    
    // Activity recommendations based on weather and community
    if (score >= 80) {
      bestActivities.push('Outdoor trekking', 'Photography tours', 'Cultural walks');
    } else if (score >= 60) {
      bestActivities.push('Indoor cultural activities', 'Craft workshops', 'Local cuisine tours');
    } else {
      bestActivities.push('Museum visits', 'Indoor workshops', 'Covered market tours');
    }
    
    // Community-specific activities
    if (community.village === 'Araku Valley') {
      bestActivities.push('Coffee plantation tours', 'Tribal village visits');
    } else if (community.village === 'Hampi') {
      bestActivities.push('Heritage site exploration', 'Stone carving workshops');
    }
    
    let recommendation: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) recommendation = 'excellent';
    else if (score >= 70) recommendation = 'good';
    else if (score >= 50) recommendation = 'fair';
    else recommendation = 'poor';
    
    return {
      score,
      recommendation,
      reasons,
      bestActivities,
      packingTips
    };
  };

  const getSeasonalInfo = (community: any) => {
    const seasonalMap: { [key: string]: any } = {
      'Araku Valley': {
        currentSeason: 'Winter',
        peakSeason: 'October to March',
        offSeason: 'June to September',
        monsoonPeriod: 'June to September'
      },
      'Lambasingi': {
        currentSeason: 'Winter',
        peakSeason: 'November to February',
        offSeason: 'April to September',
        monsoonPeriod: 'June to September'
      },
      'Kaza': {
        currentSeason: 'Winter',
        peakSeason: 'June to September',
        offSeason: 'October to May',
        monsoonPeriod: 'July to August'
      }
    };
    
    return seasonalMap[community.village] || {
      currentSeason: 'Winter',
      peakSeason: 'October to March',
      offSeason: 'June to September',
      monsoonPeriod: 'June to September'
    };
  };

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'snowy': return <CloudSnow className="h-6 w-6 text-blue-300" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const selectedForecast = weatherData.find(w => w.communityId === selectedCommunity);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Weather Forecast & Travel Planning</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered weather predictions to help you plan the perfect rural getaway
          </p>
        </div>

        {/* Community Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Destination</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {communities.map((community) => (
              <button
                key={community.id}
                onClick={() => setSelectedCommunity(community.id)}
                className={`p-4 rounded-lg border-2 text-center transition-colors ${
                  selectedCommunity === community.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-900 text-sm">{community.village}</h4>
                <p className="text-xs text-gray-600">{community.state}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedForecast && (
          <>
            {/* Current Weather & Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedForecast.nextThreeDays.map((day, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {day.temperature.max}°/{day.temperature.min}°C
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{day.condition}</div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <Wind className="h-3 w-3 text-gray-500" />
                          <span>{day.windSpeed}km/h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Travel Recommendation</h3>
                <div className={`p-4 rounded-lg mb-4 ${getRecommendationColor(selectedForecast.travelRecommendation.recommendation)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize">{selectedForecast.travelRecommendation.recommendation}</span>
                    <span className="text-2xl font-bold">{selectedForecast.travelRecommendation.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-current h-2 rounded-full" 
                      style={{ width: `${selectedForecast.travelRecommendation.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Factors</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedForecast.travelRecommendation.reasons.map((reason, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Activities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedForecast.travelRecommendation.bestActivities.map((activity, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Packing Tips</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedForecast.travelRecommendation.packingTips.map((tip, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Week Data */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Past Week Weather Trends</h3>
              <div className="grid grid-cols-7 gap-2">
                {selectedForecast.pastWeek.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="flex justify-center mb-1">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {day.temperature.max}°/{day.temperature.min}°
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {day.precipitation > 0 && `${day.precipitation.toFixed(1)}mm`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Weather Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Thermometer className="h-6 w-6 text-red-500" />
                  <h4 className="font-medium text-gray-900">Temperature</h4>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedForecast.nextThreeDays[0].temperature.current}°C
                </div>
                <div className="text-sm text-gray-600">
                  Feels like {selectedForecast.nextThreeDays[0].temperature.current + 2}°C
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Droplets className="h-6 w-6 text-blue-500" />
                  <h4 className="font-medium text-gray-900">Humidity</h4>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedForecast.nextThreeDays[0].humidity}%
                </div>
                <div className="text-sm text-gray-600">
                  {selectedForecast.nextThreeDays[0].humidity > 70 ? 'High' : 'Comfortable'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Wind className="h-6 w-6 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Wind Speed</h4>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedForecast.nextThreeDays[0].windSpeed} km/h
                </div>
                <div className="text-sm text-gray-600">
                  {selectedForecast.nextThreeDays[0].windSpeed > 15 ? 'Windy' : 'Calm'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Eye className="h-6 w-6 text-purple-500" />
                  <h4 className="font-medium text-gray-900">Visibility</h4>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedForecast.nextThreeDays[0].visibility} km
                </div>
                <div className="text-sm text-gray-600">
                  {selectedForecast.nextThreeDays[0].visibility > 10 ? 'Excellent' : 'Good'}
                </div>
              </div>
            </div>

            {/* Seasonal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seasonal Travel Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Season</h4>
                  <p className="text-emerald-600 font-medium">{selectedForecast.seasonalInfo.currentSeason}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Peak Season</h4>
                  <p className="text-blue-600">{selectedForecast.seasonalInfo.peakSeason}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Off Season</h4>
                  <p className="text-gray-600">{selectedForecast.seasonalInfo.offSeason}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Monsoon Period</h4>
                  <p className="text-indigo-600">{selectedForecast.seasonalInfo.monsoonPeriod}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherForecastPage;