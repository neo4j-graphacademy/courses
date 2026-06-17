WITH COUNT {
       (:WorkOrder {id: 'WO-2026-0117'})-[:HAS_RECOMMENDATION]->(:Recommendation {action: 'repair'})
         -[:RECOMMENDS_PART]->(:Part {partNumber: 'IC-2042-B'})
     } AS goodRec,
     COUNT {
       (:WorkOrder {id: 'WO-2026-0117'})-[:HAS_RECOMMENDATION]->(:Recommendation)
         -[:BUNDLES_RECALL]->(:RecallNotice {id: 'RC-2021-04'})
     } AS recall,
     COUNT {
       (:WorkOrder {id: 'WO-2026-0117'})-[:HAS_RECOMMENDATION]->(:Recommendation)
         -[:GROUNDED_IN]->(:Section)
     } AS grounding
RETURN goodRec > 0 AND recall > 0 AND grounding > 0 AS outcome,
       CASE
           WHEN goodRec = 0
           THEN 'No repair Recommendation for WO-2026-0117 recommends IC-2042-B. Hand your agent the event per the skill, or check write_recommendation.py against its spec.'
           WHEN recall = 0
           THEN 'The recommendation exists but does not bundle recall RC-2021-04. Policy rule 4: always check recall exposure - re-run recall_exposure.py and add --recall.'
           WHEN grounding = 0
           THEN 'The recommendation cites no sections. Policy rule 1: a recommendation with no GROUNDED_IN section is invalid - add --grounding with the bulletin and recall sections.'
           ELSE 'Success! The agent decided, acted, and left a grounded, auditable trail.'
       END AS reason
