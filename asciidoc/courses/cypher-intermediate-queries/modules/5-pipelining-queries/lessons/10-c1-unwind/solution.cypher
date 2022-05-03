MATCH (m:Movie)
UNWIND m.countries AS country
WITH m, trim(country) AS trimmedCountry
// this automatically, makes the trimmedCountry distinct because it's a grouping key
WITH trimmedCountry, collect(m.title) AS movies
RETURN trimmedCountry, size(movies)