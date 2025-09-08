# Financial Workshop Dataset

This directory contains CSV files for the Modular GenAI Workshops 2025 financial dataset.

## Dataset Overview

The financial dataset simulates a comprehensive financial services ecosystem with:

- **Banking customers and accounts** (retail banking)
- **Public companies** (from SEC filings)
- **Asset managers and funds** (institutional investing)
- **Holdings data** (fund ownership of companies)
- **Transactions** (account-to-account transfers)

## Files Description

### customers.csv
- 15 retail banking customers
- Fields: customer_id, name, email, registration_date, credit_score, account_type
- Used for: Customer relationship management, credit analysis

### accounts.csv  
- 24 bank accounts (checking, savings, investment)
- Fields: account_id, customer_id, account_type, balance, open_date, status
- Used for: Account management, balance analysis

### transactions.csv
- 22 financial transactions (transfers, deposits, withdrawals)
- Fields: transaction_id, from_account, to_account, amount, transaction_date, transaction_type, description
- Used for: Transaction analysis, fraud detection patterns

### companies.csv
- 15 major public companies (FAANG, banks, blue chips)
- Fields: company_cik, company_name, ticker, sector, sic_code, market_cap
- Used for: Investment analysis, sector research

### asset_managers.csv
- 15 investment funds from major asset managers (BlackRock, Vanguard, Fidelity, State Street)
- Fields: fund_cik, fund_name, manager_name, assets_under_management, inception_date
- Used for: Fund analysis, institutional investment tracking

### holdings.csv
- 20 institutional holdings (which funds own which companies)
- Fields: fund_cik, company_cik, shares, market_value, report_date, quarter
- Used for: Ownership analysis, institutional flow tracking

## Graph Model

When imported into Neo4j, this data creates a rich financial knowledge graph:

```
(Customer)-[:HAS_ACCOUNT]->(Account)
(Account)-[:TRANSACTION_TO]->(Account)
(AssetManager)-[:MANAGES]->(Fund)
(Fund)-[:HOLDS]->(Company)
```

## Data Sources Inspiration

- **Customer/Account data**: Simulated retail banking data
- **Companies**: Real Fortune 500 companies with actual CIK numbers
- **Asset Managers**: Real institutional investors (BlackRock, Vanguard, etc.)
- **Holdings**: Realistic institutional ownership patterns

## Usage in Workshops

This dataset supports learning across all 6 modules:

1. **Graph Basics**: Explore customer-account relationships
2. **Structured Data**: Import CSV files using LOAD CSV and Data Importer
3. **Unstructured Data**: Analyze company descriptions and filing text
4. **Graph Analytics**: Detect transaction patterns, customer segmentation
5. **Retrievers**: Search for companies, funds, and financial metrics
6. **Agents**: Build financial advisory agents with graph knowledge

## File Sizes

All files are optimized for workshop use:
- Small enough for Data Importer (< 1MB each)
- Large enough to demonstrate meaningful patterns
- Realistic data relationships and distributions