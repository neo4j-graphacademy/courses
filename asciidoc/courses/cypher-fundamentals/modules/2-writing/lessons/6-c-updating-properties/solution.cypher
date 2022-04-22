MATCH (m:Movie {title: 'Get Out'})
SET  m.tagline = 'Gripping, scary, witty and timely!',
     m.released = 2017