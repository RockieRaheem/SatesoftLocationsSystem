# Countries Management UML Diagrams

This document provides UML diagrams for the "Countries Management" system, designed to guide implementation and understanding of the module.

## 1. Use Case Diagram

The Use Case diagram illustrates how different actors (Admins, Super Users) interact with country-related data and configurations.

```mermaid
useCaseDiagram
    actor "Super User" as SU
    actor "Administrator" as Admin

    package "Countries Management" {
        usecase "View Countries List" as UC1
        usecase "Add New Country" as UC2
        usecase "Edit Country Details" as UC3
        usecase "Delete Country" as UC4
        usecase "Manage Admin Levels" as UC5
        usecase "Manage Electoral Levels" as UC6
        usecase "Manage Regional Economic Levels" as UC7
        usecase "View Country Profile" as UC8
        usecase "Configure Loyalty Program" as UC9
    }

    SU --> UC1
    SU --> UC2
    SU --> UC3
    SU --> UC4
    SU --> UC5
    SU --> UC6
    SU --> UC7
    SU --> UC8
    SU --> UC9

    Admin --> UC1
    Admin --> UC8
```

## 2. Class Diagram

The Class diagram defines the primary data models and their hierarchical relationships, specifically focusing on the nesting of administrative and economic levels.

```mermaid
classDiagram
    class Country {
        +int id
        +string name
        +string continent
        +string[] economicZones
        +string currency
        +string currencySymbol
        +string currencyCode
        +string countryCode
        +string phoneCode
        +float vat
        +int numberOfAdminLevels
        +int numberOfElectoralLevels
        +int numberOfEconomicLevels
        +AdminLevel[] adminLevels
        +AdminLevelName[] adminLevelNames
        +ElectoralLevelName[] electoralLevelNames
        +LoyaltyProgram loyaltyProgram
    }

    class AdminLevel {
        +int id
        +string name
        +int level
        +string countryCode
        +int parentAdminLevelId
    }

    class AdminLevelName {
        +int level
        +string name
    }

    class ElectoralLevelName {
        +int level
        +string name
    }

    class LoyaltyProgram {
        +boolean enabled
        +float earningThreshold
        +float redemptionValue
    }

    class RegionalEconomicLevel {
        +int id
        +string name
        +string abbreviation
        +string flag
        +string description
        +string[] countries
        +string color
    }

    Country "1" *-- "*" AdminLevel : contains
    Country "1" *-- "*" AdminLevelName : has names for
    Country "1" *-- "*" ElectoralLevelName : has names for
    Country "1" -- "1" LoyaltyProgram : configures
    RegionalEconomicLevel "*" -- "*" Country : groups
```

## 3. Sequence Diagram: Creating a Country and its Admin Levels

This diagram shows the process of adding a new country and subsequently defining its administrative hierarchy.

```mermaid
sequenceDiagram
    participant SU as Super User
    participant Page as CountriesPage
    participant AddModal as AddCountryModal
    participant AdminModal as AddAdminLevelModal
    participant Service as CountryService
    participant DB as Firestore

    SU->>Page: Click "Add Country"
    Page->>AddModal: Open
    SU->>AddModal: Enter Country Data
    SU->>AddModal: Click "Save"
    AddModal->>Page: onSave(countryData)
    Page->>Service: onAddCountry(countryData)
    Service->>DB: Set Country Document
    DB-->>Service: Success
    Service-->>Page: Country Created

    SU->>Page: Click "Add Admin Level"
    Page->>AdminModal: Open (Select Country)
    SU->>AdminModal: Enter Admin Level Data
    SU->>AdminModal: Click "Save"
    AdminModal->>Page: onSave(adminLevelData)
    Page->>Service: onUpdateCountry(updatedCountryWithLevel)
    Service->>DB: Update Country Document
    DB-->>Service: Success
```

## 4. Component Architecture

The hierarchy of components involved in the Countries management module.

```mermaid
graph TD
    Main[MainContent.tsx] --> Countries[CountriesPage.tsx]
    Main --> Profile[CountryProfilePage.tsx]
    Main --> AdminLevels[CountryAdminLevelsPage.tsx]
    Main --> ElectoralLevels[CountryElectoralLevelsPage.tsx]
    Main --> EconomicLevels[RegionalEconomicLevelsPage.tsx]

    Countries --> AddModal[AddCountryModal.tsx]
    Countries --> ViewModal[ViewCountryModal.tsx]
    Countries --> EditModal[EditCountryModal.tsx]
    Countries --> AdminModal[AddAdminLevelModal.tsx]
    
    Countries --> Summary[SummaryCard]
    Countries --> Filter[Filter Section]
    Countries --> Table[Countries Table]
```

## 5. Database Schema (Firestore)

The Firestore organization for country data.

- **countries**: `{ id, name, continent, economicZones[], currency, countryCode, vat, adminLevels[], adminLevelNames[], electoralLevelNames[], loyaltyProgram: {}, ... }`
- **regionalEconomicLevels**: `{ id, name, abbreviation, flag, description, countries[] }`
