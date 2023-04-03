MATCH (m:Movie)
UNWIND m.countries AS country
WITH m, country
// this automatically, makes the country distinct because it's a grouping key
WITH country, collect(m.title) AS movies
RETURN country, size(movies)