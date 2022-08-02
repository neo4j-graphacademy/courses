WITH apoc.schema.node.indexExists('Movie',['year','imdbRating'])  AS movieIndex
RETURN movieIndex  as outcome