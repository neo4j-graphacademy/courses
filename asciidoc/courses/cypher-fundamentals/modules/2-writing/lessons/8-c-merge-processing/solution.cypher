MERGE (m:Movie {title: 'Rocketman'})
ON CREATE SET m.createdAt = datetime()
ON MATCH SET m.updatedAt = datetime()
SET m.tagline = "The Only Way to Tell His Story is to live His Fantasy.",
    m.released = 2019
RETURN m