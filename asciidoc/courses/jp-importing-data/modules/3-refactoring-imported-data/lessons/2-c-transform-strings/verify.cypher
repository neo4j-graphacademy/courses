CALL apoc.meta.nodeTypeProperties( ) yield nodeType, propertyName, propertyTypes
WHERE nodeType = ':`Person`'
  AND (propertyName = 'born' OR propertyName = 'died')
WITH collect(propertyTypes) AS types
RETURN all(type IN types WHERE type = ['Date']) AS outcome
