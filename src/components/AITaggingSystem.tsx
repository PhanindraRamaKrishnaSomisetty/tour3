import React, { useState, useEffect } from 'react';
import { Brain, Tag, TrendingUp, Users, Leaf, Camera, Mountain, Heart, Shield, Wifi } from 'lucide-react';
import { communities, getAITagRecommendations } from '../data/communities';

interface AITag {
  id: string;
  name: string;
  score: number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface AITaggingSystemProps {
  communityId: string;
  onTagsUpdate?: (tags: AITag[]) => void;
}

const AITaggingSystem: React.FC<AITaggingSystemProps> = ({ communityId, onTagsUpdate }) => {
  const [aiTags, setAiTags] = useState<AITag[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const community = communities.find(c => c.id === communityId);

  useEffect(() => {
    if (community) {
      analyzeAndGenerateTags();
    }
  }, [community]);

  const analyzeAndGenerateTags = async () => {
    if (!community) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tags: AITag[] = [
      {
        id: 'eco_friendly',
        name: 'Eco-Friendly',
        score: community.aiTags.ecoFriendly,
        icon: Leaf,
        color: getScoreColor(community.aiTags.ecoFriendly),
        description: 'Environmental sustainability and conservation practices'
      },
      {
        id: 'cultural_richness',
        name: 'Cultural Heritage',
        score: community.aiTags.culturalRichness,
        icon: Users,
        color: getScoreColor(community.aiTags.culturalRichness),
        description: 'Rich cultural traditions and heritage preservation'
      },
      {
        id: 'adventure_level',
        name: 'Adventure Activities',
        score: community.aiTags.adventureLevel,
        icon: Mountain,
        color: getScoreColor(community.aiTags.adventureLevel),
        description: 'Outdoor adventures and thrilling experiences'
      },
      {
        id: 'family_friendly',
        name: 'Family-Friendly',
        score: community.aiTags.familyFriendly,
        icon: Heart,
        color: getScoreColor(community.aiTags.familyFriendly),
        description: 'Safe and enjoyable for families with children'
      },
      {
        id: 'solo_traveler_safe',
        name: 'Solo Traveler Safe',
        score: community.aiTags.soloTravelerSafe,
        icon: Shield,
        color: getScoreColor(community.aiTags.soloTravelerSafe),
        description: 'Safe and welcoming for solo travelers'
      },
      {
        id: 'digital_connectivity',
        name: 'Digital Connectivity',
        score: community.aiTags.digitalConnectivity,
        icon: Wifi,
        color: getScoreColor(community.aiTags.digitalConnectivity),
        description: 'Internet and mobile connectivity availability'
      },
      {
        id: 'organic_farming',
        name: 'Organic Farming',
        score: community.aiTags.organicFarming,
        icon: Leaf,
        color: getScoreColor(community.aiTags.organicFarming),
        description: 'Organic and sustainable farming practices'
      },
      {
        id: 'traditional_crafts',
        name: 'Traditional Crafts',
        score: community.aiTags.traditionalCrafts,
        icon: Tag,
        color: getScoreColor(community.aiTags.traditionalCrafts),
        description: 'Traditional handicrafts and artisan skills'
      },
      {
        id: 'wildlife_conservation',
        name: 'Wildlife Conservation',
        score: community.aiTags.wildlifeConservation,
        icon: Camera,
        color: getScoreColor(community.aiTags.wildlifeConservation),
        description: 'Wildlife protection and conservation efforts'
      }
    ];

    setAiTags(tags);
    setIsAnalyzing(false);
    setAnalysisComplete(true);

    if (onTagsUpdate) {
      onTagsUpdate(tags);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Limited';
  };

  if (!community) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Community not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">AI-Powered Community Analysis</h3>
        {isAnalyzing && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm text-purple-600">Analyzing...</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">{community.name}</h4>
        <p className="text-sm text-gray-600">{community.village}, {community.state}</p>
      </div>

      {isAnalyzing ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {aiTags.map((tag) => (
            <div key={tag.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tag.color}`}>
                    <tag.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{tag.name}</h5>
                    <p className="text-xs text-gray-600">{tag.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{tag.score}/100</div>
                  <div className={`text-xs font-medium ${tag.color.split(' ')[0]}`}>
                    {getScoreLabel(tag.score)}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${tag.color.includes('green') ? 'bg-green-500' :
                    tag.color.includes('blue') ? 'bg-blue-500' :
                    tag.color.includes('yellow') ? 'bg-yellow-500' :
                    tag.color.includes('orange') ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${tag.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisComplete && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h5 className="font-medium text-purple-900 mb-2">AI Recommendations</h5>
          <div className="flex flex-wrap gap-2">
            {getAITagRecommendations(community).map((recommendation, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
              >
                {recommendation}
              </span>
            ))}
          </div>
          <p className="text-sm text-purple-700 mt-2">
            Based on AI analysis of community data, visitor feedback, and sustainability metrics.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={analyzeAndGenerateTags}
          disabled={isAnalyzing}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze Community'}
        </button>
        
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AITaggingSystem;