CALL apoc.schema.nodes({labels:['Movie']}) yield  label, properties, type
WITH label+properties[0]+type as movie_const
WHERE type = 'NODE_PROPERTY_EXISTENCE'
CALL apoc.schema.nodes({labels:['User']}) yield  label, properties, type
WITH movie_const, label+properties[0]+type as user_const
WHERE type = 'NODE_PROPERTY_EXISTENCE'
WITH movie_const, user_const,
'MovietitleNODE_PROPERTY_EXISTENCE'+'UsernameNODE_PROPERTY_EXISTENCE' as const
RETURN movie_const+user_const = const as outcome