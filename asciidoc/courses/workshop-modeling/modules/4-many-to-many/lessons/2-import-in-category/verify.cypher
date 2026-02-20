WITH COUNT {(:Category)} > 0 AS hasCategories,
     COUNT {()-[:IN_CATEGORY]->()} > 0 AS hasRelationships
RETURN hasCategories AND hasRelationships AS outcome,
       CASE
         WHEN NOT hasCategories THEN 'There must be one or more (:Category) nodes in the database. Check your spelling, node labels are case sensitive.'
         WHEN NOT hasRelationships THEN 'There must be one or more [:IN_CATEGORY] relationships in the database. Check your spelling, relationship types are case sensitive.'
         ELSE 'Import successful'
       END AS reason
