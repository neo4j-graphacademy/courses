CALL apoc.meta.nodeTypeProperties()
YIELD nodeType, propertyName, propertyTypes
WHERE nodeType = ":`Movie`" AND propertyName = "languages" AND propertyTypes = ["StringArray"]
return True as outcome
