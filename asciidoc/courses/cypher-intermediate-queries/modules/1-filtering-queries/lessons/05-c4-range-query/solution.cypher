MATCH (p:Person)
WHERE p:Actor AND p:Director
  AND 1950 <= p.born.year < 1960
RETURN p.name, labels(p), p.born