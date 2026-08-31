
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { 
    Hero, 
    About, 
    Features, 
    BenefitsSMB, 
    BenefitsManufacturer, 
    SignupModal, 
    FeedbackForm, 
    Partners, 
    Footer, 
    Chatbot, 
    FAQ 
} from './components/LandingComponents';
import SignIn from './components/SignIn';
import AdminDashboard from './components/AdminDashboard';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { LanguageProvider } from './contexts/LanguageContext';
import { Partner, PricingTier, User, BlogPost } from './types';
import Icon from './components/Icon';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'blog' | 'blog-post' | 'privacy' | 'terms'>('home');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  
  // Track the user role for the session to switch dashboards
  const [currentUserRole, setCurrentUserRole] = useState<string>('Administrator');
  
  // Default partners data
  const defaultPartners: Partner[] = [
    { 
      name: "Konnect Initiatives", 
      logo: "https://placehold.co/200x80/f3f4f6/0B2A46?text=Konnect+Initiatives",
      description: "Driving digital inclusion and youth empowerment through technology innovation."
    },
    { 
      name: "Response Innovation Labs", 
      logo: "https://placehold.co/200x80/f3f4f6/0B2A46?text=Response+Innovation+Labs",
      description: "Supporting humanitarian solutions and crisis response through scalable tech."
    },
    { 
      name: "AWS", 
      logo: "https://placehold.co/120x80/f3f4f6/0B2A46?text=AWS",
      description: "Providing secure, scalable cloud infrastructure to power our data analytics."
    },
    { 
      name: "National ICT Innovation Hub", 
      logo: "https://placehold.co/200x80/f3f4f6/0B2A46?text=National+ICT+Hub",
      description: "Fostering the local ecosystem for software development and digital entrepreneurship."
    }
  ];

  // Default Pricing Data with requested rounding
  const defaultPricing: PricingTier[] = [
    { country: 'Uganda', currency: 'UGX', subscription: 20000, registration: 40000, flag: '🇺🇬' },
    { country: 'Kenya', currency: 'KES', subscription: 800, registration: 1600, flag: '🇰🇪' },
    { country: 'Tanzania', currency: 'TZS', subscription: 16000, registration: 32000, flag: '🇹🇿' },
    { country: 'Rwanda', currency: 'RWF', subscription: 8000, registration: 16000, flag: '🇷🇼' },
    { country: 'Burundi', currency: 'BIF', subscription: 18000, registration: 36000, flag: '🇧🇮' },
    { country: 'South Sudan', currency: 'SSP', subscription: 8000, registration: 16000, flag: '🇸🇸' },
    { country: 'DR Congo', currency: 'USD', subscription: 6, registration: 12, flag: '🇨🇩' },
    { country: 'Other', currency: 'USD', subscription: 6, registration: 12, flag: '🌍' }
  ];

  // Initialize partners from localStorage or defaults
  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const savedPartners = localStorage.getItem('register_partners');
      return savedPartners ? JSON.parse(savedPartners) : defaultPartners;
    } catch (e) {
      console.error("Failed to load partners from local storage", e);
      return defaultPartners;
    }
  });

  // Initialize pricing from localStorage or defaults
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(() => {
    try {
      const savedPricing = localStorage.getItem('register_pricing');
      return savedPricing ? JSON.parse(savedPricing) : defaultPricing;
    } catch (e) {
      console.error("Failed to load pricing from local storage", e);
      return defaultPricing;
    }
  });

  // Save partners to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('register_partners', JSON.stringify(partners));
  }, [partners]);

  // Save pricing to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('register_pricing', JSON.stringify(pricingTiers));
  }, [pricingTiers]);

  const openSignup = () => {
      setIsSignupOpen(true);
      setIsSigninOpen(false);
  }
  const closeSignup = () => setIsSignupOpen(false);
  
  const openSignin = () => {
      setIsSigninOpen(true);
      setIsSignupOpen(false);
  }
  const closeSignin = () => setIsSigninOpen(false);

  const handleLogin = (role?: string) => {
      let mappedRole = role || 'Administrator';
      if (role === 'Super admin' || role === 'Admin') {
          mappedRole = 'Administrator';
      } else if (role === 'Country Admin') {
          mappedRole = 'Shop Owner';
      } else if (role === 'Contributor') {
          mappedRole = 'Customer';
      }
      setCurrentUserRole(mappedRole);
      setIsSigninOpen(false);
      setView('admin');
  }

  const handleReadPost = (post: BlogPost) => {
      setSelectedBlogPost(post);
      setView('blog-post');
      window.scrollTo(0, 0);
  }

  if (view === 'admin') {
    return (
      <AdminDashboard 
        partners={partners}
        onAddPartner={(newPartner) => setPartners([...partners, newPartner])}
        onUpdatePartner={(index, updatedPartner) => {
            const newPartners = [...partners];
            newPartners[index] = updatedPartner;
            setPartners(newPartners);
        }}
        onRemovePartner={(index) => setPartners(partners.filter((_, i) => i !== index))}
        pricingTiers={pricingTiers}
        onUpdatePricing={(newTiers) => setPricingTiers(newTiers)}
        onLogout={() => setView('home')}
        userRole={currentUserRole}
      />
    );
  }

  if (view === 'blog') {
      return (
          <>
            <BlogPage 
                onOpenSignup={openSignup}
                onSignin={openSignin}
                onNavigateHome={() => setView('home')}
                onAdminClick={openSignin}
                onReadPost={handleReadPost}
                onPrivacyClick={() => { setView('privacy'); window.scrollTo(0, 0); }}
                onTermsClick={() => { setView('terms'); window.scrollTo(0, 0); }}
            />
             {/* Modals need to be available in Blog view too */}
            <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
            <SignIn isOpen={isSigninOpen} onClose={closeSignin} onLogin={handleLogin} />
          </>
      )
  }

  if (view === 'blog-post' && selectedBlogPost) {
      return (
          <>
            <BlogPostPage 
                post={selectedBlogPost}
                onBack={() => setView('blog')}
                onOpenSignup={openSignup}
                onSignin={openSignin}
                onAdminClick={openSignin}
                onPrivacyClick={() => { setView('privacy'); window.scrollTo(0, 0); }}
                onTermsClick={() => { setView('terms'); window.scrollTo(0, 0); }}
            />
            <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
            <SignIn isOpen={isSigninOpen} onClose={closeSignin} onLogin={handleLogin} />
          </>
      )
  }

  if (view === 'privacy') {
      return (
          <>
            <PrivacyPolicyPage 
                onOpenSignup={openSignup}
                onSignin={openSignin}
                onNavigateHome={() => setView('home')}
                onAdminClick={openSignin}
                onTermsClick={() => { setView('terms'); window.scrollTo(0, 0); }}
            />
            <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
            <SignIn isOpen={isSigninOpen} onClose={closeSignin} onLogin={handleLogin} />
          </>
      )
  }

  if (view === 'terms') {
      return (
          <>
            <TermsOfServicePage 
                onOpenSignup={openSignup}
                onSignin={openSignin}
                onNavigateHome={() => setView('home')}
                onAdminClick={openSignin}
                onPrivacyClick={() => { setView('privacy'); window.scrollTo(0, 0); }}
            />
            <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
            <SignIn isOpen={isSigninOpen} onClose={closeSignin} onLogin={handleLogin} />
          </>
      )
  }

  // Default Home View
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header onOpenSignup={openSignup} onSignin={openSignin} />
      
      <main>
        <Hero onLogin={handleLogin} />
        <About />
        <Features />
        <BenefitsSMB />
        <BenefitsManufacturer onOpenSignup={openSignup} />
        
        {/* Partners Section with dynamic data */}
        <Partners partners={partners} />

        {/* FAQ Section */}
        <FAQ pricingTiers={pricingTiers} />

        {/* Feedback Section */}
        <section className="min-h-screen flex flex-col justify-center py-20 bg-white border-t border-gray-100" id="feedback">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">Get in touch</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               {/* Left Column: Contact Info & Map */}
               <div className="space-y-8">
                  {/* Embedded Map - Moved to Top */}
                  <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <iframe 
                        title="Office Location"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src="https://maps.google.com/maps?q=Kampala%2C%20Uganda&t=&z=14&ie=UTF8&iwloc=&output=embed"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                      ></iframe>
                  </div>

                  <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Visit our offices</h3>
                      <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                             <div className="bg-blue-500/10 p-3 rounded-lg text-blue-600">
                                <Icon name="globe" className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-gray-900">Headquarters</p>
                                <p className="text-gray-600">Nakasero Hill Road, Plot 14</p>
                                <p className="text-gray-600">Kampala, Uganda</p>
                             </div>
                          </div>

                          <div className="flex items-start space-x-4">
                             <div className="bg-blue-500/10 p-3 rounded-lg text-blue-600">
                                <Icon name="chat-bubble" className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-gray-900">Email Us</p>
                                <a href="mailto:info@satesoftintelligence.com" className="text-gray-600 hover:text-blue-500 transition-colors">info@satesoftintelligence.com</a>
                             </div>
                          </div>

                          <div className="flex items-start space-x-4">
                             <div className="bg-blue-500/10 p-3 rounded-lg text-blue-600">
                                <Icon name="phone" className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-gray-900">Call Us</p>
                                <p className="text-gray-600">+256 700 123 456</p>
                             </div>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Right Column: Form */}
               <div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-2">Send us a message</h3>
                   <p className="text-gray-500 mb-6">Fill out the form below and we'll get back to you shortly.</p>
                   <FeedbackForm />
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer 
        onAdminClick={openSignin} 
        onBlogClick={() => { setView('blog'); window.scrollTo(0, 0); }} 
        onPrivacyClick={() => { setView('privacy'); window.scrollTo(0, 0); }}
        onTermsClick={() => { setView('terms'); window.scrollTo(0, 0); }}
      />
      
      {/* Floating AI Assistant */}
      <Chatbot />

      {/* Modals */}
      <SignupModal isOpen={isSignupOpen} onClose={closeSignup} />
      <SignIn isOpen={isSigninOpen} onClose={closeSignin} onLogin={handleLogin} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider language="en">
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
