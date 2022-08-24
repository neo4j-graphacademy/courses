MATCH (p:Person {tmdbId: '31'})-[r:ACTED_IN]->(m:Movie {movieId: '1'})
WHERE
p.imdbId = '158'
AND p.poster = 'https://image.tmdb.org/t/p/w440_and_h660_face/mKr8PN8sn80LzVaZMg8L52kmakm.jpg'
AND p.url = 'https://themoviedb.org/person/31'
AND m.tmdbId = '862'
AND m.imdbId = '114709'
AND m.poster = 'https://image.tmdb.org/t/p/w440_and_h660_face/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg'
AND m.url ='https://themoviedb.org/movie/862'
AND r.role = 'Woody (voice)'
WITH m.budget + m.imdbRating + m.imdbVotes + m.revenue + m.runtime + m.year  = 404147953.3 AS actedCheck
MATCH (p:Person {tmdbId: '1032'})-[:DIRECTED]->(m:Movie {movieId: '16'})
WITH actedCheck, count(*) = 1 AS directedCheck
MATCH (p:User {userId: '294'})-[r:RATED]->(m:Movie {movieId: '1'})
WITH actedCheck, directedCheck, r.rating + r.timestamp = 1047071653 as ratedCheck
MATCH (m:Movie {movieId: '10'})-[:IN_GENRE]->(g:Genre)
WITH size(m.languages) + size(m.countries)  = 5 AS listCheck, actedCheck, directedCheck, ratedCheck, count(g) = 3 as genreCheck
RETURN actedCheck AND directedCheck AND ratedCheck AND genreCheck as outcome