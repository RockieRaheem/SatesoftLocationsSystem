
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { Theme, ActiveView, User, IDVerificationRequest, Role, ShopUser, Shop, Country, Notification, CameraDevice, CallRecord, DeletedCallRecord, Partner, PricingTier, ProductDefinition, StockItem, RegionalEconomicLevel } from '../types';
import { mockVerificationRequests, mockShopRoles, mockSuperUserRoles, mockShopUsers as initialMockShopUsers, allAfricanCountries, mockShops as initialMockShops, mockNotifications as initialMockNotifications, mockCameraDevices, mockCallRecords, mockProductDefinitions, mockStockListings, mockRegionalEconomicLevels } from '../data';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { 
  subscribeToProducts, 
  saveProduct, 
  subscribeToStockItems, 
  saveStockItem, 
  subscribeToRegionalLevels, 
  saveRegionalLevel as firebaseSaveRegionalLevel,
  deleteRegionalLevel as firebaseDeleteRegionalLevel,
  saveUserProfile
} from '../firebaseService';
import { countryService } from '../src/services/countryService';
import FirebaseErrorBoundary from './FirebaseErrorBoundary';
import Icon from './Icon';

interface AdminDashboardProps {
  partners: Partner[];
  onAddPartner: (partner: Partner) => void;
  onUpdatePartner: (index: number, partner: Partner) => void;
  onRemovePartner: (index: number) => void;
  pricingTiers: PricingTier[];
  onUpdatePricing: (tiers: PricingTier[]) => void;
  onLogout: () => void;
  userRole?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userRole = 'Administrator' }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Set initial view based on role
  const [activeView, setActiveView] = useState<ActiveView>(userRole === 'Customer' ? 'dashboard-customer' : 'dashboard');
  const [language, setLanguage] = useState('en');
  
  // Initialize sidebar state based on screen width
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 768);
  
  // Settings State
  const [allowCalls, setAllowCalls] = useState(true);
  const [allowMicrophone, setAllowMicrophone] = useState(true);

  const [verificationRequests, setVerificationRequests] = useState<IDVerificationRequest[]>(mockVerificationRequests);
  const [shopRoles, setShopRoles] = useState<Role[]>(mockShopRoles);
  const [superUserRoles, setSuperUserRoles] = useState<Role[]>(mockSuperUserRoles);
  const [shopUsers, setShopUsers] = useState<ShopUser[]>(initialMockShopUsers);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [shops, setShops] = useState<Shop[]>(initialMockShops);
  const [notifications, setNotifications] = useState<Notification[]>(initialMockNotifications);
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>(mockCameraDevices);
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);

  // Product and Stock State
  const [products, setProductsState] = useState<ProductDefinition[]>([]);
  const [stockItems, setStockItemsState] = useState<StockItem[]>([]);
  const [regionalLevels, setRegionalLevelsState] = useState<RegionalEconomicLevel[]>([]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (user) {
        const isOwner = user.email === 'jabuyapm@gmail.com';
        const userProfile: User = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: isOwner ? 'admin' : 'user',
          bio: isOwner ? 'System Administrator' : '',
          avatar: user.photoURL || null
        };
        saveUserProfile(userProfile as any);
        
        setUser(userProfile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Data Listeners
  useEffect(() => {
    if (!isAuthReady || (!firebaseUser && !isGuest)) return;

    const unsubProducts = subscribeToProducts((data) => {
      if (data.length > 0) {
        setProductsState(data);
      } else {
        // If DB is empty, seed with mock data (optional, but good for demo)
        mockProductDefinitions.forEach(p => saveProduct(p));
      }
    });

    const unsubStock = subscribeToStockItems((data) => {
      if (data.length > 0) {
        setStockItemsState(data);
      } else {
        // Seed with mock data if empty
        mockStockListings.forEach(s => saveStockItem(s));
      }
    });

    const unsubRegional = subscribeToRegionalLevels((data) => {
      if (data.length > 0) {
        setRegionalLevelsState(data);
      } else if (firebaseUser) {
        // Seed with mock data if empty and user is authenticated
        mockRegionalEconomicLevels.forEach(r => firebaseSaveRegionalLevel(r));
      }
    });

    return () => {
      unsubProducts();
      unsubStock();
      unsubRegional();
    };
  }, [isAuthReady, firebaseUser, isGuest]);

  // Country Management via API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAllCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to fetch countries", error);
        // Fallback to mock data if API fails
        setCountries(allAfricanCountries);
      }
    };
    fetchCountries();
  }, []);

  const handleSaveRegionalLevel = async (level: RegionalEconomicLevel) => {
    try {
      const oldLevel = regionalLevels.find(l => l.id === level.id);
      await firebaseSaveRegionalLevel(level);
      
      // Update countries' economicZones
      // 1. Countries added to this region
      const addedCountries = level.countries.filter(cName => !oldLevel?.countries.includes(cName));
      for (const cName of addedCountries) {
        const country = countries.find(c => c.name === cName);
        if (country && !country.economicZones.includes(level.abbreviation)) {
          await countryService.updateCountry(country.id, { ...country, economicZones: [...country.economicZones, level.abbreviation] });
        }
      }
      
      // 2. Countries removed from this region
      const removedCountries = oldLevel?.countries.filter(cName => !level.countries.includes(cName)) || [];
      for (const cName of removedCountries) {
        const country = countries.find(c => c.name === cName);
        if (country && country.economicZones.includes(level.abbreviation)) {
          const updatedZones = country.economicZones.filter(z => z !== level.abbreviation);
          await countryService.updateCountry(country.id, { ...country, economicZones: updatedZones });
        }
      }
    } catch (error) {
      console.error("Failed to save regional level", error);
    }
  };

  const handleDeleteRegionalLevel = async (id: number, remarks?: string) => {
    try {
      const levelToDelete = regionalLevels.find(l => l.id === id);
      if (!levelToDelete) return;

      await firebaseDeleteRegionalLevel(id, remarks);
      
      // Unmap countries from this region
      const countriesToUpdate = countries.filter(c => c.economicZones.includes(levelToDelete.abbreviation));
      for (const country of countriesToUpdate) {
        const updatedZones = country.economicZones.filter(z => z !== levelToDelete.abbreviation);
        await countryService.updateCountry(country.id, { ...country, economicZones: updatedZones });
      }
    } catch (error) {
      console.error("Failed to delete regional level", error);
    }
  };

  const handleAddCountry = async (newCountry: Omit<Country, 'id'>) => {
    try {
      const saved = await countryService.createCountry(newCountry);
      setCountries(prev => [saved, ...prev]);
    } catch (error) {
      console.error("Failed to add country", error);
    }
  };

  const handleUpdateCountry = async (updatedCountry: Country) => {
    try {
      const saved = await countryService.updateCountry(updatedCountry.id, updatedCountry);
      setCountries(prev => prev.map(c => c.id === saved.id ? saved : c));
    } catch (error) {
      console.error("Failed to update country", error);
    }
  };

  const handleDeleteCountry = async (id: number) => {
    try {
      await countryService.deleteCountry(id);
      setCountries(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete country", error);
    }
  };

  // Wrappers for persistence
  const setProducts: React.Dispatch<React.SetStateAction<ProductDefinition[]>> = (value) => {
    if (typeof value === 'function') {
      const next = value(products);
      // Find what changed and save to Firebase
      // For simplicity in this demo, we'll just save the whole list or the new item
      // In a real app, you'd have specific add/update/delete functions
      next.forEach(p => saveProduct(p));
      setProductsState(next);
    } else {
      value.forEach(p => saveProduct(p));
      setProductsState(value);
    }
  };

  const setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>> = (value) => {
    if (typeof value === 'function') {
      const next = value(stockItems);
      next.forEach(s => saveStockItem(s));
      setStockItemsState(next);
    } else {
      value.forEach(s => saveStockItem(s));
      setStockItemsState(value);
    }
  };

  // Call Management State
  const [callRecords, setCallRecords] = useState<CallRecord[]>(mockCallRecords);
  const [deletedCallRecords, setDeletedCallRecords] = useState<DeletedCallRecord[]>([]);

  const addCallRecord = (record: Omit<CallRecord, 'id'>) => {
      const newId = `call-${Date.now()}`;
      setCallRecords(prev => [{ ...record, id: newId }, ...prev]);
  };

  const handleDeleteCall = (callId: string, reason: string, deletedBy: string) => {
      const call = callRecords.find(c => c.id === callId);
      if (call) {
          setCallRecords(prev => prev.filter(c => c.id !== callId));
          setDeletedCallRecords(prev => [...prev, { ...call, deletedAt: new Date().toISOString(), deletedBy, deletionReason: reason }]);
      }
  };

  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: userRole === 'Customer' ? 'Contributor Account' : 'Paul Mboya',
    email: userRole === 'Customer' ? 'contributor@mail.com' : 'paul.mboya@locationregister.org',
    role: userRole,
    bio: 'Senior stock manager with over 10 years of experience in agro-inputs and pharmaceutical supply chains.',
    avatar: null,
    gender: 'Male',
    dateOfBirth: '1985-06-15',
    idType: 'National ID',
    idNumber: 'CM850615234P',
    idDocument: { front: null, back: null },
    selfie: null,
    phonePrimary: '+256 772 123 456',
    phoneSecondary: '',
    phoneWhatsapp: '+256 772 123 456',
    socialTwitter: 'https://twitter.com/pmboya',
    socialLinkedIn: '',
    socialGitHub: 'https://github.com/pmboya',
    temperamentHistory: [
        {
            id: 'th-1',
            date: new Date().toISOString(),
            dominant: 'Choleric',
            secondary: 'Melancholic',
            breakdown: { 'Choleric': 12, 'Melancholic': 10, 'Sanguine': 5, 'Phlegmatic': 3 },
            weaknessBreakdown: { 'Choleric': 3, 'Melancholic': 2, 'Sanguine': 1, 'Phlegmatic': 0 },
            strengthBreakdown: { 'Choleric': 9, 'Melancholic': 8, 'Sanguine': 4, 'Phlegmatic': 3 }
        },
        {
            id: 'th-2',
            date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
            dominant: 'Choleric',
            secondary: 'Sanguine',
            breakdown: { 'Choleric': 10, 'Sanguine': 8, 'Melancholic': 6, 'Phlegmatic': 4 },
            weaknessBreakdown: { 'Choleric': 5, 'Sanguine': 4, 'Melancholic': 2, 'Phlegmatic': 1 },
            strengthBreakdown: { 'Choleric': 5, 'Sanguine': 4, 'Melancholic': 4, 'Phlegmatic': 3 }
        },
        {
             id: 'th-3',
             date: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
             dominant: 'Sanguine',
             secondary: 'Choleric',
             breakdown: { 'Sanguine': 11, 'Choleric': 9, 'Phlegmatic': 5, 'Melancholic': 3 },
             weaknessBreakdown: { 'Sanguine': 6, 'Choleric': 4, 'Phlegmatic': 3, 'Melancholic': 2 },
             strengthBreakdown: { 'Sanguine': 5, 'Choleric': 5, 'Phlegmatic': 2, 'Melancholic': 1 }
         }
    ]
  });

  // Update user object when role changes from props
  useEffect(() => {
      setUser(prev => ({ ...prev, role: userRole ?? prev.role, name: userRole === 'Customer' ? 'Contributor' : prev.name }));
      if (userRole === 'Customer') {
          setActiveView('dashboard-customer');
      } else if (activeView === 'dashboard-customer') {
          setActiveView('dashboard');
      }
  }, [userRole]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Handle resize events to auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setIsSidebarCollapsed(true);
        } else {
            setIsSidebarCollapsed(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Don't show error if user just closed the popup or if another one is pending
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed", error);
        setLoginError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
      setIsGuest(false);
      onLogout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!firebaseUser && !isGuest) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
              <span className="text-4xl font-black text-slate-900">L</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Location Register Dashboard</h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Integrated Location Register & Map System</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full py-4 bg-white text-slate-900 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 border border-slate-200 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
              )}
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-sm">or</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button
              onClick={() => setIsGuest(true)}
              className={`w-full py-4 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} text-current font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-3`}
            >
              <Icon name="user" className="w-5 h-5" />
              <span>Continue as Guest</span>
            </button>
          </div>
          
          {loginError && (
            <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
              {loginError}
            </div>
          )}
          <p className="text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseErrorBoundary theme={theme}>
      <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} h-screen font-sans antialiased flex overflow-hidden`}>
          
          {/* Mobile Sidebar Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${!isSidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarCollapsed(true)}
          ></div>

          <Sidebar 
            theme={theme} 
            toggleTheme={toggleTheme}
            activeView={activeView}
            onNavigate={handleNavigate}
            isCollapsed={isSidebarCollapsed}
            allowCalls={allowCalls}
            onLogout={handleLogout}
            userRole={userRole}
          />
          
          <main className={`flex-1 flex flex-col h-full ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'} overflow-hidden relative transition-all duration-300 w-full`}>
            <MainContent 
              theme={theme} 
              activeView={activeView}
              user={user}
              setUser={setUser}
              onNavigate={handleNavigate}
              language={language}
              setLanguage={setLanguage}
              verificationRequests={verificationRequests}
              setVerificationRequests={setVerificationRequests}
              shopRoles={shopRoles}
              setShopRoles={setShopRoles}
              superUserRoles={superUserRoles}
              setSuperUserRoles={setSuperUserRoles}
              shopUsers={shopUsers}
              setShopUsers={setShopUsers}
              currentUser={user}
              selectedShop={selectedShop}
              setSelectedShop={setSelectedShop}
              onToggleSidebar={toggleSidebar}
              countries={countries}
              regionalLevels={regionalLevels}
              onSaveRegionalLevel={handleSaveRegionalLevel}
              onDeleteRegionalLevel={handleDeleteRegionalLevel}
              onAddCountry={handleAddCountry}
              onUpdateCountry={handleUpdateCountry}
              onDeleteCountry={handleDeleteCountry}
              shops={shops}
              setShops={setShops}
              notifications={notifications}
              setNotifications={setNotifications}
              cameraDevices={cameraDevices}
              setCameraDevices={setCameraDevices}
              trackedKeywords={trackedKeywords}
              setTrackedKeywords={setTrackedKeywords}
              callRecords={callRecords}
              deletedCallRecords={deletedCallRecords}
              onDeleteCall={handleDeleteCall}
              addCallRecord={addCallRecord}
              allowCalls={allowCalls}
              setAllowCalls={setAllowCalls}
              allowMicrophone={allowMicrophone}
              setAllowMicrophone={setAllowMicrophone}
              products={products}
              setProducts={setProducts}
              stockItems={stockItems}
              setStockItems={setStockItems}
              onLogout={handleLogout}
            />
          </main>
      </div>
    </FirebaseErrorBoundary>
  );
};

export default AdminDashboard;
