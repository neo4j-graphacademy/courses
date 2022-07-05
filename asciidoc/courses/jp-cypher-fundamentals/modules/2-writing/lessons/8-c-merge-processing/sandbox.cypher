MERGE (m:Movie {title: 'Rocketman'})
// perform the ON MATCH setting of the matchedAt property
// perform the ON CREATE setting of the createdAt property
// set the updatedAt property
RETURN m