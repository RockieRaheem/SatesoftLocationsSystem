
import React, { useMemo } from 'react';
import { Theme, ChatMessage } from '../types';
import Icon from './Icon';
import { DonutChart } from './Charts';

interface MessageAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    messages: ChatMessage[];
    roomName: string;
    trackedKeywords: string[];
}

// Duplicated helper from Dashboard to make this component self-contained or importable
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

const analyzeSentiment = (messages: ChatMessage[]) => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const positiveWords = ['good', 'great', 'excellent', 'thanks', 'happy', 'improve', 'growth', 'profit', 'love', 'welcome', 'received', 'ok'];
    const negativeWords = ['bad', 'issue', 'problem', 'error', 'fail', 'drop', 'loss', 'hate', 'trouble', 'connectivity', 'down'];

    messages.forEach(msg => {
        const content = msg.content.toLowerCase();
        let score = 0;
        positiveWords.forEach(w => { if(content.includes(w)) score++; });
        negativeWords.forEach(w => { if(content.includes(w)) score--; });

        if (score > 0) positive++;
        else if (score < 0) negative++;
        else neutral++;
    });

    return [
        { name: 'Positive', value: positive, color: '#22c55e' },
        { name: 'Neutral', value: neutral, color: '#9ca3af' },
        { name: 'Negative', value: negative, color: '#ef4444' }
    ];
};

const MessageAnalyticsModal: React.FC<MessageAnalyticsModalProps> = ({ isOpen, onClose, theme, messages, roomName, trackedKeywords }) => {
    const wordCloudData = useMemo(() => generateWordCloudData(messages, trackedKeywords), [messages, trackedKeywords]);
    const sentimentData = useMemo(() => analyzeSentiment(messages), [messages]);

    if (!isOpen) return null;

    const neutralColor = theme === 'dark' ? '#94a3b8' : '#64748b';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div 
                className={`w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div>
                        <h2 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            <Icon name="analytics" className="h-6 w-6 mr-2 text-yellow-500" />
                            Analytics for "{roomName}"
                        </h2>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Based on {messages.length} visible messages</p>
                    </div>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Icon name="x-mark" className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sentiment Section */}
                    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Sentiment Analysis</h3>
                        <div className="h-64">
                             <DonutChart data={sentimentData} theme={theme} centerLabel="Total" />
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded bg-green-500/10 text-green-500">
                                <Icon name="smile" className="h-6 w-6 mx-auto mb-1" />
                                <span className="font-bold block">{sentimentData[0].value}</span>
                                <span className="text-xs">Positive</span>
                            </div>
                            <div className="p-2 rounded bg-gray-500/10 text-gray-500">
                                <Icon name="meh" className="h-6 w-6 mx-auto mb-1" />
                                <span className="font-bold block">{sentimentData[1].value}</span>
                                <span className="text-xs">Neutral</span>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-red-500">
                                <Icon name="frown" className="h-6 w-6 mx-auto mb-1" />
                                <span className="font-bold block">{sentimentData[2].value}</span>
                                <span className="text-xs">Negative</span>
                            </div>
                        </div>
                    </div>

                    {/* Word Cloud Section */}
                    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Top Topics (Word Cloud)</h3>
                        <div className="h-80 flex flex-wrap justify-center items-center content-center gap-x-3 gap-y-1 overflow-y-auto p-2">
                             {wordCloudData.map((item, index) => {
                                 const fontSize = Math.max(0.9, Math.min(2.2, 0.8 + (item.value / (messages.length * 0.1)) * 1.5)); 
                                 return (
                                     <span 
                                        key={item.text + index} 
                                        style={{ fontSize: `${fontSize}rem`, color: neutralColor, opacity: 0.7 + (index < 5 ? 0.3 : 0) }}
                                        className="font-bold cursor-default hover:opacity-100 hover:scale-110 transition-all duration-200"
                                        title={`Frequency: ${item.value}`}
                                     >
                                         {item.text}
                                     </span>
                                 )
                             })}
                             {wordCloudData.length === 0 && (
                                 <p className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Not enough data to generate a word cloud.</p>
                             )}
                        </div>
                    </div>
                </div>
                
                <div className={`flex justify-end p-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-black/20' : 'border-slate-200 bg-slate-50'} rounded-b-lg`}>
                    <button onClick={onClose} className={`px-6 py-2 text-sm font-medium rounded-md bg-yellow-500 text-slate-900 hover:bg-yellow-600 shadow-md`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageAnalyticsModal;
