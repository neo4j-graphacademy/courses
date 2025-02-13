MERGE (x:Test {id: 1})
SET
x.date = date(),
x.datetime = datetime(),
x.timestamp = timestamp(),
x.date1 = date('2022-04-08'),
x.date2 = date('2022-09-20'),
x.datetime1 = datetime('2022-02-02T15:25:33'),
x.datetime2 = datetime('2022-02-02T22:06:12')
RETURN x