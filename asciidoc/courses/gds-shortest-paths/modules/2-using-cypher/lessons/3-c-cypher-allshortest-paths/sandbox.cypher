MATCH (source:Airport {iata: 'BNA'}), (target:Airport {iata: 'HKT'})  
MATCH p=??????((source)-[:HAS_ROUTE*]->(target))
RETURN ??????(p) AS result