MATCH (p:Person) WITH collect(p.name) AS people
MATCH (m:Movie) WITH people, collect(m.title) AS movies

RETURN all(m in ['Apollo 13', 'Sleepless in Seattle', 'Hoffa'] where m in movies)
    AND all(p in ['Tom Hanks', 'Meg Ryan', 'Danny DeVito', 'Jack Nicholson'] WHERE p in people) AS outcome