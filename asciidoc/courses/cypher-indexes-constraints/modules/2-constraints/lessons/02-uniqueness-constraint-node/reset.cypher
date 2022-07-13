// drop all indexes and constraints
call apoc.schema.assert({},{},true)