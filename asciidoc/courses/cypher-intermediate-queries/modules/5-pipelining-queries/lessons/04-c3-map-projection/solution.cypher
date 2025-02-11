MATCH (n:Movie)
WHERE n.imdbRating IS NOT NULL
WITH n {
  .title,
  .imdbRating,
  .plot,
  .released,
  .countries
}
ORDER BY n.imdbRating DESC
LIMIT 10
RETURN collect(n)