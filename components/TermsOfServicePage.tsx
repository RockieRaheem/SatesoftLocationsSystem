
import React from 'react';
import Header from './Header';
import { Footer } from './LandingComponents';
import Icon from './Icon';

interface TermsOfServicePageProps {
    onOpenSignup: () => void;
    onSignin: () => void;
    onNavigateHome: () => void;
    onAdminClick: () => void;
    onPrivacyClick: () => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onOpenSignup, onSignin, onNavigateHome, onAdminClick, onPrivacyClick }) => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
            <Header onOpenSignup={onOpenSignup} onSignin={onSignin} />
            
            <main className="flex-grow pt-28 pb-16">
                <div className="bg-slate-900 text-white py-16 mb-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-slate-400">Last updated: October 26, 2023</p>
                        <button onClick={onNavigateHome} className="mt-6 text-yellow-500 hover:text-yellow-400 font-medium flex items-center justify-center gap-2 mx-auto">
                            <Icon name="chevron-left" className="h-4 w-4" /> Back to Home
                        </button>
                    </div>
                </div>

                <article className="max-w-3xl mx-auto px-4 prose prose-slate prose-headings:font-bold prose-a:text-blue-600">
                    <h3>1. Agreement to Terms</h3>
                    <p>
                        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Location Register 
                        ("we," "us," or "our"), concerning your access to and use of the Location Register website and application (the "Service").
                    </p>

                    <h3>2. Intellectual Property Rights</h3>
                    <p>
                        Unless otherwise indicated, the Service is our proprietary property and all source code, databases, functionality, software, website designs, 
                        audio, video, text, photographs, and graphics on the Service (collectively, the "Content") and the trademarks, service marks, and logos 
                        contained therein (the "Marks") are owned or controlled by us or licensed to us.
                    </p>

                    <h3>3. User Representations</h3>
                    <p>
                        By using the Service, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; 
                        (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal 
                        capacity and you agree to comply with these Terms of Service.
                    </p>

                    <h3>4. Prohibited Activities</h3>
                    <p>
                        You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used 
                        in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>

                    <h3>5. User Registration</h3>
                    <p>
                        You may be required to register with the Service. You agree to keep your password confidential and will be responsible for all use of your 
                        account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, 
                        that such username is inappropriate, obscene, or otherwise objectionable.
                    </p>

                    <h3>6. Fees and Payment</h3>
                    <p>
                        We accept the following forms of payment: Mobile Money, Credit/Debit Cards. You may be required to purchase or pay a fee to access some of our services. 
                        You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.
                    </p>

                    <h3>7. Termination</h3>
                    <p>
                        These Terms of Service shall remain in full force and effect while you use the Service. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, 
                        WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), 
                        TO ANY PERSON FOR ANY REASON.
                    </p>

                    <h3>8. Governing Law</h3>
                    <p>
                        These Terms shall be governed by and defined following the laws of Uganda. Location Register and yourself irrevocably consent that the courts of Uganda 
                        shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                    </p>

                    <h3>9. Contact Us</h3>
                    <p>
                        In order to resolve a complaint regarding the Service or to receive further information regarding use of the Service, please contact us at:
                    </p>
                    <p>
                        <strong>Location Register Inc.</strong><br />
                        Nakasero Hill Road, Plot 14<br />
                        Kampala, Uganda<br />
                        support@locationregister.org
                    </p>
                </article>
            </main>

            <Footer 
                onAdminClick={onAdminClick} 
                onBlogClick={onNavigateHome}
                onPrivacyClick={onPrivacyClick}
                onTermsClick={() => {}} // Already here
            />
        </div>
    );
};

export default TermsOfServicePage;
