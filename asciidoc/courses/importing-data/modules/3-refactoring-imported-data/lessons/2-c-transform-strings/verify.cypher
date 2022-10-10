CALL apoc.meta.nodeTypeProperties( ) yield nodeType, propertyName, propertyTypes
WHERE nodeType = ':`Person`'
  AND (propertyName = 'born' OR propertyName = 'died')
WITH collect(propertyTypes) AS types
WITH types, all(type IN types WHERE type = ['Date']) AS o
return  o AND size(types) > 0 as outcome