MATCH (p:Person {tmdbId: '194'})
return p.born.year + p.died.year = 3932 as outcome