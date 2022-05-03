// calculate the duration in minutes
MATCH (x:Test)
RETURN duration.between(x.datetime1,x.datetime2).minutes