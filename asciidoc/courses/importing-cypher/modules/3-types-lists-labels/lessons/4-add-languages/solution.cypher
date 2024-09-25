LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing-cypher/movies.csv' AS row
MERGE (m:Movie {movieId: toInteger(row.movieId)})
SET
m.tmdbId = toInteger(row.movie_tmdbId),
m.imdbId = toInteger(row.movie_imdbId),
m.released = date(row.released),
m.title = row.title,
m.year = toInteger(row.year),
m.plot = row.plot,
m.budget = toInteger(row.budget),
m.imdbRating = toFloat(row.imdbRating),
m.poster = row.poster,
m.runtime = toInteger(row.runtime),
m.imdbVotes = toInteger(row.imdbVotes),
m.revenue = toInteger(row.revenue),
m.url = row.url,
m.countries = split(row.countries, '|'),
m.languages = split(row.languages, '|')