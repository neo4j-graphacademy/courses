CALL apoc.schema.nodes({labels:['Person']}) yield  label, properties, type
WITH label+properties[0]+type as person_const
CALL apoc.schema.nodes({labels:['User']}) yield  label, properties, type
WITH person_const, label+properties[0]+type as user_const
CALL apoc.schema.nodes({labels:['Genre']}) yield  label, properties, type
with person_const, user_const, label+properties[0]+type as genre_const,
'PersontmdbIdUNIQUENESS'+'UseruserIdUNIQUENESS'+'GenrenameUNIQUENESS' as const
RETURN person_const+user_const+genre_const = const as outcome