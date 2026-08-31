# Mobi Agent Feature UML Diagrams

This document provides UML diagrams for the "Mobi Agent" feature, designed to guide software engineers in its implementation from start to finish.

## 1. Use Case Diagram

The Use Case diagram illustrates the interactions between the Mobi Agent (user) and the system's core functionalities, including potential external integrations.

```mermaid
useCaseDiagram
    actor "Mobi Agent" as Agent
    actor "MNO System" as MNO
    actor "Admin" as Admin

    package "Mobi Agent Feature" {
        usecase "Manage MNO Accounts" as UC1
        usecase "Manage Cash at Hand" as UC2
        usecase "Manage MNO Wallets" as UC3
        usecase "Record Transactions" as UC4
        usecase "View Transaction History" as UC5
        usecase "Manage Exchange Rates" as UC6
        usecase "View Dashboard Stats" as UC7
        usecase "Assign Mobi Agent Role" as UC8
    }

    Agent --> UC1
    Agent --> UC2
    Agent --> UC3
    Agent --> UC4
    Agent --> UC5
    Agent --> UC6
    Agent --> UC7
    
    Admin --> UC8

    UC4 ..> MNO : "Optional API Integration"
```

## 2. Class Diagram

The Class diagram defines the data structures, their properties, and their relationships.

```mermaid
classDiagram
    class MNOData {
        +int id
        +string name
        +string country
        +string mobileNumber
        +float emoneyAmount
        +string network
        +float cashAtHand
        +string accountType
    }

    class MNOWalletData {
        +int id
        +string agentId
        +string name
        +string network
        +float balance
    }

    class TransactionData {
        +int id
        +string mnoWalletName
        +string agentNumber
        +string transactionType
        +float amount
        +float previousBalance
        +float balance
        +string date
        +string clientPhone
        +string clientName
    }

    class ExchangeRateData {
        +int id
        +string fromCurrency
        +string toCurrency
        +float rate
        +string updatedAt
    }

    class User {
        +string id
        +string name
        +string role
    }

    class MobiAgentService {
        +subscribeToAccounts(callback)
        +saveAccount(account)
        +subscribeToWallets(callback)
        +saveWallet(wallet)
        +subscribeToTransactions(callback)
        +recordTransaction(transaction)
    }

    User "1" -- "*" MNOData : manages
    User "1" -- "*" MNOWalletData : manages
    MNOWalletData "1" -- "*" TransactionData : has
    MobiAgentService ..> MNOData : persists
    MobiAgentService ..> MNOWalletData : persists
    MobiAgentService ..> TransactionData : persists
```

## 3. Sequence Diagram: Recording a Transaction

This diagram shows the end-to-end process of recording a transaction, including state updates and persistence.

```mermaid
sequenceDiagram
    participant Agent as Mobi Agent (User)
    participant UI as MNOWalletTransactionsPage
    participant Modal as MNOWalletTransactionModal
    participant Service as MobiAgentService
    participant DB as Firestore / Backend

    Agent->>UI: Click "Record Transaction"
    UI->>Modal: Open Modal (mode="add")
    Agent->>Modal: Enter Details (Wallet, Type, Amount)
    Agent->>Modal: Click "Submit"
    Modal->>UI: onSubmit(newTransactionData)
    UI->>Service: recordTransaction(newTransactionData)
    
    activate Service
    Service->>DB: Add Transaction Document
    Service->>DB: Update Wallet Balance (Atomic)
    DB-->>Service: Success
    deactivate Service
    
    Service-->>UI: Transaction Recorded
    UI->>Modal: Close Modal
    UI->>Agent: Display Success Message & Updated Stats
```

## 4. State Machine Diagram: Transaction Lifecycle

This diagram illustrates the possible states of a transaction from initiation to completion.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : Submit Transaction
    Processing --> Completed : Success
    Processing --> Failed : Error / Timeout
    Pending --> Cancelled : User Cancel
    Completed --> [*]
    Failed --> [*]
    Cancelled --> [*]
```

## 5. Component Architecture

A high-level view of the frontend component hierarchy and data flow.

```mermaid
graph TD
    App[App.tsx] --> Main[MainContent.tsx]
    Main --> MobiSettings[MobiAgentSettingsPage.tsx]
    Main --> WalletSettings[MNOWalletSettingsPage.tsx]
    Main --> Transactions[MNOWalletTransactionsPage.tsx]
    Main --> Exchange[ExchangeRatePage.tsx]

    MobiSettings --> MobiModal[MobiAccountModal.tsx]
    WalletSettings --> WalletModal[MNOWalletModal.tsx]
    Transactions --> TransModal[MNOWalletTransactionModal.tsx]
    
    MobiSettings --> KPI[DashboardKPICard.tsx]
    WalletSettings --> KPI
    Transactions --> KPI

    MobiSettings -.-> Service[MobiAgentService.ts]
    WalletSettings -.-> Service
    Transactions -.-> Service
    Exchange -.-> Service
```

## 6. Database Schema (Firestore)

Recommended collection structure for the Mobi Agent feature.

- **mnoAccounts**: `{ id, name, country, mobileNumber, emoneyAmount, network, accountType, userId }`
- **mnoWallets**: `{ id, agentId, name, network, balance, userId }`
- **mnoTransactions**: `{ id, walletId, mnoWalletName, agentNumber, transactionType, amount, previousBalance, balance, date, clientPhone, clientName, userId }`
- **exchangeRates**: `{ id, fromCurrency, toCurrency, rate, updatedAt }`
