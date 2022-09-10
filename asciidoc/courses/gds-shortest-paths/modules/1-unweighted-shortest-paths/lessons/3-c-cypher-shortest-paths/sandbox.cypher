MATCH (source:Airport {iata: 'LAX'}), (target:Airport {iata: 'HKT'})  
RETURN source, target