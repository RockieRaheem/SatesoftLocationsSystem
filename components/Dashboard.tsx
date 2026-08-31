

import React, { useState, useMemo } from 'react';
import { Theme, LeadStage, Role, ShopUser, SuperUser, Notification, ActiveView, ChatMessage, RegionalEconomicLevel } from '../types';
import Icon, { IconName } from './Icon';
import { mockShops, mockSalesTransactions, mockLeads, mockMessages, mockCallRecords, allAfricanCountries } from '../data';
import { DonutChart, BarChart, LineChart } from './Charts';
import AfricaMap from './AfricaMap';
import CountryDetailMap from './CountryDetailMap';
import CountryMapModal from './CountryMapModal';
import { formatDate } from '../utils';

const SummaryCard: React.FC<{ icon: IconName; title: string; value: string; theme: Theme }> = ({ icon, title, value, theme }) => {
    const iconContainerClasses = theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100';
    const iconClasses = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';

    return (
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-lg shadow-sm flex items-center border`}>
            <div className={`p-3 rounded-full mr-4 ${iconContainerClasses}`}>
                <Icon name={icon} className={`h-6 w-6 ${iconClasses}`} />
            </div>
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
};

interface DashboardProps {
  theme: Theme;
  shopRoles: Role[];
  superUserRoles: Role[];
  shopUsers: ShopUser[];
  superUsers: SuperUser[];
  notifications: Notification[];
  onNavigate: (view: ActiveView) => void;
  trackedKeywords: string[];
  userRole: string;
  regionalLevels: RegionalEconomicLevel[];
}

// Helper to generate word cloud data excluding stop words
const generateWordCloudData = (messages: ChatMessage[], trackedKeywords: string[], limit: number = 30) => {
    const stopWords = new Set(['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'will']);
    const words: Record<string, number> = {};
    const keywordsSet = new Set(trackedKeywords.map(k => k.toLowerCase()));

    messages.forEach(msg => {
        const content = msg.content.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const tokens = content.split(/\s+/);
        tokens.forEach(token => {
            if (!token) return;
            
            if (keywordsSet.size > 0) {
                // If whitelist exists, only count if present
                if (keywordsSet.has(token)) {
                     words[token] = (words[token] || 0) + 1;
                }
            } else {
                // Default behavior
                if (!stopWords.has(token) && token.length > 2) {
                    words[token] = (words[token] || 0) + 1;
                }
            }
        });
    });

    return Object.entries(words)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
};

// Helper to simulate sentiment analysis
const analyzeSentiment = (messages: ChatMessage[]) => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const positiveWords = ['good', 'great', 'excellent', 'thanks', 'happy', 'improve', 'growth', 'profit', 'love', 'welcome'];
    const negativeWords = ['bad', 'issue', 'problem', 'error', 'fail', 'drop', 'loss', 'hate', 'trouble', 'connectivity'];

    messages.forEach(msg => {
        const content = msg.content.toLowerCase();
        let score = 0;
        positiveWords.forEach(w => { if(content.includes(w)) score++; });
        negativeWords.forEach(w => { if(content.includes(w)) score--; });

        if (score > 0) positive++;
        else if (score < 0) negative++;
        else neutral++;
    });

    return { positive, negative, neutral };
};

const Dashboard: React.FC<DashboardProps> = ({ theme, shopRoles, superUserRoles, shopUsers, superUsers, notifications, onNavigate, trackedKeywords, userRole, regionalLevels }) => {
  
  const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Positive' | 'Negative' | 'Neutral'>('All');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedModalCountry, setSelectedModalCountry] = useState<{ id: string; name: string } | null>(null);

  const isFinancialInstitution = userRole === 'Financial Institution';

  const allUsers = [...shopUsers, ...superUsers];
  
  const userStatusSummary = useMemo(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
    
    let active = 0;
    let inactive = 0;
    
    allUsers.forEach(user => {
      if (user.status === 'Active') {
        if (new Date(user.lastActivity) >= threeDaysAgo) {
          active++;
        } else {
          inactive++;
        }
      }
    });
    
    const terminated = allUsers.filter(u => u.status === 'Terminated').length;
    
    return {
      total: allUsers.length,
      active,
      inactive,
      terminated,
    };
  }, [allUsers]);

  const genderData = useMemo(() => {
    const counts = allUsers.reduce((acc, user) => {
        if (user.gender === 'Male' || user.gender === 'Female') {
            acc[user.gender] = (acc[user.gender] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const genderOrder: ('Male' | 'Female')[] = ['Male', 'Female'];
    const colors = {
        Male: theme === 'dark' ? '#60A5FA' : '#3B82F6', // Blue
        Female: theme === 'dark' ? '#F472B6' : '#EC4899', // Pink
    };

    return genderOrder.map(gender => ({
        name: gender,
        value: counts[gender] || 0,
        color: colors[gender]
    }));
  }, [allUsers, theme]);
  
  const shopUserRoleData = useMemo(() => {
    const colors = theme === 'dark' 
        ? ['#818CF8', '#60A5FA', '#34D399'] // Indigo, Blue, Emerald
        : ['#6366F1', '#3B82F6', '#10B981'];
    return shopRoles.map((role, i) => ({
        name: role.name,
        value: shopUsers.filter(user => user.role === role.name).length,
        color: colors[i % colors.length]
    }));
  }, [shopRoles, shopUsers, theme]);

  const superUserRoleData = useMemo(() => {
    const colors = theme === 'dark'
        ? ['#F472B6', '#A78BFA', '#FBBF24'] // Pink, Violet, Yellow
        : ['#EC4899', '#8B5CF6', '#F59E0B'];
    return superUserRoles.map((role, i) => ({
        name: role.name,
        value: superUsers.filter(user => user.role === role.name).length,
        color: colors[i % colors.length]
    }));
  }, [superUserRoles, superUsers, theme]);

  // Call Analytics Data
  const callAnalyticsData = useMemo(() => {
      const inbound = mockCallRecords.filter(c => c.type === 'Inbound').length;
      const outbound = mockCallRecords.filter(c => c.type === 'Outbound').length;
      // Mock data augmentation for visual effect if real data is low
      return [
          { name: 'Inbound', value: inbound > 0 ? inbound : 15, color: theme === 'dark' ? '#34D399' : '#10B981' },
          { name: 'Outbound', value: outbound > 0 ? outbound : 22, color: theme === 'dark' ? '#60A5FA' : '#3B82F6' }
      ];
  }, [theme]);

  const shopsPerCountry = useMemo(() => {
    return mockShops.reduce((acc, shop) => {
        acc[shop.countryCode] = (acc[shop.countryCode] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  }, []);

  const villagesPerCountry = useMemo(() => {
    const counts: Record<string, number> = {
      'UG': 12,
      'KE': 8,
      'TZ': 6,
      'RW': 4,
      'NG': 15,
      'ZA': 10,
    };
    allAfricanCountries.forEach(country => {
      const level3Count = country.adminLevels?.filter(al => al.level === 3).length || 0;
      if (level3Count > 0) {
        counts[country.countryCode] = level3Count;
      }
    });
    return counts;
  }, []);

  const shopActivitySummary = useMemo(() => {
      const activeShops = new Set<number>();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      mockSalesTransactions.forEach(sale => {
          if (new Date(sale.date) > thirtyDaysAgo) {
              activeShops.add(sale.shopId);
          }
      });

      const activeCount = activeShops.size;
      const dormantCount = mockShops.length - activeCount;

      const colors = theme === 'dark'
          ? ['#34D399', '#F87171'] // Emerald-400, Red-400
          : ['#10B981', '#EF4444']; // Emerald-500, Red-500

      return [
          { name: 'Active', value: activeCount, color: colors[0] },
          { name: 'Dormant', value: dormantCount, color: colors[1] },
      ];
  }, [theme]);

  const leadsByStatusData = useMemo(() => {
      const counts = mockLeads.reduce((acc, lead) => {
          acc[lead.stage] = (acc[lead.stage] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const order: LeadStage[] = ['New', 'Contact Established', 'Negotiation', 'Won', 'Lost'];
      
      const colors = theme === 'dark'
          ? ['#60A5FA', '#2DD4BF', '#FBBF24', '#34D399', '#F87171'] 
          : ['#3B82F6', '#14B8A6', '#F59E0B', '#10B981', '#EF4444'];

      return order.map((stage, i) => ({
          name: stage,
          value: counts[stage] || 0,
          color: colors[i]
      }));
  }, [theme]);
  
  const criticalAlerts = useMemo(() => 
    notifications.filter(n => !n.read && n.priority === 'high'), 
    [notifications]
  );

  // Communication Analytics Data
  const wordCloudData = useMemo(() => generateWordCloudData(mockMessages, trackedKeywords), [trackedKeywords]);
  const sentimentData = useMemo(() => {
      const raw = analyzeSentiment(mockMessages);
      const data = [];
      if (sentimentFilter === 'All' || sentimentFilter === 'Positive') 
        data.push({ name: 'Positive', value: raw.positive, color: '#22c55e' }); // Green
      if (sentimentFilter === 'All' || sentimentFilter === 'Neutral') 
        data.push({ name: 'Neutral', value: raw.neutral, color: '#9ca3af' }); // Gray
      if (sentimentFilter === 'All' || sentimentFilter === 'Negative') 
        data.push({ name: 'Negative', value: raw.negative, color: '#ef4444' }); // Red
      return data;
  }, [sentimentFilter]);


  const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; headerAction?: React.ReactNode }> = ({ title, children, className = '', headerAction }) => (
    <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
             <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
             {headerAction}
        </div>
        {children}
    </div>
  );

  // Set neutral color for all words in the cloud
  const neutralColor = theme === 'dark' ? '#94a3b8' : '#64748b'; // Slate-400 (dark) or Slate-500 (light)

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard theme={theme} icon="user-mgt" title="Economic zones" value={userStatusSummary.total.toString()} />
          <SummaryCard theme={theme} icon="check-circle" title="Countries" value={userStatusSummary.active.toString()} />
          <SummaryCard theme={theme} icon="exclamation-triangle" title="National regions" value={userStatusSummary.inactive.toString()} />
          <SummaryCard theme={theme} icon="delete" title="Villages" value={userStatusSummary.terminated.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card title={selectedCountryId ? "Country Detail Map" : "Mapped villages"} className="lg:col-span-1">
          <div className="h-[768px] -mx-6 -my-4">
            {selectedCountryId ? (
              <CountryDetailMap 
                countryId={selectedCountryId} 
                shops={mockShops} 
                theme={theme} 
                onBack={() => setSelectedCountryId(null)} 
              />
            ) : (
              <AfricaMap 
                shops={mockShops} 
                shopDensity={villagesPerCountry} 
                regionalLevels={regionalLevels}
                theme={theme} 
                onCountryClick={(id, name) => setSelectedCountryId(id)}
                onCountryDoubleClick={(id, name) => setSelectedModalCountry({ id, name })}
              />
            )}
          </div>
        </Card>
      </div>



      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            Regional Economic Communities (RECs)
          </h3>
          <button 
            onClick={() => onNavigate('regional-economic-levels')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Manage Regions
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase tracking-wider`}>
                <th className="px-6 py-3 font-semibold border-b border-slate-700/50">Region</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-700/50">Abbreviation</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-700/50 text-center">Countries</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-700/50 text-center">Color</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-700/50 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {regionalLevels.slice(0, 5).map((level) => (
                <tr key={level.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-5 rounded overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 mr-3">
                        <img src={level.flag} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{level.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{level.abbreviation}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      {level.countries.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"
                        style={{ backgroundColor: level.color }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                    </span>
                  </td>
                </tr>
              ))}
              {regionalLevels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No regional data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Call Analytics (Inbound vs Outbound)">
              <BarChart data={callAnalyticsData} theme={theme} />
          </Card>
           <Card title="Sales Transactions">
            <LineChart data={mockSalesTransactions} theme={theme} />
        </Card>
      </div>

      {/* Communication Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card 
            title="Message Sentiment" 
            headerAction={
                <select 
                    value={sentimentFilter} 
                    onChange={(e) => setSentimentFilter(e.target.value as any)}
                    className={`text-xs border rounded p-1 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                >
                    <option value="All">All Sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                </select>
            }
        >
            <DonutChart data={sentimentData} theme={theme} centerLabel="Sentiment" />
            <div className="mt-4 text-center text-xs text-gray-500">Based on {mockMessages.length} analyzed messages</div>
         </Card>

         <Card title="Word Cloud (Trending Topics)">
             <div className="h-64 flex flex-wrap justify-center items-center content-center gap-x-4 gap-y-2 p-4 overflow-hidden">
                 {wordCloudData.map((item, index) => {
                     const fontSize = Math.max(0.8, Math.min(2.5, 0.8 + (item.value / 5) * 1.5)); // Scale font size based on value
                     return (
                         <span 
                            key={item.text} 
                            style={{ fontSize: `${fontSize}rem`, color: neutralColor, opacity: 0.8 + (item.value/20) }}
                            className="font-bold cursor-default hover:opacity-100 hover:scale-110 transition-all duration-200"
                            title={`Frequency: ${item.value}`}
                         >
                             {item.text}
                         </span>
                     )
                 })}
                 {wordCloudData.length === 0 && <p className="text-slate-500">No data or matching keywords found.</p>}
             </div>
         </Card>
      </div>

      

      {selectedModalCountry && (
        <CountryMapModal
          countryId={selectedModalCountry.id}
          countryName={selectedModalCountry.name}
          theme={theme}
          onClose={() => setSelectedModalCountry(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;