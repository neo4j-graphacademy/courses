MATCH (n)
DETACH DELETE n;
MERGE (apollo:Movie {title: 'Apollo 13', tmdbId: 568, released: '1995-06-30', imdbRating: 7.6, genres: ['Drama', 'Adventure', 'IMAX']})
MERGE (tom:Person {name: 'Tom Hanks', tmdbId: 31, born: '1956-07-09'})
MERGE (meg:Person {name: 'Meg Ryan', tmdbId: 5344, born: '1961-11-19'})
MERGE (danny:Person {name: 'Danny DeVito', tmdbId: 518, born: '1944-11-17'})
MERGE (sleep:Movie {title: 'Sleepless in Seattle', tmdbId: 858, released: '1993-06-25', imdbRating: 6.8, genres: ['Comedy', 'Drama', 'Romance']})
MERGE (hoffa:Movie {title: 'Hoffa', tmdbId: 10410, released: '1992-12-25', imdbRating: 6.6, genres: ['Crime', 'Drama']})
MERGE (jack:Person {name: 'Jack Nicholson', tmdbId: 514, born: '1937-04-22'})
MERGE (sandy:User {name: 'Sandy Jones', userId: 534})
MERGE (clinton:User {name: 'Clinton Spencer', userId: 105})
MERGE (tom)-[:ACTED_IN {role: 'Jim Lovell'}]->(apollo)
MERGE (tom)-[:ACTED_IN {role: 'Sam Baldwin'}]->(sleep)
MERGE (meg)-[:ACTED_IN {role: 'Annie Reed'}]->(sleep)
MERGE (danny)-[:ACTED_IN {role: 'Bobby Ciaro'}]->(hoffa)
MERGE (danny)-[:DIRECTED]->(hoffa)
MERGE (jack)-[:ACTED_IN {role: 'Jimmy Hoffa'}]->(hoffa)
MERGE (sandy)-[:RATED {rating:5}]->(apollo)
MERGE (sandy)-[:RATED {rating:4}]->(sleep)
MERGE (clinton)-[:RATED {rating:3}]->(apollo)
MERGE (clinton)-[:RATED {rating:3}]->(sleep)
MERGE (clinton )-[:RATED {rating:3}]->(hoffa)
MERGE (casino:Movie {title: 'Casino', tmdbId: 524, released: '1995-11-22', imdbRating: 8.2, genres: ['Drama','Crime']})
MERGE (martin:Person {name: 'Martin Scorsese', tmdbId: 1032})
MERGE (martin)-[:DIRECTED]->(casino)
SET tom:Actor
SET meg:Actor
SET danny:Actor
SET jack:Actor
SET danny:Director
SET martin:Director
SET apollo.languages = ['English']
SET sleep.languages =  ['English']
SET hoffa.languages =  ['English', 'Italian', 'Latin']
SET casino.languages =  ['English'];
MATCH (m:Movie)
UNWIND m.languages AS language
WITH  language, collect(m) AS movies
MERGE (l:Language {name:language})
WITH l, movies
UNWIND movies AS m
WITH l,m
MERGE (m)-[:USES_LANGUAGE]->(l);
MATCH (m:Movie)
SET m.languages = null;
MATCH (m:Movie)
UNWIND m.genres AS genre
WITH  genre, collect(m) AS movies
MERGE (g:Genre {name:genre})
WITH g, movies
UNWIND movies AS m
WITH g,m
MERGE (m)-[:IN_GENRE]->(g);
MATCH (m:Movie)
SET m.genres = null;
MATCH (n:Actor)-[r:ACTED_IN]->(m:Movie)
CALL apoc.create.relationship(startNode(r),
'ACTED_IN_' + left(m.released,4),
{},
endNode(r) ) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`;
MATCH (n:Director)-[r:DIRECTED]->(m:Movie)
CALL apoc.create.relationship(startNode(r),
'DIRECTED_' + left(m.released,4),
{},
endNode(r) ) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`;
MATCH (n:User)-[r:RATED]->()
CALL apoc.create.relationship(startNode(r),
'RATED_' + toString(r.rating),
{},
endNode(r) ) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`