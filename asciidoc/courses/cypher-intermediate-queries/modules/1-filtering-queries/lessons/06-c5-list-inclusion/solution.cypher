MATCH (m:Movie) 
WHERE "Jamaica" IN m.countries
RETURN m.title, m.countries 