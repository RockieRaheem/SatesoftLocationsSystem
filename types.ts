

export interface Purchase {
  id: number;
  bulkEntrySerial: string;
  entriesMade: number;
  amount: string;
  currency?: string;
  shop: string;
  actionBy: string;
  dateOfEntry: string;
  dateOfPurchase: string;
  invoiceNumber: string;
  products: SelectedProduct[];
  reconciled?: boolean;
  isReconciliation?: boolean;
  reconciliationComment?: string;
}

export interface CustomerPurchase {
    id: string;
    shopName: string;
    date: string;
    itemsSummary: string;
    totalAmount: number;
    currency: string;
    status: 'Completed' | 'Pending' | 'Cancelled';
}

export const Unit = {
  PIECE: 'Piece',
  BOX: 'Box',
  PACK: 'Pack',
  BOTTLE: 'Bottle',
  CARTON: 'Carton',
  DOZEN: 'Dozen',
  KG: 'Kg',
  UNIT: 'Unit',
  LITRE: 'Litre',
  PAIR: 'Pair',
  GRAM: 'Gram',
  MILLILITER: 'Milliliter'
} as const;

export type Unit = typeof Unit[keyof typeof Unit];

export interface UserPrice {
  userId: string;
  recommendedPrice: number;
  lowestPrice: number;
}

export interface UnitPricing {
  unit: Unit;
  quantityInUnit: number;
  defaultPrice: number;
  recommendedPrice: number;
  lowestPrice: number;
  useDefaultPriceForAll: boolean;
  userPrices: UserPrice[];
  isDefaultSellingUnit?: boolean;
}

export interface ProductFormData {
  locationType: string;
  shop: string;
  product: string;
  customName: string;
  quantity: number;
  lowStockAlert: number;
  vatType: string;
  vatPercentage: number;
  defaultUnit: Unit;
  reportUnit: Unit;
  availableUnits: Unit[];
  unitPricings: UnitPricing[];
  allowMix: boolean;
  remarks: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    category?: string;
    defaultUnit: Unit | string;
    defaultUnitPrice: number;
    hasBatchNumber?: boolean;
    hasExpiryDate?: boolean;
    quantity?: number;
    lowStockAlert?: number;
    vatPercentage?: number;
    unit?: Unit | string;
    unitPricings?: UnitPricing[];
    customName?: string;
}

export interface ProductUnitDefinition {
    unitName: string;
    quantity: number;
    barcode: string;
}

export interface ProductDefinition {
    id: number;
    sn: string;
    name: string;
    barcode: string;
    manufacturer: string;
    country?: string;
    continents?: string[];
    economicZones?: string[];
    countries?: string[];
    isGlobal?: boolean;
    createdBy: string;
    status: 'ACTIVE' | 'INACTIVE';
    category?: string;
    baseUnit?: string;
    baseQuantity?: number;
    containerUnit?: string;
    containerQuantity?: number;
    saleUnits?: string; // Keep for backward compatibility/display
    definedUnits?: ProductUnitDefinition[]; // New field for structured units
    remarks?: string;
    hasBatchNumber?: boolean;
    hasExpiryDate?: boolean;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    imageUrl?: string;
    unitPricings?: UnitPricing[];
}

export interface StockHistoryEntry {
    id: number;
    date: string;
    type: 'Purchase' | 'Sale' | 'Reconciliation' | 'Initial';
    quantityChange: number;
    newQuantity: number;
    unit: string;
    performedBy: string;
    remarks?: string;
}

export interface StockItem {
    id: number;
    productName: string;
    productSN: string;
    customName: string;
    barcode: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    currency: string;
    listedBy: string;
    listedOn: string;
    shopName: string;
    shopId: number;
    manufacturer: string;
    baseUnit: string;
    hasMultipleSaleUnits: boolean;
    // New fields
    vatType?: 'None' | 'Standard' | 'Zero Rated' | 'Exempt';
    vatPercentage?: number;
    purchasingUnit?: string;
    reportUnit?: string;
    containerPortion?: string;
    allowMix?: boolean;
    mixedProductIds?: number[];
    remarks?: string;
    reorderPoint?: number;
    supplier?: string;
    unitPricings?: UnitPricing[];
}

export interface ReconciliationDetails {
    physicalCount: number;
    difference: number;
    remarks: string;
    reconciledOn: string;
}

export interface SelectedProduct extends Product {
    unit: Unit | string;
    quantity: number;
    unitPrice: number;
    batchNumber?: string;
    expirationDate?: string;
    remarks?: string;
    reconciliation?: ReconciliationDetails;
}

export interface AdminLevel {
  id: number;
  name: string;
  level: number; // e.g., 1 for Province/Region, 2 for District, 3 for County
  countryCode: string;
  parentAdminLevelId?: number;
}

export interface AdminLevelName {
  level: number;
  name: string;
}

export interface CurrencyDenominator {
  id: number;
  value: number;
  label: string;
  type: 'Note' | 'Coin';
  status: 'Active' | 'Inactive';
}

export interface ElectoralLevelName {
  level: number;
  name: string;
}

export interface LoyaltyProgram {
    enabled: boolean;
    earningThreshold: number; // Amount spent to earn 1 point
    redemptionValue: number; // Value of 1 point in currency
}

export interface RoundingRule {
  considerFigures: number; // Figures after decimal point to consider
  roundTo: number; // Value to round to
}

export interface RoundingConfig {
  condition: 'Round Up' | 'Round Down' | 'Nearest';
  upRules?: RoundingRule[];
  downRules?: RoundingRule[];
}

export interface Country {
  id: number;
  name: string;
  continent: string;
  economicZones: string[];
  currency: string;
  currencySymbol: string;
  currencyCode: string;
  countryCode: string;
  phoneCode: string;
  vat: number;
  numberOfAdminLevels?: number;
  numberOfElectoralLevels?: number;
  numberOfEconomicLevels?: number;
  adminLevels: AdminLevel[];
  currencyDenominators?: CurrencyDenominator[];
  adminLevelNames?: AdminLevelName[];
  electoralLevelNames?: ElectoralLevelName[]; // New field
  smsLocalRate?: number; // Cost in credits per local SMS
  loyaltyProgram?: LoyaltyProgram; // Loyalty configuration
  decimalPlaces?: number; // Number of decimal places for the currency
  roundingConfig?: RoundingConfig; // Roundup/rounddown configuration
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string; // ISO date string
}

export interface LoyaltyTransaction {
    id: string;
    date: string;
    type: 'Earned' | 'Redeemed';
    points: number;
    shopName: string;
    description: string;
    purchaseId?: string;
    items?: { name: string, quantity: number, price: number, points?: number }[];
}

export interface LoyaltyTransfer {
    id: string;
    date: string;
    fromClientId: number;
    fromClientName: string;
    toClientId: number;
    toClientName: string;
    points: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedBy: string;
    remarks?: string;
}

export type Theme = 'dark' | 'light';

export interface RegionalEconomicLevel {
  id: number;
  name: string;
  abbreviation: string;
  flag: string;
  description: string;
  countries: string[]; // List of country names
  color: string;
}

export type ActiveView = 'dashboard' | 'dashboard-users' | 'dashboard-system' | 'dashboard-traffic' | 'dashboard-products' | 'dashboard-customer' | 'customer-make-order' | 'customer-purchases' | 'customer-loyalty' | 'profile' | 'settings' | 'settings-cameras' | 'settings-api' | 'settings-calls' | 'id-verification' | 'stock-listing' | 'inventory' | 'countries' | 'country-profile' | 'countries-map' | 'country-electoral-levels' | 'regional-economic-levels' | 'shop-users' | 'super-users' | 'permissions' | 'stock-purchase' | 'roles' | 'shops' | 'shop-profile' | 'shop-surveillance' | 'wallet-settings' | 'leads' | 'finances-income-statement' | 'finances-balance-sheet' | 'finances-cash-flow' | 'income-statement-detail' | 'balance-sheet-detail' | 'cash-flow-detail' | 'country-admin-levels' | 'reports-messages' | 'reports-calls' | 'reports-daily-sales' | 'reports-stock-level' | 'reports-product-profile' | 'reports-packet-tracer' | 'reports-packet-tracer-live' | 'reports-packet-tracer-config' | 'client-list' | 'client-wallets' | 'client-loyalty' | 'admin-loyalty-mgt' | 'system-message-settings' | 'product-chain-products' | 'product-chain-manufacturers' | 'product-chain-distributors' | 'product-chain-suppliers' | 'sales-desk' | 'mobi-agent-settings' | 'mno-wallet-settings' | 'mno-wallet-transactions' | 'exchange-rate' | 'lookup-values';

export type TemperamentType = 'Choleric' | 'Sanguine' | 'Melancholic' | 'Phlegmatic';

export interface TemperamentResult {
    id: string;
    date: string;
    dominant: TemperamentType;
    secondary: TemperamentType;
    breakdown: Record<TemperamentType, number>;
    weaknessBreakdown?: Record<TemperamentType, number>;
    strengthBreakdown?: Record<TemperamentType, number>;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string | null;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string;
  idType?: string;
  idNumber?: string;
  idDocument?: {
    front: string | null;
    back: string | null;
  };
  selfie?: string | null;
  phonePrimary?: string;
  phoneSecondary?: string;
  phoneWhatsapp?: string;
  socialTwitter?: string;
  socialLinkedIn?: string;
  socialGitHub?: string;
  temperamentHistory?: TemperamentResult[];
}

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface IDVerificationRequest {
  id: number;
  serial: string;
  userName: string;
  submissionDate: string;
  status: VerificationStatus;
  shopName: string;
  idType?: string;
  idNumber?: string;
  idDocument?: {
    front: string | null;
    back: string | null;
  };
  selfie?: string[] | null;
  rejectionReason?: string;
}

export interface StockSale {
  saleId: string;
  saleDate: string; // ISO date string
  quantitySold: number;
  saleUnitPrice: number;
  totalAmount: number;
  receiptNumber: string;
  clientName: string;
  soldBy: string;
}

export interface UserHistory {
  date: string;
  action: 'Created' | 'Updated' | 'Terminated' | 'Rated' | 'Deleted' | 'Restored';
  details?: string;
}

export interface PhoneNumber {
  code: string;
  number: string;
}

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface ShopUser {
  id: number;
  name: string;
  email: string;
  shop: string[];
  role: string;
  status: 'Active' | 'Inactive' | 'Terminated';
  phonePrimary?: PhoneNumber;
  phoneSecondary?: PhoneNumber;
  phoneWhatsapp?: PhoneNumber;
  idType?: 'National ID' | 'Passport' | "Driver's License";
  idNumber?: string;
  history: UserHistory[];
  gender: Gender;
  lastActivity: string; // ISO date string
  avatar?: string | null;
  createdBy: string;
  userType: 'Shop User';
  averageRating?: number;
}

export interface SuperUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Terminated';
  phonePrimary?: PhoneNumber;
  phoneSecondary?: PhoneNumber;
  phoneWhatsapp?: PhoneNumber;
  idType?: 'National ID' | 'Passport' | "Driver's License";
  idNumber?: string;
  history: UserHistory[];
  gender: Gender;
  lastActivity: string; // ISO date string
  avatar?: string | null;
  createdBy: string;
  userType: 'Super User';
  averageRating?: number;
  temperamentHistory?: TemperamentResult[];
}

export interface Role {
  id: number;
  name: string;
  userType: 'Shop User' | 'Super User';
  description?: string;
}

export interface IncomeStatement {
    revenue: number;
    cogs: number;
    grossProfit: number;
    sellingDistributionExpenses: number;
    adminExpenses: number;
    rdExpenses: number;
    otherOperatingIncome: number;
    otherOperatingExpenses: number;
    operatingProfit: number;
    shareOfProfitFromAssociates: number;
    dividendIncome: number;
    interestIncomeInvestments: number;
    gainOnDisposalOfInvestments: number;
    lossOnDisposalOfInvestments: number;
    totalInvestingIncomeExpense: number;
    profitBeforeFinancingAndIncomeTax: number;
    interestExpenseLoans: number;
    interestExpenseLeaseLiabilities: number;
    otherFinancingCosts: number;
    totalFinancingExpense: number;
    profitBeforeIncomeTax: number;
    incomeTaxExpense: number;
    profitFromContinuingOperations: number;
    profitFromDiscontinuedOperations: number;
    netProfit: number;
    // Legacy fields for backward compatibility
    sgAndA?: number;
    rd?: number;
    depreciation?: number;
    operatingIncome?: number;
    interestExpense?: number;
    preTaxIncome?: number;
    taxes?: number;
    netIncome?: number;
    year1EPS?: number;
    year2EPS?: number;
}

export interface BalanceSheet {
    cashAndEquivalents: number;
    totalLiabilities: number;
    shareholderEquity: number;
    treasuryStock: number;
    preferredStock: number;
    retainedEarningsY1: number;
    retainedEarningsY2: number;
}

export interface CashFlowStatement {
    capex: number;
    operatingCashFlow: number;
}

export interface LoanDetails {
    amount: number;
    interest: number;
    totalLoan: number;
    paidLoan: number;
    loanBalance: number;
    startDate: string;
    endDate: string;
    issuer: string;
    dueDays: number;
}

export interface OpeningBalances {
    cashAtHand: number;
    outstandingDebt: number;
    creditsReceivables: number;
}

export interface TradingLicense {
    type: string;
    name: string;
    number: string;
    hasExpiry: boolean;
    expiryDate?: string;
    certificate: string | null; // base64 string
    remarks?: string;
}

export type ShopStatus = 'Active' | 'Terminated';
export type TerminationReason = 'Business Closed' | 'Breach of Contract' | 'Owner Request' | 'Other';

export interface ShopActivity {
  id: string;
  timestamp: string; // ISO date string
  type: 'User Assignment' | 'Stock Purchase' | 'Settings Update' | 'New Sale';
  description: string;
}

export interface FinancialRatio {
    category: 'Liquidity' | 'Profitability' | 'Efficiency' | 'Solvency' | 'Market' | 'Growth';
    ratio: string;
    formula: string;
    explanation: string;
    idealRange: string;
    value: string;
}

export interface Shop {
  id: number;
  name: string;
  countryCode: string;
  currency: string;
  adminLevels: { level: number; name: string }[];
  location: {
    lat: number;
    lng: number;
  };
  isRegistered: boolean;
  registrationNumber?: string;
  registrationCertificate?: string | null;
  tradingLicenses: TradingLicense[];
  settings: {
      allowCredit: boolean;
      compulsoryClientInfo: boolean;
      
      // Payment Settings
      allowWalletCheckout: boolean;
      allowMobileMoneyPayment: boolean;
      allowCardPayment: boolean;
      allowHoldTransaction?: boolean; 

      // New: POS Settings
      collectClientInfo?: boolean;

      // Wallet Features
      enableWallets: boolean;
      allowWalletDebt: boolean;
      allowWalletDeposits: boolean;
      requireOtpForWalletUpdates: boolean;
      defaultWalletLimit?: number;
      requireClientDebtNotification?: boolean;

      // VAT Settings
      isVatRegistered?: boolean;
      vatPercentage?: number;

      // Additional Settings
      allowPricePerUser?: boolean;
      allowMixFeature?: boolean;
      allowDiscountPercentage?: boolean;
      allowDiscountAmount?: boolean;
      disableDiscountForDebt?: boolean;
      currency?: string;
  };
  financials?: {
      incomeStatement?: IncomeStatement;
      balanceSheet?: BalanceSheet;
      cashFlowStatement?: CashFlowStatement;
      openingBalances?: OpeningBalances;
      loanDetails?: LoanDetails;
      ratios?: FinancialRatio[];
  };
  ownerId: number;
  status: ShopStatus;
  terminationReason?: TerminationReason;
  terminationRemarks?: string;
  terminatedAt?: string; // ISO date string
  activity?: ShopActivity[];
  category: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string; // ISO date string
}

export interface SaleTransaction {
  id: string;
  shopId: number;
  date: string; // ISO date string
  amount: number;
}


export type PermissionKey = 
  | 'phone_access'
  | 'camera_access'
  | 'personality_view'
  | 'personality_edit'
  | 'profile_edit'
  | 'finances_income'
  | 'finances_balance'
  | 'finances_cashflow'
  | 'stock_purchase'
  | 'stock_listing'
  | 'sales_desk'
  | 'reports_messages'
  | 'reports_calls'
  | 'dashboard_users'
  | 'dashboard_traffic'
  | 'dashboard_system'
  | 'id_verification'
  | 'countries_list'
  | 'countries_admin'
  | 'user_mgt_shop'
  | 'user_mgt_super'
  | 'user_mgt_permissions'
  | 'user_mgt_roles'
  | 'settings_cameras'
  | 'settings_api'
  | 'settings_calls'
  | 'settings_messages'
  | 'wallet_view'
  | 'wallet_add_debt'
  | 'wallet_increase_limit'
  | 'wallet_deposit'
  | 'wallet_settings';

export type SuperUserPermissionKey = 
  | 'manageAdmins' 
  | 'manageShops' 
  | 'viewGlobalReports' 
  | 'systemConfiguration' 
  | 'manageBilling'
  | 'phone_access'
  | 'camera_access'
  | 'personality_view'
  | 'personality_edit'
  | 'profile_edit'
  | 'finances_income'
  | 'finances_balance'
  | 'finances_cashflow'
  | 'stock_purchase'
  | 'stock_listing'
  | 'sales_desk'
  | 'reports_messages'
  | 'reports_calls'
  | 'dashboard_users'
  | 'dashboard_traffic'
  | 'dashboard_system'
  | 'id_verification'
  | 'countries_list'
  | 'countries_admin'
  | 'user_mgt_shop'
  | 'user_mgt_super'
  | 'user_mgt_permissions'
  | 'user_mgt_roles'
  | 'settings_cameras'
  | 'settings_api'
  | 'settings_calls'
  | 'settings_messages'
  | 'wallet_view'
  | 'wallet_add_debt'
  | 'wallet_increase_limit'
  | 'wallet_deposit'
  | 'wallet_settings';

export interface RolePermissionSet {
    role: string;
    permissions: Record<PermissionKey, boolean>;
}

export interface SuperUserRolePermissionSet {
    role: string;
    permissions: Record<SuperUserPermissionKey, boolean>;
}

export type LeadStage = 'Contact Established' | 'Won' | 'Lost' | 'Negotiation' | 'New';

export interface Lead {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: PhoneNumber;
  alternativePhone: PhoneNumber;
  physicalLocation: string;
  latitude: string;
  longitude: string;
  stage: LeadStage;
  status: 'Hot' | 'Warm' | 'Cold';
  source: string;
  owner: string;
  remarks: string;
  createdBy: string;
  createdDate: string;
}

export interface Client {
    id: number;
    name: string;
    phone: string;
    email: string;
    location: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    lastOrderDate: string;
    walletEnabled?: boolean;
    debtLimit?: number;
    shopName?: string;
}

export interface WalletTransaction {
    id: string;
    date: string;
    type: 'Deposit' | 'Withdrawal' | 'Limit Change' | 'Status Change' | 'Correction';
    amount?: number;
    balanceAfter?: number;
    remarks?: string;
    performedBy: string;
}

export interface ClientWallet {
    id: string;
    clientId: number;
    clientName: string; // Denormalized for easier display
    balance: number; // Positive = Deposit, Negative = Debt
    creditLimit: number; // Maximum debt allowed (positive number representing absolute limit)
    status: 'Active' | 'Suspended' | 'Closed';
    currency: string;
    createdAt: string;
    lastTransactionDate?: string;
    history: WalletTransaction[];
    loyaltyPoints?: number;
    totalPointsEarned?: number;
    totalPointsRedeemed?: number;
}

export interface CallRecord {
    id: string;
    clientName: string;
    phoneNumber: string;
    type: 'Inbound' | 'Outbound' | 'Missed';
    duration: number; // in seconds
    timestamp: string; // ISO date
    status: 'Completed' | 'Missed' | 'Voicemail';
    agentName: string;
    recordingUrl?: string; // Mock URL
    transcription?: string;
}

export interface DeletedCallRecord extends CallRecord {
    deletedAt: string;
    deletedBy: string;
    deletionReason: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  stockLevel: number;
  reorderPoint: number;
  supplier: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'system_update' | 'new_message';
  priority: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
  productId?: string;
}

export type DeviceType = 'Camera' | 'DVR' | 'NVR';
export type ConnectionStatus = 'Pending' | 'Approved' | 'Offline' | 'Error' | 'Deleted';

export interface CameraDevice {
    id: number;
    name: string;
    type: DeviceType;
    connectionString: string; // IP or URL
    shopId: number;
    shopName: string; // Cached for display
    category: 'Entrances' | 'Checkout' | 'Aisles' | 'Storage' | 'Outside' | 'Other';
    status: ConnectionStatus;
    ownerIdForOtp?: number;
    isLive?: boolean; // Frontend state for simulation
    addedAt: string;
    channels?: number;
    deletionRemarks?: string;
    deletedAt?: string;
    deletedBy?: string;
    restorationRemarks?: string;
    restoredAt?: string;
    restoredBy?: string;
}

export interface ApiConnection {
    id: number;
    name: string;
    endpoint: string;
    apiKey: string; // Should be masked in UI
    status: 'Active' | 'Inactive';
    description: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    senderId: number;
    senderName: string;
    senderRole: string;
    shopId?: number;
    shopName?: string;
    content: string;
    timestamp: string;
    roomId: string;
}

export interface ChatRoom {
    id: string;
    name: string;
    type: 'General' | 'Shop' | 'Region' | 'Private';
}

export interface MessageAssignment {
    superUserId: number;
    assignedShopIds: number[];
    assignedAdminLevels: { countryCode: string; level: number; name: string }[];
}

export interface CallGateway {
    id: number;
    name: string;
    host: string;
    port: number;
    protocol: 'SIP' | 'IAX2';
    apiKey?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
    createdBy: string;
}

export interface Supplier {
    id: number;
    companyName: string;
    locationType: 'Shop' | 'Warehouse';
    locationIds: number[]; 
    locationNames: string; 
    sn: string; 
    emails: string[]; 
    phones: PhoneNumber[];
    country: string;
    contactPerson: {
        firstName: string;
        lastName: string;
        otherName?: string;
    };
    remarks?: string;
    status: 'Active' | 'Inactive' | 'Blacklisted' | 'Deleted';
    createdBy: string;
    createdOn: string;
    history: UserHistory[];
}

export interface Distributor {
    id: number;
    sn: string;
    companyName: string;
    contactPerson: {
        firstName: string;
        lastName: string;
        otherName?: string;
    };
    phones: PhoneNumber[];
    emails: string[];
    supplierId?: number;
    supplierName?: string;
    suppliedShopsCount: number;
    remarks?: string;
    status: 'Active' | 'Deleted';
    createdBy: string;
    createdOn: string;
    history: UserHistory[];
}

export interface Manufacturer {
    id: number;
    sn: string;
    name: string;
    country: string;
    phones: PhoneNumber[]; // up to 3
    emails: string[]; // up to 3
    postalAddress?: string;
    physicalLocation?: string;
    website?: string;
    distributorIds: number[]; // List of distributor IDs
    productsCount: number;
    createdBy: string;
    createdOn: string;
    remarks?: string;
    status: 'Active' | 'Deleted';
    history: UserHistory[];
}

export interface PacketTracerLog {
    id: number;
    functionName: string;
    user: string;
    ipAddress: string;
    timestamp: string;
    status: 'Success' | 'Failed' | 'Pending';
    details: string;
    platform: 'iOS' | 'Android' | 'Web' | 'Desktop';
    version?: string;
}

export interface Partner {
    name: string;
    logo: string;
    description: string;
}

export interface PricingTier {
    country: string;
    currency: string;
    subscription: number;
    registration: number;
    flag: string;
}

export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    author: string;
    date: string;
    imageUrl: string;
    category: string;
    readTime: string;
}

export interface MNOData {
    id: number;
    name: string;
    country: string;
    mobileNumber?: string;
    emoneyAmount?: number;
    network?: 'MTN' | 'Airtel';
    cashAtHand?: number;
    accountType: 'cash-at-hand' | 'MNO';
}

export interface MNOWalletData {
    id: number;
    agentId: string;
    name: string;
    network: 'MTN' | 'Airtel';
    balance: number;
}

export interface TransactionData {
    id: number;
    mnoWalletName: string;
    agentNumber: string;
    transactionType: 'Float top-up' | 'Float withdrawal' | 'Deposit' | 'Float Transfer';
    amount: number;
    previousBalance: number;
    balance: number;
    date: string;
    clientPhone?: string;
    clientName?: string;
}

export interface ExchangeRateData {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    updatedAt: string;
}
