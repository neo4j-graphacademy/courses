// calculate the duration
MATCH (x:Test)
RETURN duration.inDays(x.date1,x.date2).days