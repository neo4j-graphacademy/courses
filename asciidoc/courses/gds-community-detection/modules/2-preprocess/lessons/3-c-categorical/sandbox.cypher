MATCH (p:Person)
SET p.PunctualityEncoding = CASE p['Punctuality']
  // Map the options to a numerical value
  // For example WHEN 'Something' THEN 1
  END
