
import React from 'react';
import Header from './Header';
import { Footer } from './LandingComponents';
import { BlogPost } from '../types';
import { mockBlogPosts } from '../data';

interface BlogPageProps {
    onOpenSignup: () => void;
    onSignin: () => void;
    onNavigateHome: () => void;
    onAdminClick: () => void;
    onReadPost: (post: BlogPost) => void;
    onPrivacyClick: () => void;
    onTermsClick: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onOpenSignup, onSignin, onNavigateHome, onAdminClick, onReadPost, onPrivacyClick, onTermsClick }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
            <Header onOpenSignup={onOpenSignup} onSignin={onSignin} />
            
            <main className="flex-grow pt-24 pb-16">
                {/* Hero Section for Blog */}
                <div className="bg-slate-900 text-white py-20 mb-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Location Register Blog</h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Insights, updates, and stories from the forefront of regional trade & location boundaries mapping.
                        </p>
                        <button onClick={onNavigateHome} className="mt-8 text-yellow-500 hover:text-yellow-400 font-medium">
                            ← Back to Home
                        </button>
                    </div>
                </div>

                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockBlogPosts.map(post => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer" onClick={() => onReadPost(post)}>
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded uppercase tracking-wide">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-slate-500">{post.readTime}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-900">{post.author}</span>
                                            <span className="mx-1">•</span>
                                            {post.date}
                                        </div>
                                        <span className="text-sm font-medium text-blue-600 group-hover:underline">Read More →</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <Footer 
                onAdminClick={onAdminClick} 
                onBlogClick={() => {}} 
                onPrivacyClick={onPrivacyClick}
                onTermsClick={onTermsClick}
            />
        </div>
    );
};

export default BlogPage;
