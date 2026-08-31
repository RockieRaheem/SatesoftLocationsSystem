
import React from 'react';
import Header from './Header';
import { Footer } from './LandingComponents';
import Icon from './Icon';

interface PrivacyPolicyPageProps {
    onOpenSignup: () => void;
    onSignin: () => void;
    onNavigateHome: () => void;
    onAdminClick: () => void;
    onTermsClick: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onOpenSignup, onSignin, onNavigateHome, onAdminClick, onTermsClick }) => {
    
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const navItems = [
        { id: 'introduction', label: '1. Introduction' },
        { id: 'information', label: '2. Information We Collect' },
        { id: 'usage', label: '3. How We Use Information' },
        { id: 'sharing', label: '4. Sharing Information' },
        { id: 'security', label: '5. Data Security' },
        { id: 'rights', label: '6. Your Privacy Rights' },
        { id: 'contact', label: '7. Contact Us' },
    ];

    const TableRow = ({ label, content }: { label: string, content: React.ReactNode }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 last:border-0">
            <div className="p-4 bg-slate-50 md:border-r border-slate-200 font-semibold text-slate-700 text-sm">
                {label}
            </div>
            <div className="p-4 md:col-span-2 text-slate-600 text-sm">
                {content}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
            <Header onOpenSignup={onOpenSignup} onSignin={onSignin} />
            
            <main className="flex-grow pt-24">
                {/* Hero Banner */}
                <div className="bg-slate-900 text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-slate-400">Last updated: October 26, 2023</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto">
                        {/* Left Navigation Sidebar */}
                        <aside className="hidden md:block w-64 flex-shrink-0">
                            <div className="sticky top-32">
                                <button 
                                    onClick={onNavigateHome} 
                                    className="mb-8 text-sm font-medium text-slate-500 hover:text-yellow-600 flex items-center gap-2 transition-colors"
                                >
                                    <Icon name="chevron-left" className="h-4 w-4" /> Back to Home
                                </button>

                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Table of Contents</h3>
                                <nav>
                                    <ul className="space-y-1 border-l-2 border-slate-100">
                                        {navItems.map((item) => (
                                            <li key={item.id}>
                                                <button 
                                                    onClick={() => scrollToSection(item.id)}
                                                    className="text-sm text-left w-full py-2 pl-4 border-l-2 border-transparent -ml-[2px] hover:border-yellow-500 text-slate-500 hover:text-slate-900 transition-all"
                                                >
                                                    {item.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </aside>

                        {/* Right Content Area */}
                        <article className="flex-1 prose prose-slate max-w-none prose-headings:scroll-mt-32 prose-headings:font-bold prose-a:text-blue-600 prose-h3:text-xl prose-h3:text-slate-900">
                            
                            <h3 id="introduction">1. Introduction</h3>
                            <p>
                                Welcome to the Location Register Portal ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
                                If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, 
                                please contact us at info@locationregister.org.
                            </p>

                            <h3 id="information">2. Information We Collect</h3>
                            <p>
                                We collect personal information that you voluntarily provide to us when you register on the Service, express an interest in obtaining 
                                information about us or our products and services, when you participate in activities on the Service, or otherwise when you contact us.
                            </p>
                            
                            <div className="not-prose border border-slate-200 rounded-lg overflow-hidden my-6 shadow-sm">
                                <TableRow 
                                    label="Personal Data" 
                                    content="Names, phone numbers, email addresses, mailing addresses, job titles, usernames, passwords, contact preferences, contact or authentication data, and business names." 
                                />
                                <TableRow 
                                    label="Transaction Data" 
                                    content="Details about payments to and from you and other details of products and services you have purchased from us, including purchase history and billing addresses." 
                                />
                                <TableRow 
                                    label="Usage Data" 
                                    content="Information on how you use our website, products, and services, including IP addresses, browser types, operating systems, referring URLs, device information, and interaction logs." 
                                />
                            </div>

                            <h3 id="usage">3. How We Use Your Information</h3>
                            <p>
                                We use personal information collected via our Service for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                            </p>
                            
                            <div className="not-prose border border-slate-200 rounded-lg overflow-hidden my-6 shadow-sm">
                                <TableRow 
                                    label="Account Management" 
                                    content="To facilitate account creation and logon process, and manage user accounts." 
                                />
                                <TableRow 
                                    label="Communications" 
                                    content="To send you marketing and promotional communications. You can opt-out of our marketing emails at any time." 
                                />
                                <TableRow 
                                    label="Fulfillment" 
                                    content="To fulfill and manage your orders, payments, returns, and exchanges made through the Service." 
                                />
                                <TableRow 
                                    label="Service Improvement" 
                                    content="To request feedback and contact you about your use of our Service, and to improve our products and user experience." 
                                />
                                <TableRow 
                                    label="Security & Legal" 
                                    content="To enforce our terms, conditions, and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract." 
                                />
                            </div>

                            <h3 id="sharing">4. Sharing Your Information</h3>
                            <p>
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. 
                            </p>
                            
                            <div className="not-prose border border-slate-200 rounded-lg overflow-hidden my-6 shadow-sm">
                                <TableRow 
                                    label="Consent" 
                                    content="We may process your data if you have given us specific consent to use your personal information for a specific purpose." 
                                />
                                <TableRow 
                                    label="Legitimate Interests" 
                                    content="We may process your data when it is reasonably necessary to achieve our legitimate business interests." 
                                />
                                <TableRow 
                                    label="Performance of a Contract" 
                                    content="Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract." 
                                />
                            </div>

                            <h3 id="security">5. Data Security</h3>
                            <p>
                                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
                            </p>
                             <div className="not-prose border border-slate-200 rounded-lg overflow-hidden my-6 shadow-sm">
                                <TableRow 
                                    label="Measures" 
                                    content="Encryption at rest and in transit, access controls, secure socket layer (SSL) technology, and regular security audits." 
                                />
                                <TableRow 
                                    label="Disclaimer" 
                                    content="However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information." 
                                />
                            </div>

                            <h3 id="rights">6. Your Privacy Rights</h3>
                            <p>
                                Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete the data we hold about you.
                                To exercise these rights, please contact us.
                            </p>

                            <h3 id="contact">7. Contact Us</h3>
                            <p>
                                If you have questions or comments about this policy, you may email us at support@locationregister.org or by post to:
                            </p>
                            <div className="not-prose p-6 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="font-bold text-slate-900">Location Register Inc.</p>
                                <p className="text-slate-600">Nakasero Hill Road, Plot 14</p>
                                <p className="text-slate-600">Kampala, Uganda</p>
                            </div>
                        </article>
                    </div>
                </div>
            </main>

            <Footer 
                onAdminClick={onAdminClick} 
                onBlogClick={onNavigateHome} 
                onPrivacyClick={() => {}} 
                onTermsClick={onTermsClick}
            />
        </div>
    );
};

export default PrivacyPolicyPage;
