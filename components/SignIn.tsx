
import React, { useState, useEffect } from 'react';
import Icon, { IconName } from './Icon';

interface SignInProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (role?: string) => void;
}

type UserRole = 'Super admin' | 'Country Admin' | 'Manufacturer' | 'Financial Institution' | 'Contributor';

const dummyAccounts: Record<UserRole, { email: string; pass: string; icon: IconName; description: string }> = {
    'Super admin': { email: 'admin@locationregister.org', pass: 'admin123', icon: 'shield-check', description: 'System Administration' },
    'Country Admin': { email: 'owner@shop.com', pass: 'owner123', icon: 'shop-mgt', description: 'Manage Country Shops' },
    'Manufacturer': { email: 'mfg@factory.com', pass: 'mfg123', icon: 'product-chain', description: 'Supply Chain & Production' },
    'Financial Institution': { email: 'bank@finance.com', pass: 'bank123', icon: 'finances', description: 'Loans & Credit Scoring' },
    'Contributor': { email: 'customer@mail.com', pass: 'cust123', icon: 'cart', description: 'Index Contributions' },
};

const SignIn: React.FC<SignInProps> = ({ isOpen, onClose, onLogin }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setSelectedRole(null); // Reset on open
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setEmail(dummyAccounts[role].email);
        setPassword(dummyAccounts[role].pass);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            onLogin(selectedRole || 'Super admin');
            handleClose();
        } else {
            alert("Please enter email and password");
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300 ${isOpen && !isClosing ? 'opacity-100' : 'opacity-0'}`}>
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full transition-all duration-300 transform ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} overflow-hidden relative ${!selectedRole ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
                    <Icon name="x-mark" className="w-6 h-6" />
                </button>

                {!selectedRole ? (
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                                <span className="text-slate-900 font-bold text-2xl">D</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                            <p className="text-slate-600 mt-2">Select your account type to continue</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(Object.keys(dummyAccounts) as UserRole[]).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSelect(role)}
                                    className="flex flex-col items-center text-center p-5 rounded-xl border border-slate-200 hover:border-yellow-500 hover:shadow-md hover:bg-yellow-50/30 transition-all duration-200 group h-full"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-yellow-100 flex items-center justify-center mb-3 transition-colors text-slate-500 group-hover:text-yellow-600">
                                        <Icon name={dummyAccounts[role].icon} className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-1">{role}</h3>
                                    <p className="text-xs text-slate-500 leading-tight">{dummyAccounts[role].description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 animate-fade-in">
                         <div className="text-center mb-4">
                             <button 
                                onClick={() => setSelectedRole(null)}
                                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center text-sm font-medium"
                             >
                                 <Icon name="chevron-left" className="w-4 h-4 mr-1" /> Back
                             </button>

                            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Icon name={dummyAccounts[selectedRole].icon} className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{selectedRole} Login</h2>
                            <p className="text-slate-500 mt-1 text-sm">Enter credentials to access dashboard</p>
                        </div>
                        
                        {/* Social Sign In - Horizontal Row */}
                        <div className="flex gap-3 mb-4">
                            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium bg-white text-sm">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium bg-white text-sm">
                                 <Icon name="linkedin" className="w-5 h-5 text-[#0077b5]" />
                                LinkedIn
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-white text-slate-400 font-semibold tracking-wider">Or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white text-slate-900 placeholder-slate-400 text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white text-slate-900 placeholder-slate-400 text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox" className="w-4 h-4 text-yellow-500 border-slate-300 rounded focus:ring-yellow-500" />
                                    <span className="ml-2 text-sm text-slate-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-medium text-yellow-600 hover:text-yellow-700">Forgot password?</a>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-500 text-slate-900 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all hover:shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98]"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignIn;
