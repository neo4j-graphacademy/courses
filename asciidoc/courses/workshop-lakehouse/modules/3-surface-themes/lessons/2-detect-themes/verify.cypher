WITH COUNT { (s:Section) WHERE s.communityId IS NOT NULL } AS tagged,
     COUNT { (:Section) } AS total
RETURN total > 0 AND tagged = total AS outcome,
       CASE
           WHEN total = 0
           THEN 'No Section nodes found. Complete the Module 2 challenges first.'
           WHEN tagged = 0
           THEN 'No Section nodes have a communityId property. Run Step 4 (gds.leiden.write).'
           WHEN tagged < total
           THEN 'Only ' + toString(tagged) + ' of ' + toString(total) + ' sections have a communityId. Re-run Step 4.'
           ELSE 'Success! All ' + toString(total) + ' sections carry a communityId.'
       END AS reason
