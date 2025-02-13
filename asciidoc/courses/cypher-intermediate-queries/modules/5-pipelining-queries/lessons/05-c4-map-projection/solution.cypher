MATCH (n:Movie)
WHERE n.imdbRating IS NOT NULL
WITH n {
  .title,
  .imdbRating,
  actors: [ (n)<-[:ACTED_IN]-(p) | p { .imdbId, .name } ],
  genres: [ (n)-[:IN_GENRE]->(g) | g {.name} ]
}
ORDER BY n.imdbRating DESC
LIMIT 10
RETURN collect(n)