
import React from 'react';
import Header from './Header';
import { Footer } from './LandingComponents';
import { BlogPost } from '../types';
import Icon from './Icon';

interface BlogPostPageProps {
    post: BlogPost;
    onBack: () => void;
    onOpenSignup: () => void;
    onSignin: () => void;
    onAdminClick: () => void;
    onPrivacyClick: () => void;
    onTermsClick: () => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, onBack, onOpenSignup, onSignin, onAdminClick, onPrivacyClick, onTermsClick }) => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
            <Header onOpenSignup={onOpenSignup} onSignin={onSignin} />
            
            <main className="flex-grow pt-28 pb-16">
                <article className="max-w-3xl mx-auto px-4">
                    {/* Navigation */}
                    <button 
                        onClick={onBack}
                        className="flex items-center text-sm text-slate-500 hover:text-yellow-600 mb-8 transition-colors group"
                    >
                        <Icon name="chevron-left" className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        Back to Blog
                    </button>

                    {/* Article Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                                {post.category}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-slate-500 text-sm">{post.date}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between border-y border-slate-100 py-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{post.author}</p>
                                    <p className="text-xs text-slate-500">{post.readTime}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                                    <Icon name="twitter" className="h-5 w-5" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-700 transition-colors">
                                    <Icon name="linkedin" className="h-5 w-5" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                                    <Icon name="share" className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="rounded-xl overflow-hidden mb-10 shadow-lg">
                        <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>

                    {/* Content Body */}
                    <div 
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-yellow-600 hover:prose-a:text-yellow-500 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content || `<p>${post.excerpt}</p>` }}
                    />

                    {/* Tags / Footer of Article */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Supply Chain', 'Retail', 'Technology', 'Africa', 'Innovation'].map(tag => (
                                <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>
            </main>

            <div className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Related Articles</h3>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                         {/* This would typically filter out the current post and map 3 others */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                             <span className="text-xs font-bold text-yellow-600 uppercase">Guide</span>
                             <h4 className="text-lg font-bold mt-2 mb-2">Mastering Stock Levels</h4>
                             <p className="text-slate-500 text-sm">Tips and tricks for maintaining optimal inventory...</p>
                         </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                             <span className="text-xs font-bold text-yellow-600 uppercase">Case Study</span>
                             <h4 className="text-lg font-bold mt-2 mb-2">Shop A's Success Story</h4>
                             <p className="text-slate-500 text-sm">How one retailer doubled their revenue in 3 months...</p>
                         </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                             <span className="text-xs font-bold text-yellow-600 uppercase">News</span>
                             <h4 className="text-lg font-bold mt-2 mb-2">Location Register Expands to Kenya</h4>
                             <p className="text-slate-500 text-sm">We are excited to announce our new regional office...</p>
                         </div>
                    </div>
                </div>
            </div>

            <Footer 
                onAdminClick={onAdminClick} 
                onBlogClick={onBack} 
                onPrivacyClick={onPrivacyClick}
                onTermsClick={onTermsClick}
            />
        </div>
    );
};

export default BlogPostPage;
