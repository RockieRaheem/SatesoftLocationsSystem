import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard.tsx';
import BlogPage from './components/BlogPage.tsx';
import BlogPostPage from './components/BlogPostPage.tsx';
import Header from './components/Header.tsx';
import { About, BenefitsManufacturer, BenefitsSMB, Chatbot, FAQ, Features, FeedbackForm, Footer, Hero, Partners, SignupModal } from './components/LandingComponents.tsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './components/TermsOfServicePage.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import type { BlogPost, Partner, PricingTier } from './types.ts';

type PublicView = 'home' | 'admin' | 'blog' | 'blog-post' | 'privacy' | 'terms';

const defaultPartners: Partner[] = [
  { name: 'Konnect Initiatives', logo: 'https://placehold.co/200x80/f3f4f6/0B2A46?text=Konnect+Initiatives', description: 'Driving digital inclusion and youth empowerment through technology innovation.' },
  { name: 'Response Innovation Labs', logo: 'https://placehold.co/200x80/f3f4f6/0B2A46?text=Response+Innovation+Labs', description: 'Supporting humanitarian solutions and crisis response through scalable technology.' },
  { name: 'AWS', logo: 'https://placehold.co/120x80/f3f4f6/0B2A46?text=AWS', description: 'Providing secure and scalable cloud infrastructure.' },
  { name: 'National ICT Innovation Hub', logo: 'https://placehold.co/200x80/f3f4f6/0B2A46?text=National+ICT+Hub', description: 'Supporting Uganda’s software and digital innovation ecosystem.' },
];

const pricingTiers: PricingTier[] = [
  { country: 'Uganda', currency: 'UGX', subscription: 20000, registration: 40000, flag: '🇺🇬' },
  { country: 'Kenya', currency: 'KES', subscription: 800, registration: 1600, flag: '🇰🇪' },
  { country: 'Tanzania', currency: 'TZS', subscription: 16000, registration: 32000, flag: '🇹🇿' },
  { country: 'Rwanda', currency: 'RWF', subscription: 8000, registration: 16000, flag: '🇷🇼' },
  { country: 'Burundi', currency: 'BIF', subscription: 18000, registration: 36000, flag: '🇧🇮' },
  { country: 'South Sudan', currency: 'SSP', subscription: 8000, registration: 16000, flag: '🇸🇸' },
  { country: 'DR Congo', currency: 'USD', subscription: 6, registration: 12, flag: '🇨🇩' },
  { country: 'Other', currency: 'USD', subscription: 6, registration: 12, flag: '🌍' },
];

const AppContent: React.FC = () => {
  const [view, setView] = useState<PublicView>(() => window.location.hash === '#workspace' ? 'admin' : 'home');
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const openWorkspace = () => { setView('admin'); window.history.replaceState(null, '', `${window.location.pathname}#workspace`); };
  const navigate = (next: PublicView) => { setView(next); window.scrollTo(0, 0); };
  const openPost = (post: BlogPost) => { setSelectedPost(post); navigate('blog-post'); };

  if (view === 'admin') return <AdminDashboard />;
  if (view === 'blog') return <><BlogPage onOpenSignup={() => setSignupOpen(true)} onSignin={openWorkspace} onNavigateHome={() => navigate('home')} onAdminClick={openWorkspace} onReadPost={openPost} onPrivacyClick={() => navigate('privacy')} onTermsClick={() => navigate('terms')} /><SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} /></>;
  if (view === 'blog-post' && selectedPost) return <><BlogPostPage post={selectedPost} onBack={() => navigate('blog')} onOpenSignup={() => setSignupOpen(true)} onSignin={openWorkspace} onAdminClick={openWorkspace} onPrivacyClick={() => navigate('privacy')} onTermsClick={() => navigate('terms')} /><SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} /></>;
  if (view === 'privacy') return <><PrivacyPolicyPage onOpenSignup={() => setSignupOpen(true)} onSignin={openWorkspace} onNavigateHome={() => navigate('home')} onAdminClick={openWorkspace} onTermsClick={() => navigate('terms')} /><SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} /></>;
  if (view === 'terms') return <><TermsOfServicePage onOpenSignup={() => setSignupOpen(true)} onSignin={openWorkspace} onNavigateHome={() => navigate('home')} onAdminClick={openWorkspace} onPrivacyClick={() => navigate('privacy')} /><SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} /></>;

  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900"><Header onOpenSignup={() => setSignupOpen(true)} onSignin={openWorkspace} /><main><Hero onLogin={openWorkspace} /><About /><Features /><BenefitsSMB /><BenefitsManufacturer onOpenSignup={() => setSignupOpen(true)} /><Partners partners={defaultPartners} /><FAQ pricingTiers={pricingTiers} /><section id="feedback" className="border-t border-gray-100 bg-white py-20"><div className="container mx-auto px-4"><h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Get in touch</h2><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2"><div><div className="h-80 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm"><iframe title="Office location" width="100%" height="100%" src="https://maps.google.com/maps?q=Kampala%2C%20Uganda&t=&z=14&ie=UTF8&iwloc=&output=embed" loading="lazy" /></div><h3 className="mt-8 text-2xl font-bold text-slate-900">Visit our offices</h3><p className="mt-3 text-gray-600">Nakasero Hill Road, Kampala, Uganda</p><p className="mt-1 text-gray-600">info@satesoftintelligence.com</p></div><div><h3 className="text-2xl font-bold text-slate-900">Send us a message</h3><p className="mb-6 mt-2 text-gray-500">Tell us how the Location Register can support your work.</p><FeedbackForm /></div></div></div></section></main><Footer onAdminClick={openWorkspace} onBlogClick={() => navigate('blog')} onPrivacyClick={() => navigate('privacy')} onTermsClick={() => navigate('terms')} /><Chatbot /><SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} /></div>;
};

const App: React.FC = () => <LanguageProvider language="en"><AppContent /></LanguageProvider>;
export default App;
