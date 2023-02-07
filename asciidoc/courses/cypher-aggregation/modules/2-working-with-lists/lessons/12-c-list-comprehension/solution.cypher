MATCH (a:Actor)--(m:Movie)
WHERE m.title = 'Toy Story'
WITH  m, collect (a) AS Actors
RETURN [x IN Actors | date(m.released).year - x.born.year] AS Ages