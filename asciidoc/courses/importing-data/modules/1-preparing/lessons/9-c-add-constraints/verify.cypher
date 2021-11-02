call db.constraints() yield details
  where details contains "Genre_name" OR
  details contains "Movie_movieId" OR
  details contains "Movie_tmdbId" OR
  details contains "Person_tmdbId" OR
  details contains "User_userId"
return count(*) = 5 as outcome