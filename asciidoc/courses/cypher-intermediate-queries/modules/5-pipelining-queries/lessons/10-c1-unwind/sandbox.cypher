MATCH (m:Movie)
UNWIND m.languages AS lang
WITH m, trim(lang) AS language
WITH language, collect(m.title) AS movies
RETURN language, size(movies)