/* First Run - only  createdAt and updatedAt will be set */
MERGE (m:Movie {title: 'Rocketman'})
/* perform the ON MATCH setting of the matchedAt property */
ON MATCH SET m.matchedAt = datetime()
/* perform the ON CREATE setting of the createdAt property */
ON CREATE SET m.createdAt = datetime()
/* set the updatedAt property */
SET m.updatedAt = timestamp()
RETURN m.title, m.createdAt, m.matchedAt, m.updatedAt;


/* Second Run - all three properties will be set */
MERGE (m:Movie {title: 'Rocketman'})
/* perform the ON MATCH setting of the matchedAt property */
ON MATCH SET m.matchedAt = datetime()
/* perform the ON CREATE setting of the createdAt property */
ON CREATE SET m.createdAt = datetime()
/* set the updatedAt property */
SET m.updatedAt = timestamp()
RETURN m.title, m.createdAt, m.matchedAt, m.updatedAt