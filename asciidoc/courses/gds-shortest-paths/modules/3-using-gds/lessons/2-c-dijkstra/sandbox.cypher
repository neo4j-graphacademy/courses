MATCH (source:Airport {iata: 'BNA'}), (target:Airport {iata: 'HKT'})  
RETURN source, target