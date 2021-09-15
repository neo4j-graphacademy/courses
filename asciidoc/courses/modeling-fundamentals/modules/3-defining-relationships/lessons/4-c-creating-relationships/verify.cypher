MATCH (:User {name: 'Sandy Jones'})-[r1:RATED {rating:5}]->(:Movie {title: 'Apollo 13'})
MATCH (:User {name: 'Sandy Jones'})-[r2:RATED {rating:4}]->(:Movie {title: 'Sleepless in Seattle'})
MATCH (:User {name: 'Clinton Spencer'})-[r3:RATED {rating:3}]->(:Movie {title: 'Apollo 13'})
MATCH (:User {name: 'Clinton Spencer'})-[r4:RATED {rating:3}]->(:Movie {title: 'Sleepless in Seattle'})
MATCH (:User {name: 'Clinton Spencer'})-[r5:RATED {rating:3}]->(:Movie {title: 'Hoffa'})
WITH count(r1) + count(r2) + count(r3) + count(r4) + count(r5) as total
RETURN total = 5 AS outcome