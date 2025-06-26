// CSV Import with LOAD CSV - Interactive Examples
// Module 2: Structured Data - Lesson 2

// Setup: Create constraints and indexes first
CREATE CONSTRAINT company_cik IF NOT EXISTS FOR (c:Company) REQUIRE c.cik IS UNIQUE;
CREATE CONSTRAINT filing_accession IF NOT EXISTS FOR (f:Filing) REQUIRE f.accession_number IS UNIQUE;
CREATE INDEX company_ticker IF NOT EXISTS FOR (c:Company) ON (c.ticker);

// Example 1: Basic LOAD CSV with headers
// Note: In sandbox, we'll create sample data to demonstrate the pattern
CREATE (c1:Company {cik: 320193, name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ"});
CREATE (c2:Company {cik: 789019, name: "Microsoft Corporation", ticker: "MSFT", exchange: "NASDAQ"});
CREATE (c3:Company {cik: 1018724, name: "Amazon.com Inc.", ticker: "AMZN", exchange: "NASDAQ"});

// Example 2: Create sample filings data
CREATE (f1:Filing {
  accession_number: "0000320193-24-000007",
  form_type: "10-K",
  filing_date: date("2024-01-26"),
  document_count: 45
});
CREATE (f2:Filing {
  accession_number: "0000789019-24-000008", 
  form_type: "10-K",
  filing_date: date("2024-02-15"),
  document_count: 52
});

// Example 3: Create relationships
MATCH (c:Company {cik: 320193}), (f:Filing {accession_number: "0000320193-24-000007"})
CREATE (c)-[:FILED {date: date("2024-01-26"), form_type: "10-K"}]->(f);

MATCH (c:Company {cik: 789019}), (f:Filing {accession_number: "0000789019-24-000008"})
CREATE (c)-[:FILED {date: date("2024-02-15"), form_type: "10-K"}]->(f);

// Example 4: Data type conversion examples
CREATE (am1:AssetManager {cik: 1067983, name: "Vanguard Total Stock Mkt Idx"});
CREATE (am2:AssetManager {cik: 1364742, name: "BlackRock Inc."});

// Example 5: Create holdings relationships with properties
MATCH (am:AssetManager {cik: 1067983}), (c:Company {cik: 320193})
CREATE (am)-[:HOLDS {
  shares: 159755771,
  market_value: 30524000000.0,
  report_date: date("2024-03-31"),
  quarter: "Q1-2024"
}]->(c);

MATCH (am:AssetManager {cik: 1364742}), (c:Company {cik: 320193})
CREATE (am)-[:HOLDS {
  shares: 1035000000,
  market_value: 198000000000.0,
  report_date: date("2024-03-31"),
  quarter: "Q1-2024"  
}]->(c);

// Example 6: Query the imported data
MATCH (c:Company)-[:FILED]->(f:Filing)
RETURN c.name, c.ticker, f.form_type, f.filing_date
ORDER BY f.filing_date DESC;

// Example 7: Holdings analysis
MATCH (am:AssetManager)-[h:HOLDS]->(c:Company)
RETURN am.name, c.name, c.ticker, h.market_value, h.shares
ORDER BY h.market_value DESC;

// Example 8: Data validation patterns
MATCH (c:Company)
WHERE c.ticker IS NOT NULL AND c.cik IS NOT NULL
RETURN count(c) AS valid_companies;

// Example 9: Aggregation on imported data
MATCH (am:AssetManager)-[h:HOLDS]->(c:Company)
RETURN am.name, 
       count(h) AS number_of_holdings,
       sum(h.market_value) AS total_portfolio_value
ORDER BY total_portfolio_value DESC;

// Example 10: Performance check
EXPLAIN MATCH (c:Company {ticker: "AAPL"})-[:FILED]->(f:Filing)
RETURN c.name, f.form_type, f.filing_date;