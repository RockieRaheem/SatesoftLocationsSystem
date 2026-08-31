
import type { 
    ShopUser, SuperUser, Role, Shop, IDVerificationRequest, Country, Notification, 
    CameraDevice, CallRecord, Purchase, ProductDefinition, StockItem, Lead, 
    SaleTransaction, ChatMessage, ChatRoom, MessageAssignment, Client, 
    ClientWallet, CallGateway, Supplier, Distributor, Manufacturer, PacketTracerLog,
    TemperamentType, CustomerPurchase, BlogPost, MNOData, MNOWalletData, TransactionData, ExchangeRateData, RegionalEconomicLevel
} from './types.ts';

export const availableProductUnits = ['Piece', 'Box', 'Pack', 'Bottle', 'Carton', 'Dozen', 'Kg', 'Unit', 'Litre', 'Pair', 'Gram', 'Milliliter'];

export const mockShopRoles: Role[] = [
    { id: 1, name: 'Manager', userType: 'Shop User', description: 'Full access to shop operations' },
    { id: 2, name: 'Cashier', userType: 'Shop User', description: 'Sales and basic reporting' },
    { id: 3, name: 'Stocker', userType: 'Shop User', description: 'Inventory management' },
];

export const mockSuperUserRoles: Role[] = [
    { id: 101, name: 'Administrator', userType: 'Super User', description: 'System wide access' },
    { id: 102, name: 'Auditor', userType: 'Super User', description: 'Read only access to reports' },
    { id: 103, name: 'Regional Manager', userType: 'Super User', description: 'Manages multiple shops in a region' },
    { id: 104, name: 'Mobi Agent', userType: 'Super User', description: 'Access to mobile money agent features' },
];

export const mockVerificationRequests: IDVerificationRequest[] = [
    {
        id: 1, serial: 'IV-001', userName: 'Alice Johnson', submissionDate: '2023-10-25', status: 'Pending', shopName: 'Muwanguzi Kiwanga',
        idType: 'National ID', idNumber: 'CM12345678', idDocument: { front: 'https://placehold.co/400x300?text=ID+Front', back: 'https://placehold.co/400x300?text=ID+Back' }, selfie: ['https://placehold.co/400x400?text=Selfie']
    },
    {
        id: 2, serial: 'IV-002', userName: 'Bob Smith', submissionDate: '2023-10-24', status: 'Verified', shopName: 'Topaz Kiwanga',
        idType: 'Passport', idNumber: 'A0001234', idDocument: { front: 'https://placehold.co/400x300?text=ID+Front', back: null }, selfie: null
    }
];

export const mockShopUsers: ShopUser[] = [
    {
        id: 1, name: 'Alice Johnson', email: 'alice@example.com', shop: ['Muwanguzi Kiwanga'], role: 'Manager', status: 'Active',
        gender: 'Female', lastActivity: '2023-10-26T10:00:00', createdBy: 'Admin', userType: 'Shop User', history: [],
        phonePrimary: { code: '+256', number: '772123456' }
    },
    {
        id: 2, name: 'Bob Smith', email: 'bob@example.com', shop: ['Topaz Kiwanga'], role: 'Cashier', status: 'Active',
        gender: 'Male', lastActivity: '2023-10-26T09:30:00', createdBy: 'Admin', userType: 'Shop User', history: [],
        phonePrimary: { code: '+256', number: '752123456' }
    }
];

export const mockSuperUsers: SuperUser[] = [
    {
        id: 101, name: 'Paul Mboya', email: 'paul.mboya@locationregister.org', role: 'Administrator', status: 'Active',
        gender: 'Male', lastActivity: '2023-10-26T11:00:00', createdBy: 'System', userType: 'Super User', history: [],
        phonePrimary: { code: '+256', number: '700000001' }
    },
    {
        id: 102, name: 'Sarah Connor', email: 'sarah@locationregister.org', role: 'Auditor', status: 'Active',
        gender: 'Female', lastActivity: '2023-10-25T14:00:00', createdBy: 'Paul Mboya', userType: 'Super User', history: [],
        phonePrimary: { code: '+256', number: '700000002' }
    },
    {
        id: 103, name: 'Mobi Agent User', email: 'agent@locationregister.org', role: 'Mobi Agent', status: 'Active',
        gender: 'Male', lastActivity: '2023-10-26T12:00:00', createdBy: 'Paul Mboya', userType: 'Super User', history: [],
        phonePrimary: { code: '+256', number: '700000003' }
    }
];

export const allAfricanCountries: Country[] = [
    {
        id: 1, name: 'Uganda', continent: 'Africa', economicZones: ['Eastern Africa'], currency: 'Ugandan Shilling', currencySymbol: 'USh', currencyCode: 'UGX', countryCode: 'UG', phoneCode: '+256', vat: 18, 
        adminLevels: [
            { id: 1, name: 'Central', level: 1, countryCode: 'UG' }, 
            { id: 2, name: 'Western', level: 1, countryCode: 'UG' },
            { id: 3, name: 'Eastern', level: 1, countryCode: 'UG' },
            { id: 4, name: 'Northern', level: 1, countryCode: 'UG' },
            { id: 11, name: 'Kampala', level: 2, countryCode: 'UG', parentAdminLevelId: 1 },
            { id: 12, name: 'Mukono', level: 2, countryCode: 'UG', parentAdminLevelId: 1 },
            { id: 13, name: 'Wakiso', level: 2, countryCode: 'UG', parentAdminLevelId: 1 },
            { id: 121, name: 'Kiwanga', level: 3, countryCode: 'UG', parentAdminLevelId: 12 },
            { id: 122, name: 'Seeta', level: 3, countryCode: 'UG', parentAdminLevelId: 12 },
            { id: 123, name: 'Goma', level: 3, countryCode: 'UG', parentAdminLevelId: 12 }
        ], 
        adminLevelNames: [{level: 1, name: "Region"}, {level: 2, name: "District"}, {level: 3, name: "Village"}], 
        numberOfAdminLevels: 3, numberOfElectoralLevels: 3, numberOfEconomicLevels: 2,
        electoralLevelNames: [{ level: 1, name: "Presidential" }, { level: 2, name: "Parliamentary" }, { level: 3, name: "Local Council" }],
        loyaltyProgram: { enabled: true, earningThreshold: 15000, redemptionValue: 100 },
        currencyDenominators: [
            { id: 1, value: 50000, label: '50,000', type: 'Note', status: 'Active' },
            { id: 2, value: 20000, label: '20,000', type: 'Note', status: 'Active' },
            { id: 3, value: 10000, label: '10,000', type: 'Note', status: 'Active' },
            { id: 4, value: 5000, label: '5,000', type: 'Note', status: 'Active' },
            { id: 5, value: 2000, label: '2,000', type: 'Note', status: 'Active' },
            { id: 6, value: 1000, label: '1,000', type: 'Note', status: 'Active' },
            { id: 7, value: 1000, label: '1,000', type: 'Coin', status: 'Active' },
            { id: 8, value: 500, label: '500', type: 'Coin', status: 'Active' },
            { id: 9, value: 200, label: '200', type: 'Coin', status: 'Active' },
            { id: 10, value: 100, label: '100', type: 'Coin', status: 'Active' },
            { id: 11, value: 50, label: '50', type: 'Coin', status: 'Active' }
        ]
    },
    {
        id: 2, name: 'Kenya', continent: 'Africa', economicZones: ['Eastern Africa'], currency: 'Kenyan Shilling', currencySymbol: 'KSh', currencyCode: 'KES', countryCode: 'KE', phoneCode: '+254', vat: 16, 
        adminLevels: [], adminLevelNames: [{level: 1, name: "County"}], numberOfAdminLevels: 1, numberOfElectoralLevels: 2, numberOfEconomicLevels: 2,
        electoralLevelNames: [{ level: 1, name: "Presidential" }, { level: 2, name: "Gubernatorial" }],
        loyaltyProgram: { enabled: false, earningThreshold: 1000, redemptionValue: 1 },
        currencyDenominators: [
            { id: 1, value: 1000, label: '1,000', type: 'Note', status: 'Active' },
            { id: 2, value: 500, label: '500', type: 'Note', status: 'Active' },
            { id: 3, value: 200, label: '200', type: 'Note', status: 'Active' },
            { id: 4, value: 100, label: '100', type: 'Note', status: 'Active' },
            { id: 5, value: 50, label: '50', type: 'Note', status: 'Active' },
            { id: 6, value: 40, label: '40', type: 'Coin', status: 'Active' },
            { id: 7, value: 20, label: '20', type: 'Coin', status: 'Active' },
            { id: 8, value: 10, label: '10', type: 'Coin', status: 'Active' },
            { id: 9, value: 5, label: '5', type: 'Coin', status: 'Active' },
            { id: 10, value: 1, label: '1', type: 'Coin', status: 'Active' }
        ]
    },
    {
        id: 3, name: 'Tanzania', continent: 'Africa', economicZones: ['Eastern Africa'], currency: 'Tanzanian Shilling', currencySymbol: 'TSh', currencyCode: 'TZS', countryCode: 'TZ', phoneCode: '+255', vat: 18,
        adminLevels: [
            { id: 301, name: 'Lake & Western Zone', level: 1, countryCode: 'TZ' },
            { id: 302, name: 'Northern Zone', level: 1, countryCode: 'TZ' },
            { id: 303, name: 'Central Zone', level: 1, countryCode: 'TZ' },
            { id: 304, name: 'Coastal & Zanzibar', level: 1, countryCode: 'TZ' },
            { id: 305, name: 'Southern Highlands', level: 1, countryCode: 'TZ' }
        ],
        adminLevelNames: [{level: 1, name: "Zone"}],
        numberOfAdminLevels: 1, numberOfElectoralLevels: 2, numberOfEconomicLevels: 2, loyaltyProgram: { enabled: false, earningThreshold: 10000, redemptionValue: 50 }
    },
    {
        id: 4, name: 'Rwanda', continent: 'Africa', economicZones: ['Eastern Africa'], currency: 'Rwandan Franc', currencySymbol: 'RF', currencyCode: 'RWF', countryCode: 'RW', phoneCode: '+250', vat: 18,
        adminLevels: [
            { id: 401, name: 'Kigali City', level: 1, countryCode: 'RW' },
            { id: 402, name: 'Northern', level: 1, countryCode: 'RW' },
            { id: 403, name: 'Eastern', level: 1, countryCode: 'RW' },
            { id: 404, name: 'Western', level: 1, countryCode: 'RW' },
            { id: 405, name: 'Southern', level: 1, countryCode: 'RW' }
        ],
        adminLevelNames: [{level: 1, name: "Province"}],
        numberOfAdminLevels: 1, numberOfElectoralLevels: 2, numberOfEconomicLevels: 2
    },
    {
        id: 5, name: 'Nigeria', continent: 'Africa', economicZones: ['Western Africa'], currency: 'Naira', currencySymbol: '₦', currencyCode: 'NGN', countryCode: 'NG', phoneCode: '+234', vat: 7.5, adminLevels: [], numberOfAdminLevels: 2, numberOfElectoralLevels: 3, numberOfEconomicLevels: 2
    },
    {
        id: 6, name: 'South Africa', continent: 'Africa', economicZones: ['Southern Africa'], currency: 'Rand', currencySymbol: 'R', currencyCode: 'ZAR', countryCode: 'ZA', phoneCode: '+27', vat: 15, adminLevels: [], numberOfAdminLevels: 2, numberOfElectoralLevels: 3, numberOfEconomicLevels: 2
    }
];

export const mockShops: Shop[] = [
    {
        id: 1,
        name: 'Muwanguzi Kiwanga',
        countryCode: 'UG',
        currency: 'UGX',
        adminLevels: [{ level: 1, name: 'Central' }, { level: 2, name: 'Mukono' }],
        location: { lat: 0.3476, lng: 32.5825 },
        isRegistered: true,
        registrationNumber: 'REG-001',
        tradingLicenses: [{ type: 'Trading License', name: 'General Trade License', number: 'LIC-2023-001', hasExpiry: true, expiryDate: '2024-12-31', certificate: null, remarks: 'Standard annual license' }],
        settings: {
            allowCredit: true,
            compulsoryClientInfo: false,
            collectClientInfo: true,
            allowWalletCheckout: true,
            allowMobileMoneyPayment: true,
            allowCardPayment: false,
            enableWallets: true,
            allowWalletDebt: true,
            allowWalletDeposits: true,
            requireOtpForWalletUpdates: true,
            allowHoldTransaction: true,
            isVatRegistered: true,
            allowDiscountPercentage: true,
            allowDiscountAmount: true,
            disableDiscountForDebt: true
        },
        financials: {
            incomeStatement: { 
                revenue: 15000000, 
                cogs: 9000000,
                grossProfit: 6000000, 
                sellingDistributionExpenses: 1200000,
                adminExpenses: 1000000,
                rdExpenses: 300000,
                otherOperatingIncome: 250000,
                otherOperatingExpenses: 150000,
                operatingProfit: 3600000,
                shareOfProfitFromAssociates: 180000,
                dividendIncome: 45000,
                interestIncomeInvestments: 75000,
                gainOnDisposalOfInvestments: 60000,
                lossOnDisposalOfInvestments: 30000,
                totalInvestingIncomeExpense: 330000,
                profitBeforeFinancingAndIncomeTax: 3930000,
                interestExpenseLoans: 450000,
                interestExpenseLeaseLiabilities: 75000,
                otherFinancingCosts: 30000,
                totalFinancingExpense: 555000,
                profitBeforeIncomeTax: 3375000,
                incomeTaxExpense: 750000,
                profitFromContinuingOperations: 2625000,
                profitFromDiscontinuedOperations: 0,
                netProfit: 2625000,
                // Legacy fields
                sgAndA: 1000000, rd: 0, depreciation: 200000, operatingIncome: 3800000, interestExpense: 100000, preTaxIncome: 3700000, taxes: 1110000, netIncome: 2590000, year1EPS: 10, year2EPS: 12 
            },
            balanceSheet: { cashAndEquivalents: 2000000, totalLiabilities: 500000, shareholderEquity: 1500000, treasuryStock: 0, preferredStock: 0, retainedEarningsY1: 1000000, retainedEarningsY2: 1200000 },
            cashFlowStatement: { capex: 500000, operatingCashFlow: 3000000 }
        },
        ownerId: 101,
        status: 'Active',
        category: 'Retail',
        createdBy: 'Paul Mboya',
        updatedBy: 'Paul Mboya',
        createdAt: '2024-01-15T10:00:00'
    },
    {
        id: 2,
        name: 'Topaz Kiwanga',
        countryCode: 'UG',
        currency: 'UGX',
        adminLevels: [{ level: 1, name: 'Central' }, { level: 2, name: 'Mukono' }],
        location: { lat: 0.3500, lng: 32.5900 },
        isRegistered: true,
        tradingLicenses: [],
        settings: { allowCredit: false, compulsoryClientInfo: true, collectClientInfo: false, allowWalletCheckout: false, allowMobileMoneyPayment: true, allowCardPayment: true, enableWallets: false, allowWalletDebt: false, allowWalletDeposits: false, requireOtpForWalletUpdates: false, allowHoldTransaction: false, isVatRegistered: false, allowDiscountPercentage: false, allowDiscountAmount: false, disableDiscountForDebt: false },
        financials: {
            incomeStatement: { 
                revenue: 25000000, 
                cogs: 18000000,
                grossProfit: 7000000, 
                sellingDistributionExpenses: 1500000,
                adminExpenses: 1200000,
                rdExpenses: 0,
                otherOperatingIncome: 100000,
                otherOperatingExpenses: 50000,
                operatingProfit: 4350000,
                shareOfProfitFromAssociates: 0,
                dividendIncome: 0,
                interestIncomeInvestments: 25000,
                gainOnDisposalOfInvestments: 0,
                lossOnDisposalOfInvestments: 0,
                totalInvestingIncomeExpense: 25000,
                profitBeforeFinancingAndIncomeTax: 4375000,
                interestExpenseLoans: 600000,
                interestExpenseLeaseLiabilities: 100000,
                otherFinancingCosts: 50000,
                totalFinancingExpense: 750000,
                profitBeforeIncomeTax: 3625000,
                incomeTaxExpense: 800000,
                profitFromContinuingOperations: 2825000,
                profitFromDiscontinuedOperations: 0,
                netProfit: 2825000,
                // Legacy fields
                sgAndA: 2000000, rd: 0, depreciation: 500000, operatingIncome: 4500000, interestExpense: 200000, preTaxIncome: 4300000, taxes: 1290000, netIncome: 3010000, year1EPS: 15, year2EPS: 18
            },
            balanceSheet: { cashAndEquivalents: 5000000, totalLiabilities: 1500000, shareholderEquity: 3500000, treasuryStock: 0, preferredStock: 0, retainedEarningsY1: 2000000, retainedEarningsY2: 2500000 },
            cashFlowStatement: { capex: 1000000, operatingCashFlow: 5000000 }
        },
        ownerId: 101,
        status: 'Active',
        category: 'Wholesale',
        createdBy: 'Paul Mboya',
        createdAt: '2024-02-20T14:00:00'
    },
    {
        id: 3,
        name: 'Lagos Central Market',
        countryCode: 'NG',
        currency: 'NGN',
        adminLevels: [{ level: 1, name: 'Lagos' }],
        location: { lat: 6.5244, lng: 3.3792 },
        isRegistered: true,
        status: 'Active',
        category: 'Retail',
        createdAt: '2024-03-01T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    },
    {
        id: 4,
        name: 'Abuja Tech Hub',
        countryCode: 'NG',
        currency: 'NGN',
        adminLevels: [{ level: 1, name: 'Federal Capital Territory' }],
        location: { lat: 9.0765, lng: 7.3986 },
        isRegistered: true,
        status: 'Active',
        category: 'Retail',
        createdAt: '2024-03-05T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    },
    {
        id: 5,
        name: 'Luanda Port Shop',
        countryCode: 'AO',
        currency: 'AOA',
        adminLevels: [{ level: 1, name: 'Luanda' }],
        location: { lat: -8.8390, lng: 13.2894 },
        isRegistered: true,
        status: 'Active',
        category: 'Wholesale',
        createdAt: '2024-03-10T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    },
    {
        id: 6,
        name: 'Johannesburg Retail',
        countryCode: 'ZA',
        currency: 'ZAR',
        adminLevels: [{ level: 1, name: 'Gauteng' }],
        location: { lat: -26.2041, lng: 28.0473 },
        isRegistered: true,
        status: 'Active',
        category: 'Retail',
        createdAt: '2024-03-15T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    },
    {
        id: 7,
        name: 'Cape Town Logistics',
        countryCode: 'ZA',
        currency: 'ZAR',
        adminLevels: [{ level: 1, name: 'Western Cape' }],
        location: { lat: -33.9249, lng: 18.4241 },
        isRegistered: true,
        status: 'Active',
        category: 'Wholesale',
        createdAt: '2024-03-20T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    },
    {
        id: 8,
        name: 'Nairobi Express',
        countryCode: 'KE',
        currency: 'KES',
        adminLevels: [{ level: 1, name: 'Nairobi' }],
        location: { lat: -1.2921, lng: 36.8219 },
        isRegistered: true,
        status: 'Active',
        category: 'Retail',
        createdAt: '2024-03-25T10:00:00',
        tradingLicenses: [],
        settings: { allowCredit: true, compulsoryClientInfo: false, collectClientInfo: true, allowWalletCheckout: true, allowMobileMoneyPayment: true, allowCardPayment: false, enableWallets: true, allowWalletDebt: true, allowWalletDeposits: true, requireOtpForWalletUpdates: true, allowHoldTransaction: true, isVatRegistered: true, allowDiscountPercentage: true, allowDiscountAmount: true, disableDiscountForDebt: true },
        ownerId: 101,
        createdBy: 'Paul Mboya'
    }

];

export const mockProductDefinitions: ProductDefinition[] = [
    { id: 1, sn: 'PDT-001', name: 'Colgate Herbal Toothpaste 35g', barcode: '600106700', manufacturer: 'Colgate-Palmolive', status: 'ACTIVE', baseUnit: 'Piece', baseQuantity: 35, containerUnit: 'Box', containerQuantity: 12, saleUnits: 'Piece, Box', createdBy: 'Admin', createdAt: '2023-01-15T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Personal Care' },
    { id: 2, sn: 'PDT-002', name: 'Coca Cola 500ml', barcode: '5449000000996', manufacturer: 'Coca Cola', status: 'ACTIVE', baseUnit: 'Bottle', baseQuantity: 500, containerUnit: 'Crate', containerQuantity: 24, saleUnits: 'Bottle, Crate', createdBy: 'Admin', createdAt: '2023-01-16T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Beverages' },
    { id: 3, sn: 'PDT-003', name: 'Colgate Max Fresh 75g', barcode: '600106701', manufacturer: 'Colgate-Palmolive', status: 'ACTIVE', baseUnit: 'Piece', baseQuantity: 75, containerUnit: 'Box', containerQuantity: 12, saleUnits: 'Piece, Box', createdBy: 'Admin', createdAt: '2023-01-17T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Personal Care' },
    { id: 4, sn: 'PDT-004', name: 'Pepsi 500ml', barcode: '5449000000997', manufacturer: 'PepsiCo', status: 'ACTIVE', baseUnit: 'Bottle', baseQuantity: 500, containerUnit: 'Crate', containerQuantity: 24, saleUnits: 'Bottle, Crate', createdBy: 'Admin', createdAt: '2023-01-18T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Beverages' },
    { id: 5, sn: 'PDT-005', name: 'Coca Cola 300ml', barcode: '5449000000998', manufacturer: 'Coca Cola', status: 'ACTIVE', baseUnit: 'Bottle', baseQuantity: 300, containerUnit: 'Crate', containerQuantity: 24, saleUnits: 'Bottle, Crate', createdBy: 'Admin', createdAt: '2023-01-19T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Beverages' },
    { id: 6, sn: 'PDT-006', name: 'Coca Cola 2L', barcode: '5449000000999', manufacturer: 'Coca Cola', status: 'ACTIVE', baseUnit: 'Bottle', baseQuantity: 2000, containerUnit: 'Pack', containerQuantity: 6, saleUnits: 'Bottle, Pack', createdBy: 'Admin', createdAt: '2023-01-20T10:00:00', hasBatchNumber: true, hasExpiryDate: true, isGlobal: true, category: 'Beverages' },
];

export const mockStockListings: StockItem[] = [
    { 
        id: 1, productName: 'Colgate Herbal Toothpaste 35g', productSN: 'PDT-001', customName: 'Colgate Herbal Small', barcode: '600106700', category: 'Personal Care', quantity: 50, unit: 'Piece', unitPrice: 3500, currency: 'UGX', listedBy: 'Alice', listedOn: '2023-10-20T10:00:00', shopName: 'Muwanguzi Kiwanga', shopId: 1, manufacturer: 'Colgate-Palmolive', baseUnit: 'Piece', hasMultipleSaleUnits: true, allowMix: false,
        reorderPoint: 20, supplier: 'Global Pharm'
    },
    { 
        id: 2, productName: 'Coca Cola 500ml', productSN: 'PDT-002', customName: 'Coke 500ml', barcode: '5449000000996', category: 'Beverages', quantity: 12, unit: 'Bottle', unitPrice: 2000, currency: 'UGX', listedBy: 'Bob', listedOn: '2023-10-21T11:00:00', shopName: 'Topaz Kiwanga', shopId: 2, manufacturer: 'Coca Cola', baseUnit: 'Bottle', hasMultipleSaleUnits: true, allowMix: true,
        reorderPoint: 50, supplier: 'Fast Logistics'
    },
];

export const mockSalesTransactions: SaleTransaction[] = [
    { id: 'TX-001', shopId: 1, date: '2023-10-25T14:30:00', amount: 55000 },
    { id: 'TX-002', shopId: 2, date: '2023-10-25T15:00:00', amount: 12000 },
    { id: 'TX-003', shopId: 1, date: '2023-10-26T09:00:00', amount: 85000 },
];

export const mockLeads: Lead[] = [
    { id: 1, companyName: 'Sunrise Supermarket', firstName: 'John', lastName: 'Doe', phone: { code: '+256', number: '772111222' }, alternativePhone: { code: '+256', number: '' }, email: 'john@sunrise.com', physicalLocation: 'Kampala Road', latitude: '0.3136', longitude: '32.5811', stage: 'New', status: 'Hot', source: 'Referral', owner: 'Paul Mboya', remarks: 'Interested in POS system', createdBy: 'System', createdDate: '2023-10-20T10:00:00' },
];

export const mockMessages: ChatMessage[] = [
    { id: '1', senderId: 1, senderName: 'Alice Johnson', senderRole: 'Manager', shopId: 1, shopName: 'Muwanguzi Kiwanga', content: 'Stock for Colgate is running low.', timestamp: '2023-10-26T09:00:00', roomId: 'general' },
    { id: '2', senderId: 101, senderName: 'Paul Mboya', senderRole: 'Administrator', content: 'Noted, will process restock today.', timestamp: '2023-10-26T09:05:00', roomId: 'general' },
];

export const mockChatRooms: ChatRoom[] = [
    { id: 'general', name: 'General', type: 'General' },
    { id: 'shop-1', name: 'Muwanguzi Kiwanga', type: 'Shop' },
];

export const mockCallRecords: CallRecord[] = [
    { id: 'call-1', clientName: 'John Doe', phoneNumber: '+256 772 111 222', type: 'Inbound', duration: 120, timestamp: '2023-10-26T10:00:00', status: 'Completed', agentName: 'Paul Mboya', recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', transcription: 'Customer asked about pricing for bulk purchase of soda.' },
    { id: 'call-2', clientName: 'Jane Smith', phoneNumber: '+256 701 333 444', type: 'Outbound', duration: 0, timestamp: '2023-10-26T11:00:00', status: 'Missed', agentName: 'Sarah Connor' },
];

export const TEMPERAMENT_DATA: Record<TemperamentType, any> = {
    'Choleric': { color: '#ef4444', characteristic: 'Dominant, Strong-willed', strengths: ['Leadership', 'Visionary', 'Practical'], weaknesses: ['Impatient', 'Anger', 'Domineering'], positiveDescription: 'Natural leader, goal-oriented.', negativeDescription: 'Can be insensitive and impatient.' },
    'Sanguine': { color: '#eab308', characteristic: 'Social, Optimistic', strengths: ['Enthusiastic', 'Warm', 'Friendly'], weaknesses: ['Undisciplined', 'Unproductive', 'Exaggerates'], positiveDescription: 'Life of the party, creative.', negativeDescription: 'Can be disorganized and forgetful.' },
    'Melancholic': { color: '#3b82f6', characteristic: 'Analytical, Quiet', strengths: ['Detailed', 'Deep thinker', 'Organized'], weaknesses: ['Depressed', 'Moody', 'Critical'], positiveDescription: 'Thoughtful, perfectionist.', negativeDescription: 'Prone to depression and pessimism.' },
    'Phlegmatic': { color: '#22c55e', characteristic: 'Relaxed, Peaceful', strengths: ['Calm', 'Reliable', 'Efficient'], weaknesses: ['Lazy', 'Procrastinator', 'Stubborn'], positiveDescription: 'Easy-going, good listener.', negativeDescription: 'Can be unmotivated and indecisive.' }
};

export const mockPurchases: Purchase[] = [
    { 
        id: 1, 
        bulkEntrySerial: 'PUR-1023', 
        entriesMade: 2, 
        amount: 'UGX 1,500,000', 
        shop: 'Global Pharm', 
        actionBy: 'Alice', 
        dateOfEntry: '2025-11-15 10:00 AM', 
        dateOfPurchase: '2025-11-15', 
        invoiceNumber: 'INV-1023', 
        products: [
            {
                id: '1',
                name: 'Colgate Herbal Toothpaste 35g',
                sku: 'PDT-001',
                unit: 'Piece',
                quantity: 100,
                unitPrice: 3000,
                defaultUnit: 'Piece',
                defaultUnitPrice: 3000,
                batchNumber: 'BATCH-001',
                expirationDate: '2026-12-31',
                remarks: 'Initial stock'
            },
            {
                id: '2',
                name: 'Coca Cola 500ml',
                sku: 'PDT-002',
                unit: 'Bottle',
                quantity: 200,
                unitPrice: 1500,
                defaultUnit: 'Bottle',
                defaultUnitPrice: 1500,
                batchNumber: 'BATCH-002',
                expirationDate: '2026-06-30',
                remarks: 'Restock'
            }
        ], 
        reconciled: true 
    },
    { 
        id: 2, 
        bulkEntrySerial: 'BES-002', 
        entriesMade: 1, 
        amount: 'UGX 3,200,000', 
        shop: 'Topaz Kiwanga', 
        actionBy: 'Bob', 
        dateOfEntry: '2023-10-21 09:00 AM', 
        dateOfPurchase: '2023-10-20', 
        invoiceNumber: 'INV-002', 
        products: [
            {
                id: '3',
                name: 'Colgate Max Fresh 75g',
                sku: 'PDT-003',
                unit: 'Piece',
                quantity: 50,
                unitPrice: 5000,
                defaultUnit: 'Piece',
                defaultUnitPrice: 5000,
                batchNumber: 'BATCH-003',
                expirationDate: '2026-01-01',
                remarks: ''
            }
        ], 
        reconciled: false 
    },
];

export const mockApiConnections = [
    { id: 1, name: 'Twilio SMS', endpoint: 'https://api.twilio.com', apiKey: 'sk_...', status: 'Active' as const, description: 'SMS Gateway', createdAt: '2023-01-01T00:00:00' },
    { id: 2, name: 'M-Pesa', endpoint: 'https://api.safaricom.co.ke', apiKey: 'mp_...', status: 'Inactive' as const, description: 'Mobile Money Payments', createdAt: '2023-02-01T00:00:00' },
];

export const mockMessageAssignments: MessageAssignment[] = [
    { superUserId: 102, assignedShopIds: [1, 2], assignedAdminLevels: [] },
];

export const mockClients: Client[] = [
    { id: 1, name: 'John Doe', phone: '0772111222', email: 'john@example.com', location: 'Kampala', status: 'Active', lastOrderDate: '2023-10-25', walletEnabled: true, debtLimit: 500000, shopName: 'Muwanguzi Kiwanga' },
    { id: 2, name: 'Jane Smith', phone: '0701333444', email: 'jane@example.com', location: 'Mukono', status: 'Active', lastOrderDate: '2023-10-20', walletEnabled: true, debtLimit: 200000, shopName: 'Topaz Kiwanga' },
    { id: 99, name: 'Customer Account', phone: '0770000000', email: 'customer@mail.com', location: 'Kampala', status: 'Active', lastOrderDate: '2023-10-26', walletEnabled: true, debtLimit: 1000000, shopName: 'Muwanguzi Kiwanga' },
];

export const mockCallGateways: CallGateway[] = [
    { id: 1, name: 'Main SIP Trunk', host: 'sip.provider.com', port: 5060, protocol: 'SIP', status: 'Active', createdAt: '2023-01-01', createdBy: 'Admin' },
];

export const mockClientWallets: ClientWallet[] = [
    { id: 'W-001', clientId: 1, clientName: 'John Doe', balance: 150000, creditLimit: 500000, status: 'Active', currency: 'UGX', createdAt: '2023-01-01', history: [], loyaltyPoints: 120, totalPointsEarned: 500, totalPointsRedeemed: 380 },
    { id: 'W-002', clientId: 2, clientName: 'Jane Smith', balance: -50000, creditLimit: 200000, status: 'Active', currency: 'UGX', createdAt: '2023-02-01', history: [], loyaltyPoints: 50, totalPointsEarned: 100, totalPointsRedeemed: 50 },
    { id: 'W-099', clientId: 99, clientName: 'Customer Account', balance: 250000, creditLimit: 1000000, status: 'Active', currency: 'UGX', createdAt: '2023-01-10', history: [], loyaltyPoints: 450, totalPointsEarned: 1200, totalPointsRedeemed: 750 },
];

export const mockSuppliers: Supplier[] = [
    { 
        id: 1, companyName: 'Global Pharm', locationType: 'Warehouse', locationIds: [101], locationNames: 'Main Warehouse', sn: 'SUP001', emails: ['info@globalpharm.com'], phones: [{code: '+256', number: '777111222'}], country: 'Uganda', contactPerson: { firstName: 'James', lastName: 'Bond' }, status: 'Active', createdBy: 'Admin', createdOn: '2023-01-01', history: []
    }
];

export const mockDistributors: Distributor[] = [
    { id: 1, sn: 'DIST001', companyName: 'Fast Logistics', contactPerson: { firstName: 'Peter', lastName: 'Pan' }, phones: [{code: '+256', number: '755333444'}], emails: ['peter@fast.com'], suppliedShopsCount: 5, status: 'Active', createdBy: 'Admin', createdOn: '2023-01-05', history: [] }
];

export const mockManufacturers: Manufacturer[] = [
    { id: 1, sn: 'MFT001', name: 'Coca Cola', country: 'USA', phones: [{code: '+1', number: '8005551234'}], emails: ['contact@coke.com'], distributorIds: [1], productsCount: 15, createdBy: 'Admin', createdOn: '2023-01-01', status: 'Active', history: [] }
];

export const mockPacketTracerLogs: PacketTracerLog[] = [
    { id: 1, functionName: 'login', user: 'alice@example.com', ipAddress: '192.168.1.5', timestamp: '2023-10-26T10:05:00', status: 'Success', details: 'User logged in successfully', platform: 'Web' },
    { id: 2, functionName: 'create_sale', user: 'bob@example.com', ipAddress: '192.168.1.6', timestamp: '2023-10-26T10:15:00', status: 'Failed', details: 'Permission denied', platform: 'Android' },
];

export const mockNotifications: Notification[] = [
    { id: '1', type: 'low_stock', priority: 'high', message: 'Low stock alert: Colgate Herbal 35g', timestamp: '2023-10-26T08:00:00', read: false, productId: '1' },
    { id: '2', type: 'new_message', priority: 'medium', message: 'New message from Regional Manager', timestamp: '2023-10-26T09:30:00', read: false },
];

export const mockCameraDevices: CameraDevice[] = [
    { id: 1, name: 'Main Entrance Cam', type: 'Camera', connectionString: 'rtsp://192.168.1.101/stream1', shopId: 1, shopName: 'Muwanguzi Kiwanga', category: 'Entrances', status: 'Approved', addedAt: '2023-09-01T10:00:00' },
    { id: 2, name: 'Checkout 1', type: 'Camera', connectionString: 'rtsp://192.168.1.102/stream1', shopId: 1, shopName: 'Muwanguzi Kiwanga', category: 'Checkout', status: 'Approved', addedAt: '2023-09-01T10:00:00' },
    { id: 3, name: 'Store Room NVR', type: 'NVR', connectionString: '192.168.1.200', shopId: 2, shopName: 'Topaz Kiwanga', category: 'Storage', status: 'Pending', channels: 8, addedAt: '2023-10-20T14:00:00', ownerIdForOtp: 1 },
];

export const mockCustomerPurchases: CustomerPurchase[] = [
    { id: 'PUR-001', shopName: 'Muwanguzi Kiwanga', date: '2023-10-26T10:30:00', itemsSummary: '3 items', totalAmount: 25000, currency: 'UGX', status: 'Completed' },
    { id: 'PUR-002', shopName: 'Topaz Kiwanga', date: '2023-10-25T16:15:00', itemsSummary: '2 items', totalAmount: 12500, currency: 'UGX', status: 'Completed' },
];

export const mockBlogPosts: BlogPost[] = [
    { id: 1, title: "Digitalizing Informal Retail", excerpt: "How technology is transforming small businesses in Africa.", author: "Paul Mboya", date: "Oct 20, 2023", category: "Industry", imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop", readTime: "5 min read", content: "<p>Detailed content about digitalization...</p>" },
    { id: 2, title: "Supply Chain Resilience", excerpt: "Building robust supply chains to withstand global shocks.", author: "Sarah Connor", date: "Oct 15, 2023", category: "Logistics", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop", readTime: "7 min read", content: "<p>Content about supply chain resilience...</p>" },
    { id: 3, title: "New Features: October Update", excerpt: "Check out the latest tools we've added to the Location Register.", author: "Register Team", date: "Oct 01, 2023", category: "Product", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop", readTime: "3 min read", content: "<p>Product update details...</p>" },
];

export const mockMNOAccounts: MNOData[] = [
    { id: 1, name: 'MTN Uganda Main', country: 'Uganda', mobileNumber: '0772123456', emoneyAmount: 5000000, network: 'MTN', accountType: 'MNO' },
    { id: 2, name: 'Airtel Uganda Float', country: 'Uganda', mobileNumber: '0752123456', emoneyAmount: 3500000, network: 'Airtel', accountType: 'MNO' },
    { id: 3, name: 'Main Cash Box', country: 'Uganda', cashAtHand: 1200000, accountType: 'cash-at-hand' },
];

export const mockMNOWallets: MNOWalletData[] = [
    { id: 1, agentId: 'AGT-001', name: 'MTN Agent Wallet 1', network: 'MTN', balance: 2500000 },
    { id: 2, agentId: 'AGT-002', name: 'Airtel Agent Wallet 1', network: 'Airtel', balance: 1800000 },
];

export const mockMNOTransactions: TransactionData[] = [
    { id: 1, mnoWalletName: 'MTN Agent Wallet 1', agentNumber: 'AGT-001', transactionType: 'Float top-up', amount: 500000, previousBalance: 2000000, balance: 2500000, date: '2023-10-26T10:00:00', clientPhone: '+256772111222', clientName: 'John Doe' },
    { id: 2, mnoWalletName: 'Airtel Agent Wallet 1', agentNumber: 'AGT-002', transactionType: 'Float withdrawal', amount: 200000, previousBalance: 2000000, balance: 2200000, date: '2023-10-26T11:30:00', clientPhone: '+256752333444', clientName: 'Jane Smith' },
];

export const mockRegionalEconomicLevels: RegionalEconomicLevel[] = [
    {
        id: 1,
        name: 'East African Community',
        abbreviation: 'EAC',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_the_East_African_Community.svg/320px-Flag_of_the_East_African_Community.svg.png',
        description: 'An intergovernmental organisation composed of seven countries in the African Great Lakes region in eastern Africa.',
        countries: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'DR Congo'],
        color: '#3b82f6' // Blue
    },
    {
        id: 2,
        name: 'Economic Community of West African States',
        abbreviation: 'ECOWAS',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_ECOWAS.svg/320px-Flag_of_ECOWAS.svg.png',
        description: 'A regional political and economic union of fifteen countries located in West Africa.',
        countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Benin', 'Burkina Faso', 'Cape Verde', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Niger', 'Sierra Leone', 'Togo'],
        color: '#22c55e' // Green
    },
    {
        id: 3,
        name: 'Southern African Development Community',
        abbreviation: 'SADC',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_SADC.svg/320px-Flag_of_SADC.svg.png',
        description: 'An inter-governmental organization headquartered in Gaborone, Botswana.',
        countries: ['South Africa', 'Angola', 'Botswana', 'Comoros', 'DR Congo', 'Eswatini', 'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'Tanzania', 'Zambia', 'Zimbabwe'],
        color: '#eab308' // Yellow
    }
];

export const mockExchangeRates: ExchangeRateData[] = [
    { id: 1, fromCurrency: 'USD', toCurrency: 'UGX', rate: 3850, updatedAt: '2023-10-26T09:00:00' },
    { id: 2, fromCurrency: 'KES', toCurrency: 'UGX', rate: 25.5, updatedAt: '2023-10-26T09:00:00' },
];
