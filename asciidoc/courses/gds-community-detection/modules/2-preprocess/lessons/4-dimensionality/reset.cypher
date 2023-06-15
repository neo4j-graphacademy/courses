MATCH (p:Person)
SET p.PunctualityEncoding = CASE p['Punctuality']
   WHEN 'i am often running late' THEN 1
   WHEN 'i am often early' THEN 3
   WHEN 'i am always on time' THEN 5
   ELSE 3 END;
