import React, { useState } from 'react';
import Icon, { IconName } from './Icon';
import { Partner, PricingTier } from '../types';

// Reusable Section Container
const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = "", children }) => (
    <section id={id} className={`min-h-screen flex flex-col justify-center py-20 ${className}`}>{children}</section>
);

export const Hero: React.FC<{ onLogin: (role?: string) => void }> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [selectedRole, setSelectedRole] = useState<'Super admin' | 'Country Admin' | 'Contributor'>('Super admin');
    const [email, setEmail] = useState('admin@locationregister.org');
    const [password, setPassword] = useState('admin123');

    // New multi-step signup state variables
    const [signupStep, setSignupStep] = useState<'fields' | 'otp'>('fields');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupFullName, setSignupFullName] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [mockOtp, setMockOtp] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const [otpError, setOtpError] = useState('');

    const dummyAccounts = {
        'Super admin': { email: 'admin@locationregister.org', pass: 'admin123', desc: 'Registry System Admin' },
        'Country Admin': { email: 'owner@shop.com', pass: 'owner123', desc: 'Local Merchant Registry' },
        'Contributor': { email: 'customer@mail.com', pass: 'cust123', desc: 'Verified Buyer Profile' },
    };

    const handleRoleSelect = (role: 'Super admin' | 'Country Admin' | 'Contributor') => {
        setSelectedRole(role);
        setEmail(dummyAccounts[role].email);
        setPassword(dummyAccounts[role].pass);
    };

    const handleSubmitSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(selectedRole);
    };

    return (
        <Section className="relative text-white pt-28 pb-16 overflow-hidden">
            {/* Background Image with Ambient Dark Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1524311546418-d8f8e831f13b?q=80&w=2070&auto=format&fit=crop" 
                    alt="Network Mapping Data" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-slate-950/95"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Information related strictly to the Location Register */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-yellow-400 text-sm font-medium backdrop-blur-sm">
                            🗺️ Remix Location Register Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            Integrated <br />
                            <span className="text-yellow-500">Location Register</span> <br />
                            & Boundary Map System
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                            Unlock complete oversight of regional trade zones, geographical country boundary SVG mapping, custom administrative hierarchies, and localized storefront directories. Simplify regional trading, election maps, and logistics.
                        </p>
                        
                        {/* Highlights checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="p-1 bg-yellow-500/20 rounded-full text-yellow-400">
                                    <Icon name="check-circle" className="w-5 h-5" />
                                </div>
                                <span>SVG Boundary Layouts</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="p-1 bg-yellow-500/20 rounded-full text-yellow-400">
                                    <Icon name="check-circle" className="w-5 h-5" />
                                </div>
                                <span>4-Tier Admin Levels</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="p-1 bg-yellow-500/20 rounded-full text-yellow-400">
                                    <Icon name="check-circle" className="w-5 h-5" />
                                </div>
                                <span>Shop KYC & Verification</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="p-1 bg-yellow-500/20 rounded-full text-yellow-400">
                                    <Icon name="check-circle" className="w-5 h-5" />
                                </div>
                                <span>Multi-Currency Profiles</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Unified Interactive Sign In & Sign Up Form (Ceiling of Scope) */}
                    <div className="lg:col-span-5">
                        <div id="auth-portal" className="bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-100">
                            {/* Tabs Header */}
                            <div className="flex border-b border-slate-100 mb-6">
                                <button 
                                    className={`flex-1 pb-3 text-lg font-bold border-b-2 transition-colors ${activeTab === 'signin' ? 'border-yellow-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setActiveTab('signin')}
                                >
                                    Sign In
                                </button>
                                <button 
                                    className={`flex-1 pb-3 text-lg font-bold border-b-2 transition-colors ${activeTab === 'signup' ? 'border-yellow-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setActiveTab('signup')}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {activeTab === 'signin' ? (
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">Toggle testing profiles</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(Object.keys(dummyAccounts) as Array<keyof typeof dummyAccounts>).map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => handleRoleSelect(role)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-lg border text-left transition-all ${selectedRole === role ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                                >
                                                    <span className="block">{role}</span>
                                                    <span className="block font-normal text-[10px] text-slate-400 leading-none mt-0.5">{dummyAccounts[role].desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitSignIn} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Email representation</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900"
                                                placeholder="email@register.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Passkey</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg shadow-md flex items-center justify-center gap-2"
                                        >
                                            Enter Location Register
                                            <Icon name="chevron-right" className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {signupStep === 'fields' ? (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const code = Math.floor(1000 + Math.random() * 9000).toString();
                                            setMockOtp(code);
                                            setOtpMessage(`A validation OTP was dispatched to ${signupEmail}.`);
                                            setOtpError('');
                                            setSignupStep('otp');
                                        }} className="space-y-4">
                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-800 leading-relaxed font-semibold">
                                                🔒 Enter your phone and email to receive a secure OTP to verify and process your registration.
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Email address</label>
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900" 
                                                    placeholder="john@register.com" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Phone number</label>
                                                <input 
                                                    type="tel" 
                                                    required
                                                    value={signupPhone}
                                                    onChange={(e) => setSignupPhone(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900" 
                                                    placeholder="+256 700 000000" 
                                                />
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all hover:shadow-lg shadow-md flex items-center justify-center gap-2 text-sm"
                                            >
                                                <span>Send Verification OTP</span>
                                                <Icon name="chevron-right" className="w-5 h-5 animate-pulse" />
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (enteredOtp !== mockOtp) {
                                                setOtpError(`Invalid validation key. Key matches: ${mockOtp}`);
                                                return;
                                            }
                                            // Redirect to access platform as default profile
                                            onLogin('Contributor');
                                        }} className="space-y-4">
                                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                                                <p className="font-semibold">✨ {otpMessage}</p>
                                                <p className="opacity-95">Demo authentication key is: <strong className="font-mono text-sm sm:text-base tracking-widest text-emerald-900 select-all bg-emerald-100 px-2 py-0.5 rounded">{mockOtp}</strong></p>
                                            </div>

                                            {otpError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                                                    ⚠️ {otpError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Enter OTP code</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    maxLength={4}
                                                    value={enteredOtp}
                                                    onChange={(e) => {
                                                        setEnteredOtp(e.target.value.replace(/\D/g, ''));
                                                        setOtpError('');
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-mono tracking-widest text-center text-slate-900 bg-slate-50 focus:bg-white" 
                                                    placeholder="xxxx" 
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Your name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={signupFullName}
                                                    onChange={(e) => setSignupFullName(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900" 
                                                    placeholder="John Doe" 
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Set password</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm bg-white text-slate-900" 
                                                    placeholder="Change or create password" 
                                                />
                                            </div>

                                            <div className="flex gap-2.5 pt-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setSignupStep('fields');
                                                        setEnteredOtp('');
                                                        setOtpError('');
                                                    }}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm text-center border border-slate-200"
                                                >
                                                    Back
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="flex-[2] bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all hover:shadow-lg shadow-md text-sm"
                                                >
                                                    Access Register
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export const About: React.FC = () => (
    <Section id="about" className="bg-white">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">About the Location Registry</h2>
                    <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                        Transitioning informal trade into standardized georesolvable storefront assets. Our comprehensive registry connects boundary coordinates directly with real-world administrative overlays, enabling complete accountability.
                    </p>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        Every localized country registry maps historical boundary files, allows calculation of detailed bounding boxes, handles custom currency exchanges, and logs retail shop footprints across multiple sub-levels.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-3xl font-bold text-yellow-500 mb-1">11+ Countries</h4>
                            <p className="text-slate-600 font-medium">Mapped Borders</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold text-yellow-500 mb-1">4 Tiers</h4>
                            <p className="text-slate-600 font-medium">Hierarchy Levels</p>
                        </div>
                    </div>
                </div>
                <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden shadow-xl">
                    <img 
                        src="https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=2073&auto=format&fit=crop" 
                        alt="Satellite Map Visualization" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="font-bold text-lg">Absolute Accuracy</p>
                        <p className="text-sm opacity-80">Syncing locations natively since day one</p>
                    </div>
                </div>
            </div>
        </div>
    </Section>
);

export const Features: React.FC = () => {
    const modules = [
        { icon: 'map', title: 'Boundary Path Registry', desc: 'Pre-loaded geographic SVG layouts for major nations including Angola, botswana, Cameroon, South Africa, and more.' },
        { icon: 'countries', title: 'Dynamic Multi-level Hierarchy', desc: 'Map administrative boundaries into customized tiers matching legislative or trade regions.' },
        { icon: 'shield-check', title: 'Auditable Agent Registers', desc: 'Strict verification of field surveyors, registration photo proofs, and digital fingerprints.' },
        { icon: 'currencies', title: 'Currency & Economic Profiles', desc: 'Maintain custom currency lookups, set default local subscription limits, and monitor exchange rates.' },
        { icon: 'shop-mgt', title: 'Shop Localization Logs', desc: 'Manage specific merchant shops tied to geographic coordinates, keeping records cleanly organized.' },
        { icon: 'analytics', title: 'Unified Registry Reports', desc: 'View granular statistics, export reports to CSV or print directly with standard printable areas.' }
    ];
    return (
        <Section id="features" className="bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Register Modules</h2>
                    <p className="text-slate-600 text-lg">A robust spatial data directory designed to support regional trade integration programs.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((m, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-yellow-100 transition-all duration-350 group">
                            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                                <Icon name={m.icon as IconName} className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{m.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export const BenefitsSMB: React.FC = () => (
    <Section className="bg-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">4-Tier Governance & Localization</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "National Definition", desc: "Define official borders, code representations, local flag emojis, and legal tender profiles for sovereign nations.", icon: "globe" },
                    { title: "Administrative Levels", desc: "Easily configure structural hierarchical rows (provinces, districts, municipalities, or sub-counties).", icon: "system-settings" },
                    { title: "Localized Merchants", desc: "Map active retail markets and individual points of sales down to physical building coordinates.", icon: "shop-mgt" } 
                ].map((item, i) => (
                     <div key={i} className="text-center p-8 rounded-2xl bg-slate-50 border border-slate-150">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-yellow-500">
                            <Icon name={item.icon as any || 'check-circle'} className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </Section>
);

export const BenefitsManufacturer: React.FC<{ onOpenSignup: () => void }> = ({ onOpenSignup }) => (
    <Section className="bg-slate-950 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-900/40 skew-x-12 translate-x-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Regional Economic & Trade Blocks</h2>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        The Location Register acts as the operational database schema representing cross-border trade relationships in active free trade areas, providing:
                    </p>
                    <ul className="space-y-4 mb-10">
                        {[
                            "Integration with COMESA, EAC, & SADC standards",
                            "Universal currency conversion lookups for East Africa",
                            "Automated calculation of boundary bounding-boxes",
                            "Standardized role access controls for trade officers"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-200">
                                <div className="bg-yellow-500/20 p-1 rounded-full text-yellow-400">
                                    <Icon name="check-circle" className="w-5 h-5" />
                                </div>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <a href="#auth-portal" className="inline-block bg-white text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                        Add Your Node Now
                    </a>
                </div>
                <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
                    <img 
                        src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop" 
                        alt="Logistics Distribution Point" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                             <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400">
                                <Icon name="analytics" className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-slate-400 uppercase font-semibold tracking-wider">Geographic Overlays</p>
                                 <p className="text-white font-bold">100% Audited Locations</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Section>
);

export const Partners: React.FC<{ partners: Partner[] }> = ({ partners }) => (
    <Section id="partners" className="bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Regional Authorities & Councils</h2>
            <p className="text-slate-600 mb-12">Authorized agencies contributing to coordinate definitions and boundary files.</p>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-stretch">
                {partners.map((p) => (
                    <div key={p.name} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 w-72 flex flex-col items-center transition-transform hover:-translate-y-1 duration-300">
                        <div className="h-16 flex items-center justify-center mb-4 w-full">
                            <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{p.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed text-center">{p.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </Section>
);

const CostingAnswer: React.FC<{ pricingTiers: PricingTier[] }> = ({ pricingTiers }) => {
    const [selectedCountry, setSelectedCountry] = useState(pricingTiers[0].country);
    
    const currentTier = pricingTiers.find(t => t.country === selectedCountry) || pricingTiers[0];

    return (
        <div className="space-y-4 mt-2">
            <p className="text-slate-600">The country registration index rates vary by region to match licensing parameters. Choose below:</p>
            <div className="flex flex-col sm:flex-row-reverse justify-between gap-16 items-start sm:items-center bg-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country Index</label>
                    <select 
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none bg-white text-slate-900"
                    >
                        {pricingTiers.map(tier => (
                            <option key={tier.country} value={tier.country}>
                                {tier.flag} {tier.country}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-16 flex-wrap">
                     <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Index Setup Fee</p>
                        <p className="font-bold text-lg text-slate-900 whitespace-nowrap">
                            {currentTier.currency} {currentTier.registration.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ one-time</span>
                        </p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Monthly Maintenance</p>
                        <p className="font-bold text-lg text-slate-900 whitespace-nowrap">
                            {currentTier.currency} {currentTier.subscription.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ mo</span>
                        </p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const FAQ: React.FC<{ pricingTiers: PricingTier[] }> = ({ pricingTiers }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            q: "How are the index costs structured?",
            content: <CostingAnswer pricingTiers={pricingTiers} />
        },
        { q: "What is the purpose of the Location Register?", content: "It is an interactive geographic system designed to record, categorize, and map business storefront points alongside national boundary lines, electoral blocks, and state subdivisions." },
        { q: "Can I manage coordinates offline?", content: "Yes! The location forms collect geographic coordinates and sync with our Firebase database when network connectivity is re-established." },
        { q: "How do I configure new administrative levels?", content: "By navigating to the Admin settings inside the dashboard, you can define specific organizational tiers (such as regional sub-counties, polling stations, or trade segments)." },
        { q: "Are the geographic bounding boxes calculated dynamically?", content: "Yes! The register includes automated node calculations to scale and frame SVGs such as South Africa, Angola, or Zimbabwe perfectly in the map components." }
    ];

    return (
        <Section id="pricing" className="bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Registry Frequently Asked Questions</h2>
                    <p className="text-slate-600 text-lg">Understanding spatial directories, boundary models, and multi-state coalitions.</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${openIndex === i ? 'border-yellow-500 bg-yellow-50/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`text-lg font-bold ${openIndex === i ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {faq.q}
                                </span>
                                <span className={`ml-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${openIndex === i ? 'bg-yellow-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon name="chevron-down" className={`w-5 h-5 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                                </span>
                            </button>
                            
                            <div 
                                className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === i ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="text-slate-600 leading-relaxed">
                                    {faq.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export const FeedbackForm: React.FC = () => (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
            <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white text-slate-900 placeholder-slate-400" placeholder="Full Name" />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Official Email</label>
            <input type="email" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white text-slate-900 placeholder-slate-400" placeholder="your@organization.gov" />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Registry Inquiry Details</label>
            <textarea rows={6} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none bg-white text-slate-900 placeholder-slate-400" placeholder="Tell us about your boundary or regional trade integration needs..."></textarea>
        </div>
        <button className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-[0.98]">
            Submit Registry Request
        </button>
    </form>
);

export const SignupModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl transform scale-100 transition-transform max-h-[95vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon name="x-mark" className="w-5 h-5" />
                </button>
                
                <div className="text-center mb-4">
                    <div className="w-10 h-10 bg-yellow-105 rounded-xl flex items-center justify-center mx-auto mb-3 text-yellow-600">
                        <Icon name="user-circle" className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Custom Registry Sign-Up</h2>
                    <p className="text-slate-500 mt-1 text-sm">Join the Location Register portal</p>
                </div>

                <a href="#auth-portal" onClick={onClose} className="block text-center w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all">
                    Go to Inline Registry Form
                </a>
            </div>
        </div>
    );
};

export const Chatbot: React.FC = () => (
    <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-110 group relative">
            <Icon name="chat-bubble" className="w-6 h-6" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ask Registry Copilot
            </span>
        </button>
    </div>
);

export const Footer: React.FC<{ onAdminClick: () => void; onBlogClick?: () => void; onPrivacyClick?: () => void; onTermsClick?: () => void }> = ({ onAdminClick, onBlogClick, onPrivacyClick, onTermsClick }) => (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-950 text-lg">L</div>
                        Location Register
                    </div>
                    <p className="text-sm leading-relaxed mb-6 bg-transparent">
                        Simplifying boundary modeling and administrative localizations for retailers, regional trade councils, and governance offices.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><Icon name="twitter" className="w-5 h-5"/></a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><Icon name="linkedin" className="w-5 h-5"/></a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><Icon name="github" className="w-5 h-5"/></a>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-white font-bold mb-6">Directory</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#about" className="hover:text-yellow-400 transition-colors">Overview</a></li>
                        <li><a href="#features" className="hover:text-yellow-400 transition-colors">Key Modules</a></li>
                        <li><button onClick={onBlogClick} className="hover:text-yellow-400 transition-colors text-left">Registry Blog</button></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-white font-bold mb-6">Trade Maps</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#auth-portal" className="hover:text-yellow-400 transition-colors">National Listing</a></li>
                        <li><a href="#auth-portal" className="hover:text-yellow-400 transition-colors">Administrative Tiers</a></li>
                        <li><a href="#auth-portal" className="hover:text-yellow-400 transition-colors">Electoral Polling</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-white font-bold mb-6">Compliances</h4>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={onPrivacyClick} className="hover:text-yellow-400 transition-colors text-left">Privacy Agreement</button></li>
                        <li><button onClick={onTermsClick} className="hover:text-yellow-400 transition-colors text-left">Terms of Registry</button></li>
                        <li><button onClick={onAdminClick} className="hover:text-yellow-400 transition-colors text-left">System Access</button></li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                <p>&copy; {new Date().getFullYear()} Location Register. All rights reserved.</p>
                <p>Designed for Trade Integration 🌍</p>
            </div>
        </div>
    </footer>
);
