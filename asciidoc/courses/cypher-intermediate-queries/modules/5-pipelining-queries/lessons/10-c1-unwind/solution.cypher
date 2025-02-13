MATCH (m:Movie)
UNWIND m.countries AS country
WITH m, trim(country) AS trimmedCountry
WITH trimmedCountry, collect(m.title) AS movies
RETURN trimmedCountry, size(movies)