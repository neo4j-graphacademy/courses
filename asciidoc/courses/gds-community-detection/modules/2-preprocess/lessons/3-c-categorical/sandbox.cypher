MATCH (p:Person)
WITH p,
CASE p['Punctuality']
  // fill in how do options map to numerical values
  END AS punctuality
SET p.PunctualityEncoding = punctuality