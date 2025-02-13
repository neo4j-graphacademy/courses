MATCH (m:Movie)
UNWIND m.countries AS country
WITH m, trim(country) AS trimmedCountry
// Add a WHERE clause to filter the results to 'Switzerland'
WITH trimmedCountry, collect(m.title) AS movies
RETURN trimmedCountry, size(movies)