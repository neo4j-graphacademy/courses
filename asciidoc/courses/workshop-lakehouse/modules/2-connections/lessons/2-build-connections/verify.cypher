WITH COUNT { (:Table) } AS tables,
     COUNT { (:Column)-[:REFERENCES]->(:Column) } AS refs
RETURN tables = 6 AND refs = 5 AS outcome,
       CASE
           WHEN tables = 0
           THEN 'No Table nodes found. Run the connector: python connections/build_connections.py'
           WHEN tables <> 6
           THEN 'Found ' + toString(tables) + ' tables, expected 6. Re-run python connections/build_connections.py.'
           WHEN refs <> 5
           THEN 'Found ' + toString(refs) + ' REFERENCES edges, expected 5 (the foreign keys). Confirm the BigQuery dataset has its FK constraints, then re-run the connector.'
           ELSE 'Success! The connections graph is in place: 6 tables, 5 join paths.'
       END AS reason
